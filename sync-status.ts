import { supabaseAdmin } from "./supabase";
import { syncSale, syncExpense } from "./sheets";

export async function syncSaleAndMark(s:any){
  const db=supabaseAdmin();
  try { await syncSale(s); await db.from("sales").update({sheet_sync_status:"ok",sheet_sync_error:null}).eq("id",s.id); return "ok"; }
  catch(e:any){ await db.from("sales").update({sheet_sync_status:"failed",sheet_sync_error:String(e.message||e).slice(0,500)}).eq("id",s.id); return "failed"; }
}
export async function syncExpenseAndMark(e:any){
  const db=supabaseAdmin();
  try { await syncExpense(e); await db.from("expenses").update({sheet_sync_status:"ok",sheet_sync_error:null}).eq("id",e.id); return "ok"; }
  catch(err:any){ await db.from("expenses").update({sheet_sync_status:"failed",sheet_sync_error:String(err.message||err).slice(0,500)}).eq("id",e.id); return "failed"; }
}
