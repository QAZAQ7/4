"use client";
import { useEffect, useState } from "react";
type Any=any;
const roles=[["richard","Richard Darling"],["anastasia","Anastasia Ferrari"],["jean","Jean-Claude Bērziņš"],["kevin","Kevin von Whatever"],["svetlana","Svetlana de Monte Carlo"]];
const euro=(n:number)=>`€${Number(n||0).toFixed(2)}`;
export default function Home(){
  const [role,setRole]=useState("richard"),[d,setD]=useState<Any>(null),[message,setMessage]=useState("Ready.");
  const refresh=async()=>{const r=await fetch(`/api/dashboard?actor=${encodeURIComponent(role)}`,{cache:"no-store"});setD(await r.json())};
  useEffect(()=>{refresh()},[role]);
  async function post(url:string,payload:Any){const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...payload,actor:role})});const j=await r.json();setMessage(JSON.stringify(j,null,2));await refresh();return j}
  const formObj=(f:FormData)=>Object.fromEntries(f.entries());
  const links={telegram:process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL,google:process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL,github:process.env.NEXT_PUBLIC_GITHUB_URL};

  return <main>
    <section className="hero"><h1>Friends Included Ltd — Finance System</h1><p>Day 4 managerial accounting application · Denis Shuvayev</p><p className="small">Supabase is the source of truth. Website and Telegram use the same rules. Google Sheets is a synchronized review copy.</p></section>

    <div className="grid">
      <section className="card full"><h2>Demonstration role</h2>
        <select value={role} onChange={e=>setRole(e.target.value)}>{roles.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select>
        <p className="muted small">Permissions are enforced by the API, not only by hidden buttons.</p>
      </section>

      <section className="card"><h2>Submit sale</h2>
        <form action={async f=>{await post("/api/sales",formObj(f));}}>
          <div className="row2"><div><label>Reference</label><input name="reference" placeholder="S02" required/></div><div><label>Customer</label><input name="customer" required/></div></div>
          <div className="row2"><div><label>Project</label><select name="project"><option>A</option><option>B</option></select></div><div><label>Amount (€)</label><input name="amount" type="number" step="0.01" min="0.01" required/></div></div>
          <label>Description</label><textarea name="description" required/>
          <div className="row"><div><label>Richard %</label><input name="proposed_richard" type="number" required/></div><div><label>Anastasia %</label><input name="proposed_anastasia" type="number" required/></div><div><label>Jean-Claude %</label><input name="proposed_jean" type="number" required/></div></div>
          <button>Submit sale</button>
        </form>
      </section>

      <section className="card"><h2>Submit expense</h2>
        <form action={async f=>{await post("/api/expenses",formObj(f));}}>
          <div className="row2"><div><label>Reference</label><input name="reference" placeholder="E02" required/></div><div><label>Amount (€)</label><input name="amount" type="number" step="0.01" min="0.01" required/></div></div>
          <label>Description</label><textarea name="description" required/>
          <div className="row2"><div><label>Category</label><select name="category"><option>Materials</option><option>Travel</option><option>Other</option></select></div>
          <div><label>Proposed allocation</label><select name="proposed_allocation"><option>A</option><option>B</option><option>Company overhead</option></select></div></div>
          <button>Submit expense</button>
        </form>
      </section>

      {role==="svetlana" && d?.mode==="manager" && <>
        <section className="card third"><h2>Project A</h2><div className="kpi">{euro(d.projectA.result)}</div><p className="small muted">Income {euro(d.projectA.income)} · commissions {euro(d.projectA.commissions)} · allocated expenses {euro(d.projectA.allocated)}</p></section>
        <section className="card third"><h2>Project B</h2><div className="kpi">{euro(d.projectB.result)}</div><p className="small muted">Income {euro(d.projectB.income)} · commissions {euro(d.projectB.commissions)} · allocated expenses {euro(d.projectB.allocated)}</p></section>
        <section className="card third"><h2>Company result</h2><div className="kpi">{euro(d.company.result)}</div><p className="small muted">Overhead {euro(d.company.overhead)} · awaiting allocation {euro(d.company.awaiting)}</p></section>
        <section className="card full"><h2>Commission earned</h2><div className="row"><div><b>Richard</b><div className="kpi">{euro(d.commissions.richard)}</div></div><div><b>Anastasia</b><div className="kpi">{euro(d.commissions.anastasia)}</div></div><div><b>Jean-Claude</b><div className="kpi">{euro(d.commissions.jean)}</div></div></div></section>
      </>}

      {role==="svetlana" && <section className="card full"><h2>Manager controls</h2>
        <h3>Pending sales</h3>{d?.pendingSales?.length?d.pendingSales.map((s:Any)=><SaleApproval key={s.reference} s={s} onApprove={(p:Any)=>post(`/api/sales/${s.reference}/approve`,p)}/>):<p className="muted">No pending sales.</p>}
        <h3>Expenses awaiting allocation</h3>{d?.awaitingExpenses?.length?d.awaitingExpenses.map((e:Any)=><ExpenseApproval key={e.reference} e={e} onApprove={(p:Any)=>post(`/api/expenses/${e.reference}/approve`,p)}/>):<p className="muted">No expenses awaiting allocation.</p>}
      </section>}

      {role==="svetlana" && <section className="card"><h2>Telegram manager setup</h2>
        <form action={async f=>post("/api/telegram/link",formObj(f))}>
          <label>Employee</label><select name="employee_code">{roles.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select>
          <label>Telegram user ID</label><input name="telegram_user_id" required/>
          <label>Telegram chat ID</label><input name="telegram_chat_id" required/>
          <button>Link account</button>
        </form>
      </section>}

      {role==="svetlana" && <section className="card"><h2>Integration health</h2>
        <p>Sheets sync failures: <b className={d?.syncProblems?.length?"bad":"ok"}>{d?.syncProblems?.length||0}</b></p>
        {d?.syncProblems?.map((x:Any)=><div className="approval" key={x.kind+x.reference}><b>{x.reference}</b> <span className="bad">Sync failed</span><br/><span className="small muted">{x.sheet_sync_error}</span><br/><button className="ghost" onClick={()=>post(`/api/sync/${x.kind}/${x.reference}`,{})}>Retry same row</button></div>)}
        <p>Notification failures: <b className={d?.notificationProblems?.length?"bad":"ok"}>{d?.notificationProblems?.length||0}</b></p>
        {d?.notificationProblems?.map((x:Any)=><div className="approval" key={x.kind+x.reference}><b>{x.reference}</b> <span className="bad">Notification failed</span><br/><span className="small muted">{x.notification_error}</span><br/><button className="ghost" onClick={()=>post(`/api/retry-notification/${x.kind}/${x.reference}`,{})}>Retry notification</button></div>)}
      </section>}

      <section className="card full"><h2>{role==="svetlana"?"All records":"My submissions and statuses"}</h2>
        {(role==="svetlana"||role==="richard"||role==="anastasia"||role==="jean") && <>
          <h3>Sales</h3><RecordTable rows={role==="svetlana"?(d?.sales||[]):(d?.ownSales||[])} cols={["reference","source","salesperson_code","customer","project","amount","status","sheet_sync_status","notification_status"]}/>
        </>}
        {(role==="svetlana"||role==="kevin") && <>
          <h3>Expenses</h3><RecordTable rows={role==="svetlana"?(d?.expenses||[]):(d?.ownExpenses||[])} cols={["reference","source","reporter_code","description","category","amount","proposed_allocation","final_allocation","status","sheet_sync_status","notification_status"]}/>
        </>}
      </section>

      <section className="card full links"><h2>Submission links & instructions</h2>
        <p>{links.telegram?<a href={links.telegram}>Telegram bot</a>:<span className="warn">Telegram link not configured · </span>}
        {links.google?<a href={links.google}>Google Sheets</a>:<span className="warn">Google Sheets link not configured · </span>}
        {links.github?<a href={links.github}>GitHub repository</a>:<span className="warn">GitHub link not configured</span>}</p>
        <p className="muted">Use the Demonstration role selector. Richard, Anastasia and Jean-Claude submit sales. Kevin submits expenses. Svetlana reviews pending sales and expense allocations. Telegram uses the same stored records and rules.</p>
      </section>

      <section className="card full"><h2>System response</h2><div className="notice">{message}</div></section>
    </div>
  </main>
}
function SaleApproval({s,onApprove}:{s:Any,onApprove:(p:Any)=>void}){
  const [r,setR]=useState(String(s.proposed_richard)),[a,setA]=useState(String(s.proposed_anastasia)),[j,setJ]=useState(String(s.proposed_jean));
  return <div className="approval"><b>{s.reference}</b> · {s.customer} · Project {s.project} · {euro(s.amount)} <span className="pill">Pending approval</span>
    <div className="row"><div><label>Richard %</label><input value={r} onChange={e=>setR(e.target.value)}/></div><div><label>Anastasia %</label><input value={a} onChange={e=>setA(e.target.value)}/></div><div><label>Jean-Claude %</label><input value={j} onChange={e=>setJ(e.target.value)}/></div></div>
    <button onClick={()=>onApprove({approved_richard:Number(r),approved_anastasia:Number(a),approved_jean:Number(j)})}>Approve sale & final split</button>
  </div>
}
function ExpenseApproval({e,onApprove}:{e:Any,onApprove:(p:Any)=>void}){
  const [allocation,setAllocation]=useState(e.proposed_allocation);
  return <div className="approval"><b>{e.reference}</b> · {e.description} · {euro(e.amount)} <span className="pill">Awaiting allocation</span>
    <div className="row2"><div><label>Original proposal</label><input value={e.proposed_allocation} disabled/></div><div><label>Final allocation</label><select value={allocation} onChange={x=>setAllocation(x.target.value)}><option>A</option><option>B</option><option>Company overhead</option></select></div></div>
    <button onClick={()=>onApprove({final_allocation:allocation})}>Confirm allocation</button>
  </div>
}
function RecordTable({rows,cols}:{rows:Any[],cols:string[]}){
  return <div style={{overflowX:"auto"}}><table><thead><tr>{cols.map(c=><th key={c}>{c.replaceAll("_"," ")}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i}>{cols.map(c=><td key={c}>{String(r[c]??"")}</td>)}</tr>):<tr><td colSpan={cols.length} className="muted">No records yet.</td></tr>}</tbody></table></div>
}
