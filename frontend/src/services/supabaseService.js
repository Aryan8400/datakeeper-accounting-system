import { supabase, appUrl } from "../lib/supabaseClient.js";

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export async function signUp({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/#/confirm-email`,
      data: {
        name,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/#/login`,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function resendConfirmationEmail(email) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${appUrl}/#/confirm-email`,
    },
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

// ============================================================================
// MATERIALS SERVICES
// ============================================================================

export async function getMaterials(userId) {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getMaterialById(id, userId) {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addMaterial({ userId, name, stockKg, initialStockKg, purchasePrice, sellingPrice }) {
  const id = `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase.from("materials").insert([
    {
      id,
      user_id: userId,
      name: name.trim(),
      stock_kg: Number(stockKg) || 0,
      initial_stock_kg: Number(initialStockKg) || 0,
      purchase_price: Number(purchasePrice) || 0,
      selling_price: Number(sellingPrice) || 0,
    },
  ]);

  if (error) throw new Error(error.message);
  return { id, user_id: userId, name, stock_kg: Number(stockKg), initial_stock_kg: Number(initialStockKg), purchase_price: Number(purchasePrice), selling_price: Number(sellingPrice) };
}

export async function updateMaterial(id, userId, updates) {
  const { data, error } = await supabase
    .from("materials")
    .update({
      ...(updates.name !== undefined && { name: updates.name.trim() }),
      ...(updates.stockKg !== undefined && { stock_kg: Number(updates.stockKg) }),
      ...(updates.purchasePrice !== undefined && { purchase_price: Number(updates.purchasePrice) }),
      ...(updates.sellingPrice !== undefined && { selling_price: Number(updates.sellingPrice) }),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMaterial(id, userId) {
  const { data, error } = await supabase
    .from("materials")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    if (error.message?.toLowerCase().includes("foreign key")) {
      throw new Error("Cannot delete material while sales exist. Delete related sales first.");
    }
    throw new Error(error.message);
  }

  return data;
}

// ============================================================================
// SALES SERVICES
// ============================================================================

export async function getSales(userId) {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getSaleById(id, userId) {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addSale({
  userId,
  customerName,
  materialId,
  materialName,
  quantityKg,
  ratePerKg,
  totalAmount,
  paidAmount,
  dueAmount,
}) {
  const id = `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase.from("sales").insert([
    {
      id,
      user_id: userId,
      material_id: materialId,
      customer_name: customerName.trim(),
      material_name: materialName,
      quantity_kg: Number(quantityKg),
      rate_per_kg: Number(ratePerKg),
      total_amount: Number(totalAmount),
      paid_amount: Number(paidAmount),
      due_amount: Number(dueAmount),
    },
  ]);

  if (error) throw new Error(error.message);
  return { id, user_id: userId, material_id: materialId, customer_name: customerName, material_name: materialName, quantity_kg: Number(quantityKg), rate_per_kg: Number(ratePerKg), total_amount: Number(totalAmount), paid_amount: Number(paidAmount), due_amount: Number(dueAmount) };
}

export async function updateSale(id, userId, updates) {
  const { data, error } = await supabase
    .from("sales")
    .update({
      ...(updates.customerName !== undefined && { customer_name: updates.customerName.trim() }),
      ...(updates.materialId !== undefined && { material_id: updates.materialId }),
      ...(updates.materialName !== undefined && { material_name: updates.materialName }),
      ...(updates.quantityKg !== undefined && { quantity_kg: Number(updates.quantityKg) }),
      ...(updates.ratePerKg !== undefined && { rate_per_kg: Number(updates.ratePerKg) }),
      ...(updates.totalAmount !== undefined && { total_amount: Number(updates.totalAmount) }),
      ...(updates.paidAmount !== undefined && { paid_amount: Number(updates.paidAmount) }),
      ...(updates.dueAmount !== undefined && { due_amount: Number(updates.dueAmount) }),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSale(id, userId) {
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// ============================================================================
// REALTIME SUBSCRIPTIONS (for live data)
// ============================================================================

export function subscribeMaterials(userId, callback) {
  return supabase
    .from("materials")
    .on("*", (payload) => {
      if (payload.new.user_id === userId || payload.old?.user_id === userId) {
        callback(payload);
      }
    })
    .subscribe();
}

export function subscribeSales(userId, callback) {
  return supabase
    .from("sales")
    .on("*", (payload) => {
      if (payload.new.user_id === userId || payload.old?.user_id === userId) {
        callback(payload);
      }
    })
    .subscribe();
}
