# Independent Agent Audit Checklist

1. Architecture
- Supabase is source of truth.
- Google Sheets is a review copy, not an input source.
- Website and Telegram use the same financial rules.

2. Roles
- Richard, Anastasia, Jean-Claude: sales only.
- Kevin: expenses only.
- Svetlana: approvals and corrections.
- API rejects unauthorized actions even if requests are crafted manually.
- Telegram sender is identified by Telegram user ID and cannot self-assign.

3. Sales
- required fields validated
- unique reference
- amount > 0
- proposed split totals 100%
- pending sales excluded from income and commissions
- approval preserves original proposal and stores final split
- commission pool = 10% of sale
- rounding difference goes to largest share; tie priority Richard, Anastasia, Jean-Claude
- repeat approval does not duplicate

4. Expenses
- every saved expense immediately reduces company result
- overhead auto-allocates
- A/B proposals wait for Svetlana
- awaiting allocations do not reduce project results
- allocation approval does not deduct company expense twice

5. Results
- Project = approved project sales - project commissions - allocated project expenses
- Company = all approved sales - all commissions - all recorded expenses
- Test 1 = A 700, B 1800, Company 2400
- Test 2 cumulative = A 2050, B 2180, Company 3930
- commissions = 140 / 175 / 215

6. Telegram
- S01 and E01 actually pass through bot
- confirmation only after DB save
- original chat ID stored per submission
- relinking does not alter old destination
- decision goes to original chat
- notification failure visible and retryable

7. Google Sheets
- Sales and Expenses tabs
- proposed and approved values separate
- update by reference, no duplicate row on approval/retry
- sync failure visible and retryable

8. Submission page
- Denis Shuvayev visible
- role selector, forms, manager controls, dashboard
- Telegram, Google Sheets, GitHub links
- brief instructions

9. Security
- no secrets in repository
- instructor = Viewer on sheet
- service account = Editor on sheet
