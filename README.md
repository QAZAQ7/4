# Friends Included Ltd — submission-ready implementation

Student: Denis Shuvayev

This project implements the Day 4 "Wedding Guests for Hire" requirement:
- Telegram bot submissions and confirmations
- Supabase as source of truth
- Vercel-hosted website with demonstration roles
- manager approvals/corrections
- financial dashboard
- Google Sheets automatic two-tab synchronization
- retry logic for failed Sheets updates
- retry logic for failed Telegram decision notifications
- backend permission checks and duplicate prevention

## Setup — do this in order

### 1) Supabase
Create a Supabase project. Run `supabase/schema.sql` in SQL Editor.
Copy Project URL and service-role key to Vercel environment variables.

### 2) Google Sheets
Create one spreadsheet with exactly two tabs: `Sales` and `Expenses`.
Create a Google Cloud service account, enable Google Sheets API, and share the spreadsheet with the service-account email as Editor.
Give instructor Viewer access. Do not give public edit access.
Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEETS_ID`.

### 3) Telegram
Create a bot in BotFather and set `TELEGRAM_BOT_TOKEN`.
Choose a long random `TELEGRAM_WEBHOOK_SECRET`.
After deployment call:
`https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<APP>.vercel.app/api/telegram/webhook&secret_token=<SECRET>`

Start the bot in a private chat.

### 4) GitHub + Vercel
Push this project to GitHub. Import the repository into Vercel.
Set all environment variables from `.env.example`.
Also set public links for Telegram, Google Sheets and GitHub so the final page displays them.

### 5) Link Telegram identities
Open the website as `Svetlana de Monte Carlo`.
Use "Telegram manager setup" to link your Telegram user ID and chat ID to the fictional employee needed for each bot test.
The bot itself does not permit self-assigned roles.

## Telegram commands

S01 as Richard:
`/sale | S01 | Olivia Rose | A | One proud uncle and an emotional grandmother | 1000 | 50 | 30 | 20`

E01 as Kevin:
`/expense | E01 | Rented suit and fake pearl necklace for the relatives | Materials | 120 | A`

## Acceptance test 1
Start with no practice transactions.

Telegram:
- S01 Richard, Olivia Rose, A, €1000, 50/30/20
- E01 Kevin, Materials, €120, A

Website:
- S02 Anastasia, Daniel King, B, €2000, 0/50/50
- E02 Kevin, Travel, €80, proposed B
- E03 Kevin, Other, €100, Company overhead

Before manager decisions:
- both sales pending
- E01/E02 awaiting allocation
- E03 allocated overhead
- Project A result €0
- Project B result €0
- Company result -€300

Manager:
- S01 approve proposed split
- S02 change to 20/40/40 and approve
- E01 approve A
- E02 change B -> A

Expected:
- A result €700
- B result €1800
- Company result €2400
- commissions Richard €90, Anastasia €110, Jean-Claude €100

## Acceptance test 2
Keep Test 1 records.

Sales:
- S03 Jean-Claude / Emma Stonebridge / A / €1500 / 40/40/20
- S04 Richard / Lucas Green / B / €800 / 25/25/50
- S05 Richard / Mia Brooks / B / €600 / 100/0/0

Expenses:
- E04 €250 Materials proposed B
- E05 €90 Travel proposed A
- E06 €60 Other Company overhead
- E07 €140 Materials proposed A

Manager:
- S03 -> 20/30/50 approve
- S04 approve proposed
- S05 leave pending
- E04 approve B
- E05 change A -> B
- E07 leave awaiting

Expected cumulative:
- A result €2050
- B result €2180
- Company result €3930
- commissions Richard €140, Anastasia €175, Jean-Claude €215
- S05 remains pending
- E07 remains awaiting allocation
- reconciliation: 2050 + 2180 - 160 overhead - 140 awaiting = 3930

## Permission / robustness checks
These must not change the financial totals:
- split 60/30/20 -> refused
- Richard tries to approve a sale -> refused by API
- Kevin tries to submit a sale -> refused by API
- expense with missing/zero amount -> refused
- duplicate transaction reference -> refused
- approving already-approved transaction -> no duplicate and no changed totals
- failed Sheets sync -> record remains saved, failure visible, retry updates same reference row
- failed Telegram notification -> financial decision remains approved, failure visible, retry available

## Important security
Never put the service role key, bot token, private key, or webhook secret in GitHub, Google Sheets or the public website.

## Visibility rule
Salespeople and Kevin see only their own submissions and statuses. Svetlana sees all transactions and financial results. This is enforced in the dashboard API.

## Telegram reassignment during solo testing
When Svetlana links the same real Telegram user ID to a different fictional employee, the previous link is cleared automatically. Existing transactions keep their own stored `original_telegram_chat_id`, so their later decision notifications still go to the correct original chat.
