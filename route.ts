import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { calculateCommissions } from "@/lib/business";
import { supabaseAdmin } from "@/lib/supabase";
import { syncSaleAndMark } from "@/lib/sync-status";
import { sendTelegram } from "@/lib/telegram";

export async function POST(req:Request,{params}:{params:Promise<{ref:string}>}){
  try{
    const {ref}=await params; const b=await req.json(); await requireRole(String(b.actor||""),["manager"]);
    const db=supabaseAdmin(); const {data:sale,error}=await db.from("sales").select("*").eq("reference",ref.toUpperCase()).single();
    if(error||!sale) throw new Error("Sale not found.");
    if(sale.status==="Approved") return NextResponse.json({ok:true,already_approved:true,reference:sale.reference});
    const split={richard:Number(b.approved_richard),anastasia:Number(b.approved_anastasia),jean:Number(b.approved_jean)};
    const c=calculateCommissions(Number(sale.amount),split);
    const upd={approved_richard:split.richard,approved_anastasia:split.anastasia,approved_jean:split.jean,
      commission_pool:c.pool,commission_richard:c.richard,commission_anastasia:c.anastasia,commission_jean:c.jean,
      status:"Approved",manager_decided_at:new Date().toISOString()};
    const {data,error:ue}=await db.from("sales").update(upd).eq("id",sale.id).eq("status","Pending approval").select().single();
    if(ue||!data) throw new Error(ue?.message||"Sale was already changed.");
    const sync=await syncSaleAndMark(data);
    const changed=split.richard!==Number(sale.proposed_richard)||split.anastasia!==Number(sale.proposed_anastasia)||split.jean!==Number(sale.proposed_jean);
    let notification_status="no_recipient";
    if(data.original_telegram_chat_id){
      const msg=`Sale ${data.reference} approved${changed?" — commission split changed":""}. Sale €${Number(data.amount).toFixed(2)}; total commission €${c.pool.toFixed(2)}. Richard: ${Number(sale.proposed_richard)}% → ${split.richard}% (€${c.richard.toFixed(2)}). Anastasia: ${Number(sale.proposed_anastasia)}% → ${split.anastasia}% (€${c.anastasia.toFixed(2)}). Jean-Claude: ${Number(sale.proposed_jean)}% → ${split.jean}% (€${c.jean.toFixed(2)}).`;
      try{await sendTelegram(data.original_telegram_chat_id,msg);notification_status="sent";await db.from("sales").update({notification_status,notification_error:null}).eq("id",data.id);}
      catch(e:any){notification_status="failed";await db.from("sales").update({notification_status,notification_error:String(e.message||e).slice(0,500)}).eq("id",data.id);}
    } else await db.from("sales").update({notification_status:"no_recipient"}).eq("id",data.id);
    return NextResponse.json({ok:true,reference:data.reference,status:"Approved",sheet_sync_status:sync,notification_status,commission:c});
  }catch(e:any){return NextResponse.json({ok:false,error:e.message},{status:400});}
}
