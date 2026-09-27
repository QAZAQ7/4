import { google } from "googleapis";

function client() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g,"\n");
  if (!email || !key) throw new Error("Google Sheets service account is not configured.");
  const auth = new google.auth.JWT({email, key, scopes:["https://www.googleapis.com/auth/spreadsheets"]});
  return google.sheets({version:"v4", auth});
}
function sheetId() {
  if (!process.env.GOOGLE_SHEETS_ID) throw new Error("GOOGLE_SHEETS_ID is missing.");
  return process.env.GOOGLE_SHEETS_ID;
}
async function ensureHeader(tab:string, headers:string[]) {
  const sheets=client(); const id=sheetId();
  const got=await sheets.spreadsheets.values.get({spreadsheetId:id,range:`${tab}!A1:Z1`});
  if (!(got.data.values?.[0]?.length)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId:id, range:`${tab}!A1`, valueInputOption:"RAW", requestBody:{values:[headers]}
    });
  }
}
async function upsert(tab:string, reference:string, headers:string[], row:any[]) {
  await ensureHeader(tab,headers);
  const sheets=client(); const id=sheetId();
  const got=await sheets.spreadsheets.values.get({spreadsheetId:id,range:`${tab}!A:Z`});
  const rows=got.data.values || [];
  const index=rows.findIndex((r,i)=>i>0 && String(r[0])===reference);
  if(index>=1){
    await sheets.spreadsheets.values.update({
      spreadsheetId:id,range:`${tab}!A${index+1}`,valueInputOption:"RAW",requestBody:{values:[row]}
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId:id,range:`${tab}!A:Z`,valueInputOption:"RAW",insertDataOption:"INSERT_ROWS",requestBody:{values:[row]}
    });
  }
}
export async function syncSale(s:any){
  const h=["Reference","Submission time","Source","Salesperson","Customer","Project","Description","Amount",
  "Proposed Richard %","Proposed Anastasia %","Proposed Jean-Claude %","Approved Richard %","Approved Anastasia %",
  "Approved Jean-Claude %","Richard earned commission","Anastasia earned commission","Jean-Claude earned commission","Status"];
  const r=[s.reference,s.submitted_at,s.source,s.salesperson_code,s.customer,s.project,s.description,Number(s.amount),
  Number(s.proposed_richard),Number(s.proposed_anastasia),Number(s.proposed_jean),s.approved_richard??"",s.approved_anastasia??"",
  s.approved_jean??"",Number(s.commission_richard||0),Number(s.commission_anastasia||0),Number(s.commission_jean||0),s.status];
  await upsert("Sales",s.reference,h,r);
}
export async function syncExpense(e:any){
  const h=["Reference","Submission time","Source","Reporter","Description","Category","Amount","Proposed allocation","Final allocation","Status"];
  const r=[e.reference,e.submitted_at,e.source,e.reporter_code,e.description,e.category,Number(e.amount),e.proposed_allocation,e.final_allocation??"",e.status];
  await upsert("Expenses",e.reference,h,r);
}
