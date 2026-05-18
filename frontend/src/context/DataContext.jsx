import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import {
  getMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  getSales,
  addSale,
  updateSale,
  deleteSale,
} from "../services/supabaseService.js";
import { calcDueAmount, calcProfit, calcSaleTotal, isLowStock } from "../utils/calculations.js";
import { groupSalesByDay, groupSalesByMonth } from "../utils/dateFilters.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [sales, setSales] = useState([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount or when user changes
  useEffect(() => {
    if (!user) {
      setMaterials([]);
      setSales([]);
      setReady(false);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [mats, sls] = await Promise.all([
          getMaterials(user.id),
          getSales(user.id),
        ]);
        setMaterials(mats);
        setSales(sls);
        setReady(true);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setMaterials([]);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let subscriptionActive = true;
    let retryCount = 0;
    const maxRetries = 3;

    const setupRealtimeSubscription = async () => {
      try {
        const channel = supabase
          .channel(`realtime-user-${user.id}`, {
            config: {
              broadcast: { self: false },
              presence: { key: user.id },
            },
          })
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "materials", filter: `user_id=eq.${user.id}` },
            async (payload) => {
              if (!subscriptionActive) return;
              try {
                const mats = await getMaterials(user.id);
                setMaterials(mats);
              } catch (err) {
                console.error("Realtime materials update failed:", err);
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "sales", filter: `user_id=eq.${user.id}` },
            async (payload) => {
              if (!subscriptionActive) return;
              try {
                const sls = await getSales(user.id);
                setSales(sls);
              } catch (err) {
                console.error("Realtime sales update failed:", err);
              }
            }
          )
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              retryCount = 0;
            } else if (status === "CHANNEL_ERROR" && retryCount < maxRetries) {
              retryCount++;
              setTimeout(() => {
                setupRealtimeSubscription();
              }, 2000 * retryCount);
            }
          });

        return channel;
      } catch (err) {
        console.error("Failed to setup realtime subscription:", err);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => {
            setupRealtimeSubscription();
          }, 2000 * retryCount);
        }
      }
    };

    let channel;
    setupRealtimeSubscription().then((ch) => {
      channel = ch;
    });

    return () => {
      subscriptionActive = false;
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user]);

  const addMaterialHandler = useCallback(
    async (data) => {
      if (!user) throw new Error("User not authenticated");
      try {
        const material = await addMaterial({
          userId: user.id,
          name: data.name,
          stockKg: data.stockKg,
          initialStockKg: data.stockKg,
          purchasePrice: data.purchasePrice,
          sellingPrice: data.sellingPrice,
        });
        // Immediately add to state for instant feedback
        setMaterials((prev) => [material, ...prev]);
        // Refresh from server to ensure consistency
        setTimeout(async () => {
          try {
            const updated = await getMaterials(user.id);
            setMaterials(updated);
          } catch (err) {
            console.error("Failed to refresh materials after add:", err);
          }
        }, 500);
        return material;
      } catch (err) {
        throw new Error(err.message || "Failed to add material");
      }
    },
    [user]
  );

  const updateMaterialHandler = useCallback(
    async (id, data) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await updateMaterial(id, user.id, data);
        // Immediately update state for instant feedback
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  name: data.name?.trim() ?? m.name,
                  stock_kg: data.stockKg !== undefined ? Number(data.stockKg) : m.stock_kg,
                  purchase_price:
                    data.purchasePrice !== undefined ? Number(data.purchasePrice) : m.purchase_price,
                  selling_price:
                    data.sellingPrice !== undefined ? Number(data.sellingPrice) : m.selling_price,
                }
              : m
          )
        );
        // Refresh from server to ensure consistency
        setTimeout(async () => {
          try {
            const updated = await getMaterials(user.id);
            setMaterials(updated);
          } catch (err) {
            console.error("Failed to refresh materials after update:", err);
          }
        }, 500);
      } catch (err) {
        throw new Error(err.message || "Failed to update material");
      }
    },
    [user]
  );

  const deleteMaterialHandler = useCallback(
    async (id) => {
      if (!user) throw new Error("User not authenticated");
      try {
        await deleteMaterial(id, user.id);
        // Immediately remove from state for instant feedback
        setMaterials((prev) => prev.filter((m) => m.id !== id));
        // Refresh from server to ensure consistency
        setTimeout(async () => {
          try {
            const updated = await getMaterials(user.id);
            setMaterials(updated);
          } catch (err) {
            console.error("Failed to refresh materials after delete:", err);
          }
        }, 500);
      } catch (err) {
        throw new Error(err.message || "Failed to delete material");
      }
    },
    [user]
  );

  const addSaleHandler = useCallback(
    async ({ customerName, materialId, quantityKg, ratePerKg, paidAmount }) => {
      if (!user) throw new Error("User not authenticated");
      try {
        const material = materials.find((m) => m.id === materialId);
        if (!material) throw new Error("Material not found.");
        const qty = Number(quantityKg);
        if (qty <= 0) throw new Error("Quantity must be greater than 0.");
        if (qty > material.stock_kg) throw new Error(`Insufficient stock. Available: ${material.stock_kg} KG`);

        const rate = Number(ratePerKg);
        const totalAmount = calcSaleTotal(qty, rate);
        const paid = Number(paidAmount) || 0;
        if (paid > totalAmount) {
          throw new Error("Paid amount cannot exceed total sale amount.");
        }
        const dueAmount = calcDueAmount(totalAmount, paid);

        const sale = await addSale({
          userId: user.id,
          customerName,
          materialId,
          materialName: material.name,
          quantityKg: qty,
          ratePerKg: rate,
          totalAmount,
          paidAmount: paid,
          dueAmount,
        });

        // Persist stock decrement in the database
        await updateMaterial(materialId, user.id, {
          stockKg: material.stock_kg - qty,
        });

        // Immediately update state for instant feedback
        setSales((prev) => [sale, ...prev]);
        setMaterials((prev) =>
          prev.map((m) => (m.id === materialId ? { ...m, stock_kg: m.stock_kg - qty } : m))
        );

        // Refresh from server to ensure consistency
        try {
          const [updatedMaterials, updatedSales] = await Promise.all([
            getMaterials(user.id),
            getSales(user.id),
          ]);
          setMaterials(updatedMaterials);
          setSales(updatedSales);
        } catch (err) {
          console.error("Failed to refresh data after adding sale:", err);
        }

        return sale;
      } catch (err) {
        throw new Error(err.message || "Failed to add sale");
      }
    },
    [user, materials]
  );

  const addMultipleSalesHandler = useCallback(
    async (salesData, paidAmount = 0) => {
      if (!user) throw new Error("User not authenticated");
      try {
        // Validate all items and check stock
        let totalQtyByMaterial = {};
        const salesWithTotals = salesData.map((item) => {
          const material = materials.find((m) => m.id === item.materialId);
          if (!material) throw new Error(`Material not found: ${item.materialId}`);

          const qty = Number(item.quantityKg);
          if (qty <= 0) throw new Error("Quantity must be greater than 0.");

          totalQtyByMaterial[item.materialId] = (totalQtyByMaterial[item.materialId] || 0) + qty;
          if (totalQtyByMaterial[item.materialId] > material.stock_kg) {
            throw new Error(
              `Insufficient stock for ${material.name}. Need ${totalQtyByMaterial[item.materialId]} KG, available: ${material.stock_kg} KG`
            );
          }

          const rate = Number(item.ratePerKg);
          const totalAmount = calcSaleTotal(qty, rate);

          return {
            ...item,
            quantityKg: qty,
            ratePerKg: rate,
            totalAmount,
          };
        });

        // Calculate grand total
        const grandTotal = salesWithTotals.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalPaid = Number(paidAmount) || 0;
        if (totalPaid > grandTotal) {
          throw new Error("Paid amount cannot exceed total sale amount.");
        }
        const dueAmount = calcDueAmount(grandTotal, totalPaid);

        // Assign paid amount to each item proportionally, then create all sales
        const salesWithPayment = salesWithTotals.map((item) => {
          const share = grandTotal > 0 ? item.totalAmount / grandTotal : 0;
          return {
            ...item,
            paidAmount: Number((totalPaid * share).toFixed(2)),
          };
        });
        const paymentRemainder = totalPaid - salesWithPayment.reduce((sum, item) => sum + item.paidAmount, 0);
        if (salesWithPayment.length > 0 && paymentRemainder !== 0) {
          salesWithPayment[salesWithPayment.length - 1].paidAmount += paymentRemainder;
        }

        const createdSales = [];
        // Track changes per material so DB updates are batched after creation
        const stockUpdates = new Map();

        for (const item of salesWithPayment) {
          const salePaid = item.paidAmount;
          const saleDue = calcDueAmount(item.totalAmount, salePaid);
          const sale = await addSale({
            userId: user.id,
            customerName: item.customerName,
            materialId: item.materialId,
            materialName: item.materialName,
            quantityKg: item.quantityKg,
            ratePerKg: item.ratePerKg,
            totalAmount: item.totalAmount,
            paidAmount: salePaid,
            dueAmount: saleDue,
          });
          createdSales.push(sale);

          stockUpdates.set(
            item.materialId,
            (stockUpdates.get(item.materialId) || 0) + item.quantityKg
          );
        }

        // Update materials stock in the database
        for (const [materialId, qtySold] of stockUpdates.entries()) {
          const material = materials.find((m) => m.id === materialId);
          if (material) {
            await updateMaterial(materialId, user.id, {
              stockKg: material.stock_kg - qtySold,
            });
          }
        }

        // Update materials stock locally
        let updatedMaterials = [...materials];
        for (const item of salesWithTotals) {
          updatedMaterials = updatedMaterials.map((m) =>
            m.id === item.materialId ? { ...m, stock_kg: m.stock_kg - item.quantityKg } : m
          );
        }

        // Update state immediately
        setSales((prev) => [...createdSales, ...prev]);
        setMaterials(updatedMaterials);

        // Refresh from server to ensure consistency
        try {
          const [newMaterials, newSales] = await Promise.all([
            getMaterials(user.id),
            getSales(user.id),
          ]);
          setMaterials(newMaterials);
          setSales(newSales);
        } catch (err) {
          console.error("Failed to refresh data after adding multiple sales:", err);
        }

        return createdSales;
      } catch (err) {
        throw new Error(err.message || "Failed to add sales");
      }
    },
    [user, materials]
  );

  const updateSaleHandler = useCallback(
    async (id, updates) => {
      if (!user) throw new Error("User not authenticated");
      try {
        const sale = sales.find((s) => s.id === id);
        if (!sale) throw new Error("Sale not found.");

        const oldMaterial = materials.find((m) => m.id === sale.material_id);
        const newMaterialId = updates.materialId !== undefined ? updates.materialId : sale.material_id;
        const newMaterial = materials.find((m) => m.id === newMaterialId);
        if (!newMaterial) throw new Error("Material not found.");

        const qty = updates.quantityKg !== undefined ? Number(updates.quantityKg) : sale.quantity_kg;
        if (qty <= 0) throw new Error("Quantity must be greater than 0.");

        const rate = updates.ratePerKg !== undefined ? Number(updates.ratePerKg) : sale.rate_per_kg;
        const paid = updates.paidAmount !== undefined ? Number(updates.paidAmount) : sale.paid_amount;
        const totalAmount = calcSaleTotal(qty, rate);
        if (paid > totalAmount) {
          throw new Error("Paid amount cannot exceed total sale amount.");
        }
        const dueAmount = calcDueAmount(totalAmount, paid);

        if (oldMaterial?.id === newMaterial.id) {
          const deltaQty = qty - sale.quantity_kg;
          if (deltaQty > 0 && deltaQty > newMaterial.stock_kg) {
            throw new Error(`Insufficient stock. Available: ${newMaterial.stock_kg} KG`);
          }

          if (deltaQty !== 0) {
            setMaterials((prev) =>
              prev.map((m) =>
                m.id === newMaterial.id ? { ...m, stock_kg: m.stock_kg - deltaQty } : m
              )
            );
          }
        } else {
          if (!oldMaterial) throw new Error("Original material not found.");
          if (qty > newMaterial.stock_kg) {
            throw new Error(`Insufficient stock. Available: ${newMaterial.stock_kg} KG`);
          }

          setMaterials((prev) =>
            prev.map((m) => {
              if (m.id === oldMaterial.id) {
                return { ...m, stock_kg: m.stock_kg + sale.quantity_kg };
              }
              if (m.id === newMaterial.id) {
                return { ...m, stock_kg: m.stock_kg - qty };
              }
              return m;
            })
          );
        }

        // Immediately update state for instant feedback
        setSales((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  customer_name: updates.customerName?.trim() ?? s.customer_name,
                  material_id: newMaterialId,
                  material_name: newMaterial.name,
                  quantity_kg: qty,
                  rate_per_kg: rate,
                  total_amount: totalAmount,
                  paid_amount: paid,
                  due_amount: dueAmount,
                }
              : s
          )
        );

        // Update database
        await updateSale(id, user.id, {
          customerName: updates.customerName,
          materialId: newMaterialId,
          materialName: newMaterial.name,
          quantityKg: qty,
          ratePerKg: rate,
          totalAmount,
          paidAmount: paid,
          dueAmount,
        });

        // Refresh from server to ensure consistency
        try {
          const [updatedMaterials, updatedSales] = await Promise.all([
            getMaterials(user.id),
            getSales(user.id),
          ]);
          setMaterials(updatedMaterials);
          setSales(updatedSales);
        } catch (err) {
          console.error("Failed to refresh data after updating sale:", err);
        }
      } catch (err) {
        throw new Error(err.message || "Failed to update sale");
      }
    },
    [user, sales, materials]
  );

  const deleteSaleHandler = useCallback(
    async (id) => {
      if (!user) throw new Error("User not authenticated");
      try {
        const sale = sales.find((s) => s.id === id);
        if (!sale) throw new Error("Sale not found.");

        const material = materials.find((m) => m.id === sale.material_id);
        if (!material) throw new Error("Material not found.");

        // Immediately update state for instant feedback
        setSales((prev) => prev.filter((s) => s.id !== id));
        setMaterials((prev) =>
          prev.map((m) => (m.id === material.id ? { ...m, stock_kg: m.stock_kg + sale.quantity_kg } : m))
        );

        // Delete from database
        await deleteSale(id, user.id);

        // Refresh from server to ensure consistency
        try {
          const [updatedMaterials, updatedSales] = await Promise.all([
            getMaterials(user.id),
            getSales(user.id),
          ]);
          setMaterials(updatedMaterials);
          setSales(updatedSales);
        } catch (err) {
          console.error("Failed to refresh data after deleting sale:", err);
        }
      } catch (err) {
        throw new Error(err.message || "Failed to delete sale");
      }
    },
    [user, sales, materials]
  );

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((s, x) => s + x.total_amount, 0);
    const totalDue = sales.reduce((s, x) => s + x.due_amount, 0);
    const totalProfit = sales.reduce((s, sale) => {
      const mat = materials.find((m) => m.id === sale.material_id);
      const buyPrice = mat?.purchase_price ?? 0;
      return s + calcProfit(sale.quantity_kg, sale.rate_per_kg, buyPrice);
    }, 0);
    const totalStockKg = materials.reduce((s, m) => s + m.stock_kg, 0);
    const lowStockItems = materials.filter((m) => isLowStock(m.stock_kg, m.initial_stock_kg));

    return {
      totalSales: sales.length,
      totalRevenue,
      totalProfit,
      totalStockKg,
      totalDue,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    };
  }, [sales, materials]);

  const chartData = useMemo(
    () => ({
      dailySales: groupSalesByDay(
        sales.map((s) => ({
          ...s,
          totalAmount: s.total_amount,
          dueAmount: s.due_amount,
          quantityKg: s.quantity_kg,
          ratePerKg: s.rate_per_kg,
          createdAt: s.created_at,
        }))
      ),
      monthlyRevenue: groupSalesByMonth(
        sales.map((s) => ({
          ...s,
          totalAmount: s.total_amount,
          createdAt: s.created_at,
        }))
      ),
      stockOverview: materials.map((m) => ({
        name: m.name.length > 18 ? `${m.name.slice(0, 16)}…` : m.name,
        stock: m.stock_kg,
        fullName: m.name,
      })),
    }),
    [sales, materials]
  );

  const getMaterialById = useCallback(
    (id) => materials.find((m) => m.id === id),
    [materials]
  );

  const formattedSales = useMemo(
    () =>
      sales.map((s) => ({
        ...s,
        customerName: s.customer_name,
        materialId: s.material_id,
        materialName: s.material_name,
        quantityKg: s.quantity_kg,
        ratePerKg: s.rate_per_kg,
        totalAmount: s.total_amount,
        paidAmount: s.paid_amount,
        dueAmount: s.due_amount,
        createdAt: s.created_at,
      })),
    [sales]
  );

  const recentSales = useMemo(() => formattedSales.slice(0, 8), [formattedSales]);

  return (
    <DataContext.Provider
      value={{
        materials: materials.map((m) => ({
          ...m,
          stockKg: m.stock_kg,
          initialStockKg: m.initial_stock_kg,
          purchasePrice: m.purchase_price,
          sellingPrice: m.selling_price,
          createdAt: m.created_at,
        })),
        sales: formattedSales,
        stats,
        chartData,
        ready,
        loading,
        addMaterial: addMaterialHandler,
        updateMaterial: updateMaterialHandler,
        deleteMaterial: deleteMaterialHandler,
        addSale: addSaleHandler,
        addMultipleSales: addMultipleSalesHandler,
        updateSale: updateSaleHandler,
        deleteSale: deleteSaleHandler,
        getMaterialById,
        recentSales,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
