# Negm Farm ERP — Master Reference Document

## 1. Project Identity

**Project Name:** Negm Farm ERP — نجم لإدارة المزارع
**Arabic Name:** نظام فيتا فارم لإدارة محطات التسمين
**Type:** Arabic-first RTL ERP for cattle fattening operations (محطة تسمين عجول)
**Language Priority:** Arabic RTL primary — English secondary
**Font:** Cairo (Arabic + Latin, Google Fonts)

## 2. Business Model

- Client buys calves from suppliers → fattens them in cycles (دورات) → sells to buyers
- A **دورة (cycle)** = a batch of cattle from purchase to sale — it is the core cost centre
- A **ميكسر (mixer)** = a daily feed recipe made of multiple ingredient types
- A **عنبر (paddock)** = a physical pen/barn where cattle live inside the station
- Every transaction auto-propagates to: Inventory + Accounts + Cattle Records + HR

### Business Flow
1. **Purchase phase:** Buy young cattle (عجول) from suppliers by shipment (نقلة), recorded by count, net weight, avg weight, truck number, and supplier invoice
2. **Fattening cycle (دورة):** Cattle are grouped into a cycle — the core cost center. Each cycle tracks: entry date, exit date, head count changes (deaths/sales), daily feeding costs, and total profit/loss
3. **Daily feeding:** Via mixer (ميكسر) — a named recipe of multiple feed ingredients. A mixer drop is recorded as: mixer name + count + time + pen (عنبر). This auto-deducts all ingredient quantities from inventory
4. **Sale phase:** Sell fattened cattle to customers by shipment, recorded by count, net weight, avg weight, price/kg, and customer invoice
5. **Loss events (وقيع/نفوق):** Deaths and injuries tracked per cycle, affecting head count and P&L

### Real Client Data
**Suppliers:** هولي لاند, ميناء (Port)
**Customers:** م.وليد, وادي الخير, علي, دوكشا, ابونا لوكاس, م.صلاح, م.محروس, د.يونس
**Employees (13 staff):** مينا بولس, ابانوب, كيرو, چو, لوقا, بولا, محمود, عادل, صلاح, بولس, ناجح, منير, انطونيوس
**Feed ingredients:** ذرة, ردة, صويا, دريس, تبن, تفل البنجر, بيكربونات, سي باف, ماغنسيوم, مضاد سموم, بريمكس, خميرة, ملح, حجر جيري

---

## 3. Architecture Concept

```
One Transaction → Auto-propagates to:
├── Inventory ledger (stock in/out)
├── General Ledger (GL journal entry via stored procedure)
├── Cattle records (head count, cycle cost)
└── HR records (where applicable)
```

**Multi-tenancy:** One codebase, multiple farm clients. JWT carries: userId, farmId, roleId, permissions[]

**Cost center model (critical):**
- Every cycle (دورة) = a cost center
- Every piece of equipment (معدة) = a cost center
- All expenses and income are tagged to a cost center
- Cycle P&L = income from cattle sales − (feed costs + pro-rated salaries + pro-rated misc + equipment costs during cycle)

---

## 4. Tech Stack — Non-Negotiable

### Backend

