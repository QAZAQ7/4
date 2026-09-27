import { supabaseAdmin } from "./supabase";

export async function employeeByCode(code: string) {
  const { data, error } = await supabaseAdmin().from("employees").select("*").eq("code", code).single();
  if (error || !data) throw new Error("Unknown demonstration role.");
  return data;
}
export async function requireRole(code: string, allowed: string[]) {
  const e = await employeeByCode(code);
  if (!allowed.includes(e.role)) throw new Error("Permission denied.");
  return e;
}
export async function employeeByTelegramUserId(id: number) {
  const { data, error } = await supabaseAdmin().from("employees").select("*").eq("telegram_user_id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
