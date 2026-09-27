export type Split = { richard: number; anastasia: number; jean: number };

export function money(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }

export function validateSplit(s: Split) {
  const values = [s.richard, s.anastasia, s.jean];
  if (values.some(v => !Number.isFinite(v) || v < 0 || v > 100)) throw new Error("Each commission share must be between 0% and 100%.");
  if (Math.abs(values.reduce((a,b)=>a+b,0)-100) > 0.001) throw new Error("Commission shares must total 100%.");
}

export function calculateCommissions(amount: number, split: Split) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Sale amount must be greater than zero.");
  validateSplit(split);
  const pool = money(amount * 0.10);
  const c = {
    richard: money(pool * split.richard / 100),
    anastasia: money(pool * split.anastasia / 100),
    jean: money(pool * split.jean / 100)
  };
  const difference = money(pool - c.richard - c.anastasia - c.jean);
  if (difference !== 0) {
    const max = Math.max(split.richard, split.anastasia, split.jean);
    const priority: (keyof Split)[] = ["richard","anastasia","jean"];
    const recipient = priority.find(k => split[k] === max)!;
    c[recipient] = money(c[recipient] + difference);
  }
  return { pool, ...c };
}

export function initialExpenseState(allocation: string) {
  if (!["A","B","Company overhead"].includes(allocation)) throw new Error("Invalid expense allocation.");
  return allocation === "Company overhead"
    ? { status: "Allocated", final_allocation: "Company overhead" }
    : { status: "Awaiting allocation", final_allocation: null };
}

export function cleanRef(v: unknown) {
  const ref = String(v ?? "").trim().toUpperCase();
  if (!ref) throw new Error("Reference is required.");
  return ref;
}

export function positiveAmount(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error("Amount must be greater than zero.");
  return money(n);
}
