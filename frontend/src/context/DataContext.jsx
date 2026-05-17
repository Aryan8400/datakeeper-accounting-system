import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { INITIAL_MATERIALS, INITIAL_SALES } from "../services/dummyData.js";
import { storage } from "../services/storageService.js";
import { calcDueAmount, calcProfit, calcSaleTotal, isLowStock } from "../utils/calculations.js";
import { groupSalesByDay, groupSalesByMonth } from "../utils/dateFilters.js";

const DataContext = createContext(null);

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DataProvider({ children }) {
  const [materials, setMaterials] = useState([]);
  const [sales, setSales] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mats = storage.getMaterials(INITIAL_MATERIALS);
    const sls = storage.getSales(INITIAL_SALES);
    setMaterials(mats);
    setSales(sls);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) storage.setMaterials(materials);
  }, [materials, ready]);

  useEffect(() => {
    if (ready) storage.setSales(sales);
  }, [sales, ready]);

  const addMaterial = useCallback((data) => {
    const stockKg = Number(data.stockKg) || 0;
    const item = {
      id: generateId("mat"),
      name: data.name.trim(),
      stockKg,
      initialStockKg: stockKg,
      purchasePrice: Number(data.purchasePrice) || 0,
      sellingPrice: Number(data.sellingPrice) || 0,
      createdAt: new Date().toISOString(),
    };
    setMaterials((prev) => [...prev, item]);
    return item;
  }, []);

  const updateMaterial = useCallback((id, data) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              name: data.name?.trim() ?? m.name,
              stockKg: data.stockKg !== undefined ? Number(data.stockKg) : m.stockKg,
              purchasePrice:
                data.purchasePrice !== undefined ? Number(data.purchasePrice) : m.purchasePrice,
              sellingPrice:
                data.sellingPrice !== undefined ? Number(data.sellingPrice) : m.sellingPrice,
            }
          : m
      )
    );
  }, []);

  const deleteMaterial = useCallback((id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addSale = useCallback(
    ({ customerName, materialId, quantityKg, ratePerKg, paidAmount }) => {
      const material = materials.find((m) => m.id === materialId);
      if (!material) throw new Error("Material not found.");
      const qty = Number(quantityKg);
      if (qty <= 0) throw new Error("Quantity must be greater than 0.");
      if (qty > material.stockKg) throw new Error(`Insufficient stock. Available: ${material.stockKg} KG`);

      const rate = Number(ratePerKg);
      const totalAmount = calcSaleTotal(qty, rate);
      const paid = Number(paidAmount) || 0;
      const dueAmount = calcDueAmount(totalAmount, paid);

      const sale = {
        id: generateId("sale"),
        customerName: customerName.trim(),
        materialId,
        materialName: material.name,
        quantityKg: qty,
        ratePerKg: rate,
        totalAmount,
        paidAmount: paid,
        dueAmount,
        createdAt: new Date().toISOString(),
      };

      setSales((prev) => [sale, ...prev]);
      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? { ...m, stockKg: m.stockKg - qty } : m))
      );
      return sale;
    },
    [materials]
  );

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((s, x) => s + x.totalAmount, 0);
    const totalDue = sales.reduce((s, x) => s + x.dueAmount, 0);
    const totalProfit = sales.reduce((s, sale) => {
      const mat = materials.find((m) => m.id === sale.materialId);
      const buyPrice = mat?.purchasePrice ?? 0;
      return s + calcProfit(sale.quantityKg, sale.ratePerKg, buyPrice);
    }, 0);
    const totalStockKg = materials.reduce((s, m) => s + m.stockKg, 0);
    const lowStockItems = materials.filter((m) => isLowStock(m.stockKg, m.initialStockKg));

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
      dailySales: groupSalesByDay(sales),
      monthlyRevenue: groupSalesByMonth(sales),
      stockOverview: materials.map((m) => ({
        name: m.name.length > 18 ? `${m.name.slice(0, 16)}…` : m.name,
        stock: m.stockKg,
        fullName: m.name,
      })),
    }),
    [sales, materials]
  );

  const getMaterialById = useCallback((id) => materials.find((m) => m.id === id), [materials]);

  return (
    <DataContext.Provider
      value={{
        materials,
        sales,
        stats,
        chartData,
        ready,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addSale,
        getMaterialById,
        recentSales: sales.slice(0, 8),
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