| Layer | Technology |
|---|---|
| Runtime | ASP.NET Core 8 (C#) |
| Architecture | Clean Architecture — Domain / Application / Infrastructure / API |
| ORM | EF Core 8 with SQL Server provider |
| Database | SQL Server 2022 |
| Cache | Redis (StackExchange.Redis) |
| Real-time | SignalR (dashboard KPIs live update) |
| Background jobs | Hangfire (scheduled reports, notifications, payroll triggers) |
| PDF generation | QuestPDF |
| Excel export | ClosedXML |
| Enum pattern | Ardalis.SmartEnum — NEVER raw C# enums |
| Object mapping | Mapster — NEVER AutoMapper |
| API docs | Scalar — NEVER Swagger UI |
| Error handling | Result\<T\> pattern across ALL layer boundaries — NEVER throw raw exceptions |
| Audit log | SQL triggers only — old JSON + new JSON + userId + IP + timestamp — 7yr retention |
| Auth | JWT tokens — payload: userId, farmId, roleId, permissions[] |
| Passwords | BCrypt |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 (Vite SPA) |
| Language | TypeScript strict mode |
| Routing | React Router v6 |
| Server state | TanStack Query v5 ONLY — NEVER Zustand for API data |
| Client state | Zustand (UI state only — modals, filters, sidebar open/close) |
| UI components | shadcn/ui — owned and customised, not imported as-is |
| Styling | Tailwind CSS v3 with custom token classes |
| Forms | React Hook Form + Zod validation |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| i18n | i18next + react-i18next — ALL UI text via t() — ZERO hardcoded strings in JSX |
| RTL | CSS Logical Properties throughout — NEVER hardcode left/right/margin-left etc. |
| Icons | Lucide React |

---

## 5. Always-Active Rules — These NEVER change

### RTL Rules (Arabic-First)
- Root element: `dir="rtl"` on `<html>` tag
- NEVER use `margin-left`, `margin-right`, `padding-left`, `padding-right`
- ALWAYS use `margin-inline-start`, `margin-inline-end`, `padding-inline-start`, `padding-inline-end`
- NEVER use `left`, `right` in positioning — use `inset-inline-start`, `inset-inline-end`
- NEVER use `border-left`, `border-right` — use `border-inline-start`, `border-inline-end`
- Text alignment default: `text-align: start` (NOT left, NOT right)
- Icons inside inputs: positioned with `inset-inline-end`
- Sidebar border: `border-inline-end` (appears on left side in RTL)
- Flexbox and Grid auto-flip with RTL — no manual overrides needed

### Color Rules
- NEVER hardcode HEX colors in JSX or CSS — use CSS token variables ONLY
- NEVER hardcode z-index — use `--z-{name}` tokens
- ALL colors defined in `tokens.css` and referenced via `var(--color-*)` or Tailwind token classes

### Code Rules
- NEVER AutoMapper → Mapster ONLY
- NEVER Swagger UI → Scalar ONLY
- NEVER raw C# enums → Ardalis.SmartEnum ONLY
- NEVER throw raw exceptions → Result\<T\> pattern ONLY
- NEVER Zustand for server/API data → TanStack Query ONLY
- NEVER hardcode strings in JSX → i18next t() ONLY
- NEVER hardcode left/right CSS → CSS Logical Properties ONLY

### Architecture Rules
- Server state = TanStack Query (API calls, caching, invalidation)
- Client state = Zustand (modals open, sidebar collapsed, active filters)
- Every API response wrapped in: `{ success: bool, data: T, error: string, statusCode: int }`
- Every service method returns `Result<T>` — never void, never throws
- Audit log via SQL triggers — NOT application layer code

---

## 6. Design System

### Font
- **Font family:** Cairo (Arabic + Latin, Google Fonts)
- **Sizes:** 12 / 14 / 16 / 20 / 24 / 32
- **Weights:** Regular (400) / Medium (500) / Bold (700)

### Spacing Scale
4 / 8 / 12 / 16 / 24 / 32 / 48

### Color Palette

#### Primary — Forest Green

| Scale | Hex |
|---|---|
| 50 | #eef6ec |
| 100 | #dcecd9 |
| 200 | #b9d9b3 |
| 300 | #96c68d |
| 400 | #73b367 |
| 500 | #1a4a0a |
| 600 | #163e08 |
| 700 | #123206 |
| 800 | #0e2604 |
| 900 | #0a1a02 |
| 950 | #050d01 |

#### Accent — Mindaro Yellow-Green

| Scale | Hex |
|---|---|
| 50 | #fbffe5 |
| 100 | #f7ffd0 |
| 200 | #efffa1 |
| 300 | #e7ff72 |
| 400 | #dfff43 |
| 500 | #D7FA78 |
| 600 | #b7d65f |
| 700 | #97b246 |
| 800 | #778e2d |
| 900 | #576a14 |
| 950 | #2b350a |

#### Neutral Greys

| Scale | Hex |
|---|---|
| 50 | #f9f9f9 |
| 100 | #f2f2f2 |
| 200 | #e6e6e6 |
| 300 | #d6d6d6 |
| 400 | #bfbfbf |
| 500 | #9e9e9e |
| 600 | #7a7a7a |
| 700 | #5a5a5a |
| 800 | #3a3a3a |
| 900 | #1f1f1f |
| 950 | #0f0f0f |

#### Semantic — Success

| Scale | Hex |
|---|---|
| 50 | #ecfdf5 |
| 100 | #d1fae5 |
| 200 | #a7f3d0 |
| 300 | #6ee7b7 |
| 400 | #34d399 |
| 500 | #22c55e |
| 600 | #16a34a |
| 700 | #15803d |
| 800 | #166534 |
| 900 | #14532d |
| 950 | #052e16 |

#### Semantic — Error

| Scale | Hex |
|---|---|
| 50 | #fef2f2 |
| 100 | #fee2e2 |
| 200 | #fecaca |
| 300 | #fca5a5 |
| 400 | #f87171 |
| 500 | #ef4444 |
| 600 | #dc2626 |
| 700 | #b91c1c |
| 800 | #991b1b |
| 900 | #7f1d1d |
| 950 | #450a0a |

#### Semantic — Warning

| Scale | Hex |
|---|---|
| 50 | #fffbeb |
| 100 | #fef3c7 |
| 200 | #fde68a |
| 300 | #fcd34d |
| 400 | #fbbf24 |
| 500 | #f59e0b |
| 600 | #d97706 |
| 700 | #b45309 |
| 800 | #92400e |
| 900 | #78350f |
| 950 | #451a03 |

#### Semantic — Info

| Scale | Hex |
|---|---|
| 50 | #eff6ff |
| 100 | #dbeafe |
| 200 | #bfdbfe |
| 300 | #93c5fd |
| 400 | #60a5fa |
| 500 | #3b82f6 |
| 600 | #2563eb |
| 700 | #1d4ed8 |
| 800 | #1e40af |
| 900 | #1e3a8a |
| 950 | #172554 |

---

## 7. User Roles

| Role | Arabic | Description |
|---|---|---|
| Super Admin | مدير النظام | Full system access, multi-farm management, can override locks |
| Farm Owner | صاحب المزرعة | Full access to single farm, approves payroll, grants edit/delete per module |
| Accountant | محاسب | Finance, purchasing, sales, cashier, reports — no HR or cattle operations |
| Supervisor | مشرف | View all records, approve overtime, cannot edit committed records |
| Data Entry | إدخال بيانات | Create new records only, CANNOT view or modify past committed records |
| View Only | عرض فقط | Read-only access to assigned modules |

**Permission matrix per module per action:** Create / Read / Update / Delete / Approve / Export

**Security rules:**
- Forced re-login for: delete, approve, payroll run
- Session timeout configurable per role
- BCrypt passwords
- Column-level visibility: admin hides specific columns from specific roles
- Supervisor: CAN view past records, CANNOT edit (unless Owner explicitly grants)
- Data Entry: cannot view or modify past committed records

---

## 8. The 16 Modules — Build Order

| # | Module | Arabic | Priority |
|---|---|---|---|
| 1 | Auth & Permissions | الصلاحيات | v1 — Build First |
| 2 | Settings & Administration | الإعدادات | v1 — Build Second |
| 3 | Dashboard | الرئيسية | v1 |
| 4 | Cattle Management | الرؤوس والدورات | v1 — Core |
| 5 | Inventory Management | المخزون | v1 — Core |
| 6 | Purchasing | المشتريات | v1 |
| 7 | Sales | المبيعات | v1 |
| 8 | Suppliers | الموردين | v1 |
| 9 | Customers | العملاء | v1 |
| 10 | Accounts & General Ledger | الحسابات | v1 |
| 11 | Cashier & Bank | الخزينة والبنوك | v1 |
| 12 | Employees | الموظفين | v1 |
| 13 | Attendance | الحضور والانصراف | v1 |
| 14 | Payroll | الرواتب | v1 |
| 15 | HR & Leaves | الإجازات | v1 |
| 16 | Reports Center | التقارير | v1 |

---

## 9. Module Requirements (Full)

### MODULE 1 — Auth & Permissions (الصلاحيات)
**Priority: V1 — MUST SHIP FIRST**

Core tables:
- `users` (id, name, email, password_hash, farm_id, role_id, is_active)
- `roles` (id, name_ar, name_en, farm_id)
- `permissions` (role_id, module, action: create/read/update/delete/approve/export)
- `audit_log` (table, record_id, old_json, new_json, user_id, ip, timestamp) — SQL trigger only

Screens: Login (RTL), role management, permission grid (module × action matrix), user management

---

### MODULE 2 — Dashboard (الرئيسية)
**Priority: V1**

**Capital overview tiles (live via SignalR):**
- Active head count (عدد الرؤوس النشطة)
- Today's feed cost (تكلفة التغذية اليوم)
- Current cash balances (أرصدة الخزائن)
- Bank balances (أرصدة البنوك)
- Customer balances +/- (أرصدة العملاء)
- Supplier balances +/- (أرصدة الموردين)
- Equipment assets value (أصول المعدات)

**Charts (Recharts):**
- Monthly revenue vs cost (bar + line)
- Feed cost trend 30 days
- Head count per pen/cycle
- ADG (average daily gain) trend

**Alert feed:**
- Overdue customer payments
- Late supplier payments
- Low stock items (below min)
- Stock days remaining below threshold
- Upcoming vaccinations (within 7 days)
- Heads below target weight

**Daily journal view (دفتر اليومية):** All transactions of the day

**Quick-entry shortcuts:** Add purchase receipt | Record mixer drop | Record weight | Record attendance

---

### MODULE 3 — Cattle Management (إدارة الرؤوس والدورات)
**Priority: V1 — CORE MODULE**

**Cycle (دورة) — the master entity:**
- Cycle# (auto), start date, end date (when all sold/closed)
- Status: Active / Closed / Partial
- Total heads entered, current heads, heads sold, heads lost
- Cost center ID (auto-linked)

**Shipment receipt (استلام نقلة):**
- Fields: date, supplier, order#, truck plate, head count, total net weight, avg weight/head, price/kg, total value
- Multiple shipments can feed into one cycle

**Pen/location management (العنابر):**
- Head transfer between pens
- Transfer log with date, from pen, to pen, head count, reason

**Loss events (وقيع/نفوق):**
- Type: نفوق (death) / وقيع (injury/writeoff)
- Date, head count, cause, notes
- Auto-decrements cycle head count

**Feeding:**
- Mixer drop (نزول ميكسر): date, time, mixer name, pen (عنبر), head count
- Auto-deducts all mixer ingredients from inventory
- Auto-posts feed cost to cycle's cost center

**Weight tracking:**
- Per head or per pen batch
- Barcode scanner input support
- ADG chart per head and per group
- Alert: below expected growth curve

**Cattle sale (بيع عجول):**
- Fields: date, customer, order#, truck plate, head count, total net weight, avg weight, price/kg, total value
- Links to sales invoice
- Updates cycle: sold heads, income

**Reports:**
- Current station stats: incoming total − outgoing total − losses = current count
- Cycle P&L per cycle
- Total daily feed cost per cycle with remaining head count
- ADG report
- Loss report

---

### MODULE 4 — Inventory Management (المخزون)
**Priority: V1 — CORE MODULE**

**Item categories:**
- أغذية (feed): ذرة, ردة, صويا, دريس, تبن, تفل البنجر, بيكربونات, سي باف, ماغنسيوم, مضاد سموم, بريمكس, خميرة, ملح, حجر جيري
- أدوية (medicines/pharmaceuticals)
- قطع غيار (spare parts)
- زيوت وسولار (oils and diesel)

**Item master fields:**
- Code, name (Arabic + alternative), photo, category
- Type: balance item / movement-only
- Min stock, max stock, reorder quantity, avg delivery time (days)
- UoM (unit of measure), barcode

**Warehouse types:**
- محطة (main station feed warehouse)
- صيدلية (pharmacy/medicines)
- أغذية (food inputs)
- معدات (equipment/spare parts)

**Mixer (ميكسر) master:**
- Mixer name, type, status (active/inactive), notes
- Ingredients table: item name, quantity/count, weight, notes, status

**Receipt transactions (استلامات):**
- Type: opening balance / from supplier / return
- Warehouse + location, supplier, supplier invoice# + photo
- Items table: item, qty, weight, price, location
- Status: done / draft / pending — Auto-posts GL entry

**Issue transactions (صرف):**
- Type: internal / sales invoice / feeding (links mixer name + count)
- Warehouse + location, customer / cost center (cycle / equipment)
- Weighbridge card + photo attachment
- Status: done / draft / pending — Auto-posts GL entry + auto-deducts inventory

**Reports:**
- Stock shortages (نواقص المخزون) — items below min
- Stock balance with remaining days (الفترة المتبقية بمعدلات سحب المحطة)
- Total daily feed per cycle with head count
- Item movement history
- Physical count variance

---

### MODULE 5 — Purchasing (المشتريات)
**Priority: V1**

- Purchase order (PO): supplier, date, expected delivery, lines (item, qty, unit price)
- PO status: Draft → Sent → Partial Receipt → Fully Received
- GRN (goods receipt note) linked to PO, supports partial receipts
- Supplier bill matching against GRN (3-way match: PO ↔ GRN ↔ Bill)
- Purchase return (debit note) with reason codes — reverses stock + GL
- Payment scheduling: full / partial / instalment plan
- Overdue supplier payment alert

**Supplier account fields:** Supply date, quantity, type/item, price, total, payment dates, amount, currency, receiver, total owed / total paid / remaining balance

---

### MODULE 6 — Sales (المبيعات)
**Priority: V1**

- Cattle sale invoice: select cycle, enter shipment details (count, net weight, avg, price/kg) → status Sold
- Payment: cash / credit / instalment plan
- Instalment: overdue alert with configurable grace period
- Sales return with stock reversal option

**Customer account fields:** Receipt date, head count, truck plate, weighbridge card, avg weight, sale price, total value, payment receipt date, amount received, currency, receiver, total owed / total received / remaining balance

---

### MODULE 7 — Accounts & General Ledger (الحسابات)
**Priority: V1**

- Chart of accounts: unlimited hierarchical depth
- Journal entries: many-to-many debit/credit, narration, source reference
- Auto-posting: every module transaction posts GL via stored procedure
- Period-end soft-lock (supervisor) and hard-lock (owner)
- Cost centres: cycles, equipment, custom

**Income types:** cattle sales, other income
**Expense types:** purchases, food (feed), cattle heads purchase, salaries, oil, diesel, fuel, filters, maintenance, rent (ايجارات), misc (نثريات)

**Reports:** Income Statement, Balance Sheet, Trial Balance, Account Statement, Cash Flow, Cost Centre P&L

---

### MODULE 8 — Cashier & Bank (الخزينة والبنوك)
**Priority: V1**

- Multi-safe: opening balance, daily log, end-of-day close, variance report
- Bank accounts: full ledger, cheque management, PDC (post-dated cheque) tracking
- Receipt voucher + payment voucher → auto-post GL
- Petty cash: replenishment request + approval
- Bank reconciliation: import CSV, auto-match by amount+date
- Cash request workflow: employee submits → supervisor approves → cashier disburses

---

### MODULE 9 — Suppliers (الموردين)
**Priority: V1**

- Supplier profile: name, contact, bank account, notes
- Account statement: all transactions, opening balance, closing balance
- Aging report: current / 30 / 60 / 90+ days
- Bulk export PDF/Excel

---

### MODULE 10 — Customers (العملاء)
**Priority: V1**

- Customer profile: name, contact, credit limit
- Account statement + aging report
- Instalment tracking with overdue alerts

---

### MODULE 11 — Employees (الموظفين)
**Priority: V1**

**Employee profile fields:**
- Full name, job title, national ID, address, contact info
- Basic salary, insurance %, tax brackets
- Start date, end date (if terminated), status (active / on leave / suspended / terminated)

**From actual payroll data (13 employees):**
- Salaries range: 2,000–8,000 EGP basic
- Deductions tracked: fines (خصومات)
- Advances (سلف) tracked per employee
- Gratuities (إكراميات) tracked per employee
- Leave balance tracked per employee
- Working days per month tracked

**Document vault:** contracts, IDs, certificates
**Org chart** auto-rendered from reporting line

---

### MODULE 12 — Attendance (الحضور والانصراف)
**Priority: V1**

**Daily attendance fields:**
- Employee#, date, check-in time, check-out time, working hours count
- Day status (if leave: leave type), remaining leave balance

- Shifts: Morning / Evening / Night
- Overtime with supervisor approval
- CSV import from biometric devices (ZKTeco)
- Monthly summary → direct input to payroll run

---

### MODULE 13 — Payroll (الرواتب)
**Priority: V1**

**Payroll run fields:**
- Employee name + job title
- Basic salary
- Advances (سلف) deducted
- Deductions (خصومات) — fines/penalties
- Gratuities (إكراميات) — bonuses/tips
- Working days / Leave days taken / Remaining leave balance
- Net salary = Basic − Advances − Deductions + Gratuities

**Additional:**
- Configurable allowances (housing, transport, food, mobile)
- Insurance (configurable %)
- Income tax (brackets)
- Loan repayment auto-deduction

**Payroll run flow:** Draft → Reviewed → Approved → Paid — approved run locked
**GL posting on approval:** debit salary expense, credit payables or bank
**Payslip:** QuestPDF, printable, optional email

---

### MODULE 14 — HR & Leaves (الإجازات)
**Priority: V2**

- Leave types: Annual / Sick / Emergency / Unpaid
- Leave request → manager approves → balance auto-updated
- Team calendar: all approved absences per department
- HR reports: headcount, new hires, terminations, leave utilisation

---

### MODULE 15 — Reports Center (التقارير)
**Priority: V1 (basic), V2 (advanced)**

**Unified launcher:** all reports listed, searchable, grouped by module
**Every report:** date range picker, multi-column filter, grouping with subtotals
**Export:** Excel (ClosedXML), PDF (QuestPDF), browser print
**Saved filters** and scheduled delivery (Hangfire)

| Category | Reports |
|---|---|
| Cattle | Head list, cycle summary, feed cost per head, ADG, loss report, weight history, current station count |
| Inventory | Stock balance, stock ledger, remaining days by item, stock shortages, item movement, physical count variance |
| Purchasing | PO status, GRN summary, supplier bill aging, purchase returns |
| Sales | Sales summary, invoice list, customer aging, instalment schedule, cattle sales P&L |
| Accounts | Trial balance, income statement, balance sheet, account statement, cost centre P&L, cash flow |
| Cashier | Safe daily log, bank reconciliation, cheque register, cash request log |
| HR | Headcount, attendance summary, overtime, leave utilisation, payroll summary, payslip history, loan balance |
| Equipment | Monthly consumption rates, maintenance history, spare parts cost per equipment, expected next service |

---

### MODULE 16 — Settings & Administration (الإعدادات)
**Priority: V1**

- Farm profile: name, logo, address, fiscal year start, currency, VAT rate, invoice prefix
- User management: create, assign roles, enable/disable, reset passwords
- Role builder: custom roles via permission grid
- Notification templates (Hangfire jobs)
- Number series: prefix + starting sequence per transaction type (INV-, PO-, REC-, PAY-, CYC-, MIX-)
- Database backup: manual + scheduled

---

## 10. Equipment Module (spans Modules 4 + 7)
**Priority: V1**

**Equipment record:**
- Equipment name, type, purchase date, purchase value
- Maintenance schedule: expected interval for oil filter, oil change, filter, general maintenance
- Cost center ID (auto-linked)

**Equipment transactions:**
- Date, expense type (oil / diesel / fuel / filters / maintenance / spare parts)
- Quantity from inventory + price (auto-deducts from parts warehouse)

**Reports:**
- Monthly consumption rates (filters, oil per equipment + spare parts)
- Equipment report: maintenances, replacements, consumptions with averages
- Expected next service date per maintenance type per equipment
- Monthly cost average per spare part with trend chart

---

## 11. Key Business Rules

1. **Cycle = Cost Center:** Every expense must be tagged to either a cycle# or an equipment#
2. **Mixer drop = automatic stock issue:** Recording a mixer drop auto-issues all ingredients from inventory and auto-posts feed cost to cycle cost center
3. **One transaction → 4 ledgers:** Every financial transaction updates: inventory + GL + cattle record + HR (where applicable)
4. **Head count formula:** Current heads = Total received − Total sold − Total losses
5. **Salary pro-rating:** Monthly salaries are pro-rated onto active cycles based on average head count during the period
6. **Misc expense pro-rating (نثريات):** Misc expenses are also pro-rated onto cycles by average head count
7. **Stock remaining days:** System must always show how many days each feed item will last at current daily consumption rate
8. **Committed record lock:** Once a record is committed (approved), Data Entry operators cannot modify it
9. **Payroll run lock:** Once approved, payroll run is fully locked — no edits
10. **Period-end lock:** Accounting periods can be soft-locked (supervisor override) or hard-locked (owner only)

---

## 12. V1 vs V2 Priority

### Must ship in V1:

| # | Module | Reason |
|---|---|---|
| 1 | Auth & Permissions | Everything depends on this |
| 2 | Settings | Farm profile, number series, roles |
| 3 | Cattle Management | Core business — cycles, shipments, losses, sales |
| 4 | Inventory | Feed stock — consumed daily |
| 5 | Purchasing | Supplier orders + GRN |
| 6 | Suppliers | Supplier accounts |
| 7 | Sales | Customer invoices + payments |
| 8 | Customers | Customer accounts |
| 9 | Cashier & Bank | Daily cash movement |
| 10 | Employees | 13 staff need to be in system |
| 11 | Attendance | Daily tracking |
| 12 | Payroll | Monthly salary run |
| 13 | Accounts & GL | Everything feeds here |
| 14 | Dashboard | Owner needs daily overview |
| 15 | Reports Center (basic) | Core reports for operations |

### V2 (after client is live and stable):

| # | Module | Reason |
|---|---|---|
| 16 | HR & Leaves | Nice-to-have, not blocking |
| 17 | Reports Center (advanced) | Scheduled delivery, saved filters |
| 18 | Multi-farm support | When second client onboards |

---

## 13. Open Questions (to clarify with client)

1. Does the client want **multi-currency** or EGP only?
2. Is **VAT** required on invoices?
3. Does the client want **SMS/WhatsApp** notifications or email only?
4. Should the system support **biometric device integration** from day one (ZKTeco)?
5. How many **bank accounts** does the station currently operate?
6. Does the client need **mobile app** access or web browser only?
7. What is the client's preferred **backup frequency** (daily / hourly)?

---

## 14. How to Prompt Claude Code — Every Session

**Start every session with:**
> "Read negm-farm-erp-master.md, then [your task]"

**Examples:**
> "Read negm-farm-erp-master.md, then scaffold the full solution folder structure"
> "Read negm-farm-erp-master.md, then generate tokens.css and tailwind.config.js"
> "Read negm-farm-erp-master.md, then build the Cattle Management backend API"
> "Read negm-farm-erp-master.md, then create EF Core migrations for Auth tables"
> "Read negm-farm-erp-master.md, then build the AppSidebar.tsx component"

**Rule:** Never start a task without reading this file first. It is the source of truth.

---

*Negm Farm ERP | 16 Modules | ASP.NET Core 8 + React 18 + SQL Server 2022 + Redis*
*Arabic RTL Primary | Cairo Font | Forest Green + Mindaro | shadcn/ui*
*Master v1.0 — Merged from CLAUDE.md + veta-farm-PRD.md + vita_farm_erp_design_system_v2.md*
