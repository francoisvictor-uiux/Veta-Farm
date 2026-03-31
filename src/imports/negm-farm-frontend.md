# Negm Farm ERP — Frontend Reference
# نجم لإدارة المزارع — مرجع الواجهة الأمامية
> React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
> Arabic RTL Primary | Font: Cairo | Forest Green Design System

---

## 1. Project Idea

**Negm Farm ERP** is a full Arabic-first, RTL ERP web application built for cattle fattening stations (محطات تسمين عجول). The client buys young calves, fattens them in batches called **cycles (دورات)**, and sells them to buyers.

The system replaces manual Excel tracking with a unified digital platform covering:
- Every head of cattle from arrival to sale
- Daily feed consumption with automatic inventory deduction
- Full accounting and general ledger — auto-posted from every transaction
- Payroll, attendance, and HR for 13+ employees
- Real-time dashboard for the farm owner with live KPIs

**Core insight:** One transaction touches four systems simultaneously — inventory, GL, cattle records, and HR. The frontend must make this feel seamless and simple for non-technical Arabic-speaking operators.

---

## 2. Frontend Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 18 (Vite SPA) |
| Language | TypeScript — strict mode |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Client state | Zustand (UI only: modals, sidebar, filters) |
| UI components | shadcn/ui (owned + customised) |
| Styling | Tailwind CSS v3 + CSS custom tokens |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| i18n | i18next + react-i18next |
| Icons | Lucide React |
| Real-time | SignalR client (dashboard live KPIs) |
| Font | Cairo (Google Fonts — Arabic + Latin) |

---

## 3. Frontend Rules — Non-Negotiable

### RTL (Arabic-First)
- `dir="rtl"` on the `<html>` element — always
- Use CSS Logical Properties everywhere:
  - `margin-inline-start` / `margin-inline-end` — NOT `margin-left` / `margin-right`
  - `padding-inline-start` / `padding-inline-end`
  - `inset-inline-start` / `inset-inline-end` — NOT `left` / `right`
  - `border-inline-start` / `border-inline-end` — NOT `border-left` / `border-right`
- Default text alignment: `text-align: start`
- Sidebar border: `border-inline-end`
- Flexbox and Grid flip automatically in RTL — never manually override direction

### Colors & Tokens
- NEVER hardcode HEX colors in JSX or CSS
- NEVER hardcode z-index values
- ALL colors via `var(--color-*)` CSS variables or Tailwind token classes
- ALL z-index via `var(--z-*)` tokens

### Strings & i18n
- ZERO hardcoded Arabic or English strings in JSX
- Every visible string goes through `t('key')` via i18next
- Translation keys organized by module: `cattle.cycle.title`, `inventory.stock.empty`, etc.

### State Management
- API data → TanStack Query only (fetch, cache, invalidate)
- UI state → Zustand only (sidebar open, modal visible, active filter)
- NEVER use Zustand to cache API responses

---

## 4. Design System

### Font
```css
font-family: 'Cairo', sans-serif;
/* Weights used: 400 (Regular), 500 (Medium), 700 (Bold) */
/* Sizes: 12px / 14px / 16px / 20px / 24px / 32px */
```

### Spacing Scale
`4px · 8px · 12px · 16px · 24px · 32px · 48px`

### Color Palette

#### Primary — Forest Green
| Token | Hex | Usage |
|---|---|---|
| `--color-primary-50` | #eef6ec | Page backgrounds, hover states |
| `--color-primary-100` | #dcecd9 | Card backgrounds, subtle fills |
| `--color-primary-200` | #b9d9b3 | Borders, dividers |
| `--color-primary-400` | #73b367 | Secondary buttons, badges |
| `--color-primary-500` | #1a4a0a | Primary buttons, sidebar bg |
| `--color-primary-600` | #163e08 | Button hover states |
| `--color-primary-800` | #0e2604 | Dark sidebar, headers |

#### Accent — Mindaro
| Token | Hex | Usage |
|---|---|---|
| `--color-accent-500` | #D7FA78 | Highlights, active nav, badges |
| `--color-accent-600` | #b7d65f | Accent hover |

#### Neutral Greys
| Token | Hex | Usage |
|---|---|---|
| `--color-neutral-50` | #f9f9f9 | App background |
| `--color-neutral-100` | #f2f2f2 | Card surface |
| `--color-neutral-200` | #e6e6e6 | Borders |
| `--color-neutral-400` | #bfbfbf | Placeholder text |
| `--color-neutral-600` | #7a7a7a | Secondary text |
| `--color-neutral-800` | #3a3a3a | Body text |
| `--color-neutral-900` | #1f1f1f | Headings |

#### Semantic
| Token | Hex | Usage |
|---|---|---|
| `--color-success-500` | #22c55e | Success states, positive values |
| `--color-error-500` | #ef4444 | Errors, losses, overdue |
| `--color-warning-500` | #f59e0b | Warnings, low stock, alerts |
| `--color-info-500` | #3b82f6 | Info banners, links |

---

## 5. App Shell Layout

```
┌─────────────────────────────────────────────────────┐
│  Top Bar (header): Logo | Farm name | User | Notifs  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   Sidebar    │         Main Content Area            │
│  (RTL: end   │   ┌──────────────────────────────┐   │
│   of screen) │   │  Page Header (title + CTA)   │   │
│              │   ├──────────────────────────────┤   │
│  Nav groups  │   │  Filters / Tabs / Breadcrumb  │   │
│  with icons  │   ├──────────────────────────────┤   │
│  + badges    │   │  Table / Form / Cards / Chart │   │
│              │   └──────────────────────────────┘   │
│  [Collapse]  │                                      │
└──────────────┴──────────────────────────────────────┘
```

**Sidebar behaviour:**
- Collapsible to icon-only mode (Zustand: `sidebarCollapsed`)
- Sticky, full height
- Active item highlighted with accent color (`--color-accent-500`)
- Groups: collapsible nav sections with chevron
- Badges: live counts (overdue alerts, pending approvals)
- Border on inline-end side (RTL-correct)

---

## 6. Reusable Component Patterns

| Component | Description |
|---|---|
| `<DataTable>` | TanStack Table v8 wrapper — sortable, filterable, paginated, exportable |
| `<PageHeader>` | Title (Arabic) + optional CTA button + breadcrumb |
| `<StatusBadge>` | Color-coded pill: Active/Draft/Pending/Closed/Approved |
| `<KpiCard>` | Metric tile: label + value + trend arrow + icon |
| `<FormDrawer>` | Slide-in panel for create/edit forms (not full page modal) |
| `<ConfirmDialog>` | Re-auth dialog for destructive actions (delete, approve, payroll run) |
| `<FilterBar>` | Date range + dropdowns + search — lives above DataTable |
| `<EmptyState>` | Illustrated empty state with CTA — used when table has no data |
| `<AlertFeed>` | Scrollable list of system alerts with severity icons |
| `<ExportMenu>` | Dropdown: Export Excel / Export PDF / Print |

---

## 7. Modules & Screens

---

### MODULE 1 — Auth & Permissions (الصلاحيات)

**Purpose:** Control who can access what. Ships first — everything depends on it.

#### Screens

**1.1 Login Screen (`/login`)**
- Full-page centered card, RTL layout
- Fields: Email / Password (with show/hide toggle)
- Cairo font, primary green button
- Error state: wrong credentials banner
- Redirects to Dashboard on success

**1.2 Users List (`/settings/users`)**
- DataTable: Name | Role | Status (Active/Inactive) | Last Login | Actions
- Filter by role, status
- Actions: Edit | Disable | Reset Password
- CTA: "+ إضافة مستخدم"

**1.3 Add / Edit User (`/settings/users/new`, `/settings/users/:id/edit`)**
- Form fields: Full name, Email, Role (dropdown), Status toggle
- Inline Zod validation
- Save → invalidates users query

**1.4 Roles List (`/settings/roles`)**
- DataTable: Role Name (AR) | Role Name (EN) | Users Count | Actions
- CTA: "+ إضافة دور"

**1.5 Role Permission Grid (`/settings/roles/:id/permissions`)**
- Matrix table: Rows = 16 modules | Columns = Create / Read / Update / Delete / Approve / Export
- Toggle checkboxes per cell
- Save all button — bulk update

---

### MODULE 2 — Dashboard (الرئيسية)

**Purpose:** The owner's daily command center. Live data via SignalR.

#### Screens

**2.1 Main Dashboard (`/`)**

**KPI Tiles Row (live, SignalR):**
- Active head count — عدد الرؤوس النشطة
- Today's feed cost — تكلفة التغذية اليوم
- Cash balance — رصيد الخزينة
- Bank balance — رصيد البنك
- Customer receivables — مديونية العملاء
- Supplier payables — مديونية الموردين
- Equipment asset value — أصول المعدات

**Charts Section (Recharts):**
- Bar + Line: Monthly revenue vs cost (last 6 months)
- Area: Feed cost trend — last 30 days
- Bar: Head count per cycle/pen
- Line: ADG trend — average daily gain per cycle

**Alert Feed Panel:**
- Overdue customer payments (red)
- Late supplier payments (red)
- Low stock items — below minimum (orange)
- Stock days remaining — below threshold (orange)
- Upcoming vaccinations — within 7 days (yellow)
- Heads below target weight (yellow)
Each alert: icon + message + link to relevant module

**Daily Journal (دفتر اليومية):**
- Today's transactions: Type | Amount | Reference | Time | User
- Scrollable, grouped by hour

**Quick Entry Shortcuts:**
- + استلام مشتريات (Purchase receipt)
- + نزول ميكسر (Mixer drop)
- + تسجيل وزن (Record weight)
- + تسجيل حضور (Record attendance)
Each opens the relevant FormDrawer inline

---

### MODULE 3 — Cattle Management (إدارة الرؤوس والدورات)

**Purpose:** Core module. Tracks every head from arrival to sale, grouped in cycles.

#### Screens

**3.1 Cycles List (`/cattle/cycles`)**
- DataTable: Cycle# | Start Date | Status | Heads In | Current Heads | Heads Sold | Heads Lost | P&L
- Status badge: Active (green) / Closed (grey) / Partial (orange)
- Filter by status, date range
- Row click → Cycle Detail

**3.2 Cycle Detail (`/cattle/cycles/:id`)**
- Header: Cycle# + Status badge + dates + cost center ID
- Tabs:
  - **الملخص (Summary):** KPI cards — heads in / current / sold / lost + P&L mini-chart
  - **النقلات (Shipments):** Table of all receipt shipments in this cycle
  - **التغذية (Feeding):** All mixer drops — date, mixer, pen, count, cost
  - **الوزن (Weights):** Weight log + ADG chart
  - **الوقيع والنفوق (Losses):** Loss events table
  - **المبيعات (Sales):** Sale shipments table
  - **العنابر (Pens):** Current head distribution per pen + transfer log

**3.3 New Cycle (`/cattle/cycles/new`)**
- Form: Start date, notes
- Auto-assigns cycle number and cost center

**3.4 Shipment Receipt — Add (`/cattle/shipments/new`)**
- Form: Date | Cycle (select) | Supplier | Order# | Truck plate | Head count | Total net weight | Avg weight/head | Price/kg | Total value
- Auto-calculates total value from count × avg weight × price/kg
- Attach document photo

**3.5 Mixer Drop — Record (`/cattle/feeding/new`)**
- Form: Date | Time | Mixer (select with ingredient preview) | Pen (select) | Head count | Notes
- Shows ingredient quantities that will be deducted
- Confirm → auto-deducts from inventory + posts to GL

**3.6 Loss Event — Record (`/cattle/losses/new`)**
- Form: Date | Cycle | Type (نفوق / وقيع) | Head count | Cause | Notes

**3.7 Weight Entry (`/cattle/weights/new`)**
- Form: Date | Cycle | Pen | Entry type (per head / batch)
- Batch: total weight + head count → auto-calculates avg
- Per head: barcode scan or manual ID

**3.8 Cattle Sale — Record (`/cattle/sales/new`)**
- Form: Date | Cycle | Customer | Order# | Truck plate | Head count | Total net weight | Avg weight | Price/kg | Total value
- Auto-links to sales invoice

**3.9 Pen Management (`/cattle/pens`)**
- List of all pens (عنابر): Name | Current heads | Status
- Transfer button: from pen → to pen, head count, date, reason

**3.10 Station Overview Report (`/cattle/report`)**
- Summary: Total received − Sold − Lost = Current heads
- Per cycle breakdown
- Export PDF / Excel

---

### MODULE 4 — Inventory Management (المخزون)

**Purpose:** Track all feed, medicine, spare parts and oils. Auto-deducted by mixer drops.

#### Screens

**4.1 Stock Overview (`/inventory`)**
- Card grid per warehouse: name + item count + alert count
- Click → warehouse detail

**4.2 Items List (`/inventory/items`)**
- DataTable: Code | Name | Category | UoM | Current Stock | Min Stock | Remaining Days | Status
- Color-coded remaining days: green (safe) / orange (low) / red (critical)
- Filter by category, warehouse, status
- CTA: "+ إضافة صنف"

**4.3 Item Detail (`/inventory/items/:id`)**
- Tabs:
  - **الرصيد (Balance):** Current stock per warehouse with location breakdown
  - **الحركات (Movements):** Full movement ledger — in/out with dates, refs, quantities
  - **الميكسرات (Mixers):** Which mixers use this item and how much
  - **الإعدادات (Settings):** Min/max stock, reorder qty, avg delivery time

**4.4 Add / Edit Item (`/inventory/items/new`, `/inventory/items/:id/edit`)**
- Fields: Code, Name (AR + alternative), Category, UoM, Barcode, Photo, Min/Max stock, Reorder qty, Avg delivery days

**4.5 Warehouses List (`/inventory/warehouses`)**
- DataTable: Name | Type | Responsible | Status | Item Count
- Types: محطة / صيدلية / أغذية / معدات
- CTA: "+ إضافة مخزن"

**4.6 Mixer Master — List (`/inventory/mixers`)**
- DataTable: Mixer Name | Type | Status | Ingredient Count
- CTA: "+ إضافة ميكسر"

**4.7 Mixer Master — Detail / Edit (`/inventory/mixers/:id`)**
- Header: name, type, status toggle
- Ingredients table: Item | Qty per count | Weight | Status
- Add / remove ingredient rows inline

**4.8 Receipt Transaction — New (`/inventory/receipts/new`)**
- Form: Type (opening balance / from supplier / return) | Date | Warehouse | Location | Supplier | Invoice# | Photo
- Items sub-table: Item | Qty | Weight | Price | Location
- Add multiple items inline
- Submit → auto-posts GL entry

**4.9 Receipt Transactions List (`/inventory/receipts`)**
- DataTable: Receipt# | Date | Type | Warehouse | Supplier | Status | Total Value
- Filter by type, warehouse, supplier, date, status
- Status: Done / Draft / Pending

**4.10 Issue Transaction — New (`/inventory/issues/new`)**
- Form: Type (internal / sales invoice / feeding) | Date | Warehouse | Cost Center (cycle or equipment) | Photo
- Items sub-table: Item | Qty | Weight | Price
- Weighbridge card upload
- Submit → auto-deducts stock + posts GL

**4.11 Issue Transactions List (`/inventory/issues`)**
- DataTable: Issue# | Date | Type | Warehouse | Cost Center | Status | Total Value

**4.12 Stock Shortages Report (`/inventory/shortages`)**
- Items below minimum — sorted by urgency
- Columns: Item | Category | Min Stock | Current Stock | Deficit | Avg Daily Use | Days Remaining
- Export PDF / Excel

---

### MODULE 5 — Purchasing (المشتريات)

**Purpose:** Manage supplier orders, goods receipts, bill matching, and payment schedules.

#### Screens

**5.1 Purchase Orders List (`/purchasing/orders`)**
- DataTable: PO# | Date | Supplier | Status | Items | Total Value | Expected Delivery
- Status badge: Draft / Sent / Partial / Received
- CTA: "+ إنشاء أمر شراء"

**5.2 Purchase Order — New / Edit (`/purchasing/orders/new`)**
- Header: Supplier (select) | Date | Expected delivery date | Notes
- Items sub-table: Item | Qty | Unit price | Total
- Status workflow: Draft → Sent (manual action) → auto-moves to Partial/Received on GRN

**5.3 Purchase Order — Detail (`/purchasing/orders/:id`)**
- PO header info + status timeline
- Linked GRNs list
- Linked supplier bill
- Payment schedule

**5.4 Goods Receipt Notes List (`/purchasing/grn`)**
- DataTable: GRN# | Date | PO# | Supplier | Status | Received Qty vs PO Qty

**5.5 GRN — New (`/purchasing/grn/new`)**
- Select PO → pre-fills supplier and items
- Items: received qty per line (supports partial)
- Auto-updates PO status
- Auto-creates inventory receipt transaction

**5.6 Supplier Bills List (`/purchasing/bills`)**
- DataTable: Bill# | Supplier | GRN# | Amount | Due Date | Status
- Status: Matched / Unmatched / Paid / Partial

**5.7 Supplier Bill — Match (`/purchasing/bills/:id`)**
- 3-way match view: PO vs GRN vs Bill side by side
- Approve match → unlocks payment

**5.8 Purchase Returns List (`/purchasing/returns`)**
- DataTable: Return# | Date | Supplier | PO# | Reason | Amount
- CTA: "+ تسجيل مرتجع"

**5.9 Purchase Return — New (`/purchasing/returns/new`)**
- Select PO / GRN → items with qty to return + reason code
- Auto-reverses stock + GL

---

### MODULE 6 — Sales (المبيعات)

**Purpose:** Record cattle sale invoices, collect payments, manage instalments.

#### Screens

**6.1 Sales Invoices List (`/sales`)**
- DataTable: Invoice# | Date | Customer | Cycle | Head Count | Net Weight | Amount | Status
- Status: Draft / Confirmed / Paid / Partial / Overdue
- CTA: "+ فاتورة بيع جديدة"

**6.2 Sale Invoice — New (`/sales/new`)**
- Header: Date | Customer (select) | Cycle (select) | Payment type (cash / credit / instalment)
- Shipment details: Head count | Truck plate | Total net weight | Avg weight | Price/kg | Total value
- Attach weighbridge card photo
- On confirm: updates cycle, posts GL entry

**6.3 Sale Invoice — Detail (`/sales/:id`)**
- Invoice header + line items
- Payment history sub-table
- Instalment schedule (if credit)
- Print / Export PDF button

**6.4 Payment Collection — New (`/sales/:id/payment`)**
- Form: Date | Amount | Payment method (cash / bank transfer / cheque) | Notes
- Applies to invoice → calculates remaining balance

**6.5 Instalment Schedule View (`/sales/instalments`)**
- All active instalment plans
- DataTable: Customer | Invoice# | Total | Paid | Remaining | Next Due Date | Status
- Overdue rows highlighted red

**6.6 Sales Returns List (`/sales/returns`)**
- DataTable: Return# | Date | Customer | Invoice# | Amount
- CTA: "+ تسجيل مرتجع مبيعات"

---

### MODULE 7 — Accounts & General Ledger (الحسابات)

**Purpose:** Full double-entry accounting. Auto-fed by all modules.

#### Screens

**7.1 Chart of Accounts (`/accounts/coa`)**
- Hierarchical tree view: expandable parent → child accounts
- Columns: Account Code | Name (AR) | Type (Asset/Liability/Income/Expense) | Balance
- CTA: "+ إضافة حساب"

**7.2 Account — Add / Edit (`/accounts/coa/new`)**
- Fields: Parent account | Code | Name (AR + EN) | Type | Notes

**7.3 Journal Entries List (`/accounts/journal`)**
- DataTable: Entry# | Date | Narration | Source Module | Total Debit | Total Credit | Status
- Filter by date, source module, status
- Status: Auto-posted / Manual / Draft
- CTA: "+ قيد يدوي"

**7.4 Journal Entry — New / Detail (`/accounts/journal/new`, `/accounts/journal/:id`)**
- Header: Date | Narration | Source reference | Period
- Lines sub-table: Account | Debit | Credit | Cost Center | Notes
- Running debit/credit totals — must balance before save

**7.5 Cost Centre List (`/accounts/cost-centres`)**
- DataTable: Type | Name | Status | Total Expenses | Total Income | Net P&L
- Types: Cycle (دورة) / Equipment (معدة) / Custom

**7.6 Cost Centre P&L (`/accounts/cost-centres/:id`)**
- Income vs Expense breakdown
- Chart: monthly trend
- Detail lines linked to source transactions

**7.7 Period Management (`/accounts/periods`)**
- List of accounting periods (monthly)
- Status: Open / Soft-Locked / Hard-Locked
- Lock / Unlock actions (role-gated)

**7.8 Financial Reports Hub (`/accounts/reports`)**
- Links to: Trial Balance | Income Statement | Balance Sheet | Account Statement | Cash Flow
- Each opens with date-range filter and export options

---

### MODULE 8 — Cashier & Bank (الخزينة والبنوك)

**Purpose:** Daily cash management, bank accounts, vouchers, reconciliation.

#### Screens

**8.1 Safes Overview (`/cashier`)**
- Cards per safe: Name | Opening Balance | Today In | Today Out | Current Balance | Status
- CTA: End of Day Close

**8.2 Safe Daily Log (`/cashier/safe/:id/log`)**
- DataTable: Time | Type (Receipt/Payment) | Amount | Reference | User
- Running balance column
- Filter by date

**8.3 Receipt Voucher — New (`/cashier/receipt/new`)**
- Form: Date | Safe | Amount | From (customer/other) | Account | Reference | Notes
- Auto-posts GL entry

**8.4 Payment Voucher — New (`/cashier/payment/new`)**
- Form: Date | Safe | Amount | To (supplier/employee/other) | Account | Reference | Notes
- Auto-posts GL entry

**8.5 Bank Accounts List (`/cashier/banks`)**
- DataTable: Bank Name | Account# | Currency | Balance | Status

**8.6 Bank Account Ledger (`/cashier/banks/:id`)**
- Full transaction ledger: Date | Description | Debit | Credit | Balance
- Filter by date range

**8.7 Cheque Register (`/cashier/cheques`)**
- DataTable: Cheque# | Bank | Date | Amount | Payee/Payer | Status | Due Date
- Status: Pending / Cleared / Bounced / Cancelled
- PDC (post-dated) highlighted with due date countdown

**8.8 Bank Reconciliation (`/cashier/reconciliation`)**
- Import bank statement CSV
- Auto-match by amount + date
- Unmatched items highlighted
- Manual match option
- Reconciliation summary: system balance vs bank statement

**8.9 Petty Cash (`/cashier/petty-cash`)**
- Current balance + replenishment requests list
- New replenishment request form: Amount | Reason | Attachments
- Approval workflow: Submitted → Approved → Disbursed

**8.10 Cash Requests (`/cashier/cash-requests`)**
- Employee submits request → supervisor approves → cashier disburses
- DataTable: Employee | Amount | Reason | Status | Date

---

### MODULE 9 — Suppliers (الموردين)

**Purpose:** Supplier profiles, account statements, aging.

#### Screens

**9.1 Suppliers List (`/suppliers`)**
- DataTable: Name | Contact | Total Owed | Overdue Amount | Status
- Color-coded overdue: red if > 0
- CTA: "+ إضافة مورد"

**9.2 Supplier — Add / Edit (`/suppliers/new`, `/suppliers/:id/edit`)**
- Fields: Name (AR) | Contact person | Phone | Email | Bank account details | Notes

**9.3 Supplier — Account Statement (`/suppliers/:id`)**
- Header: Supplier info + current balance
- Tabs:
  - **كشف الحساب:** Full transaction ledger — Date | Type | Ref | Debit | Credit | Balance
  - **التقادم (Aging):** Current / 30 / 60 / 90+ days breakdown
  - **المشتريات:** Linked purchase orders
  - **المدفوعات:** Payment history
- Export PDF / Excel

---

### MODULE 10 — Customers (العملاء)

**Purpose:** Customer profiles, account statements, instalment tracking.

#### Screens

**10.1 Customers List (`/customers`)**
- DataTable: Name | Contact | Credit Limit | Balance | Overdue | Status
- CTA: "+ إضافة عميل"

**10.2 Customer — Add / Edit (`/customers/new`, `/customers/:id/edit`)**
- Fields: Name (AR) | Contact | Phone | Email | Credit limit | Notes

**10.3 Customer — Account Statement (`/customers/:id`)**
- Header: Customer info + current balance + credit utilization bar
- Tabs:
  - **كشف الحساب:** Full transaction ledger — Date | Type | Ref | Debit | Credit | Balance
  - **التقادم (Aging):** Current / 30 / 60 / 90+ days
  - **الفواتير:** Linked sales invoices
  - **الأقساط:** Active instalment schedules with overdue alerts
  - **المتحصلات:** Payment receipts history

---

### MODULE 11 — Employees (الموظفين)

**Purpose:** Employee profiles, documents, org structure.

#### Screens

**11.1 Employees List (`/employees`)**
- DataTable: Name | Job Title | Basic Salary | Status | Hire Date | Leave Balance
- Status badge: Active / On Leave / Suspended / Terminated
- CTA: "+ إضافة موظف"

**11.2 Employee — Add / Edit (`/employees/new`, `/employees/:id/edit`)**
- Personal: Full name, National ID, Address, Phone, Email
- Employment: Job title, Start date, Reports to (for org chart), Status
- Compensation: Basic salary, Insurance %, Tax bracket
- Save → appears in org chart

**11.3 Employee — Profile (`/employees/:id`)**
- Tabs:
  - **البيانات الأساسية:** Personal + employment details
  - **الراتب:** Salary history + current components
  - **السلف:** Advances log — amount, date, remaining balance
  - **الخصومات:** Deductions history
  - **الإكراميات:** Gratuities/bonuses log
  - **الإجازات:** Leave balance + history
  - **المستندات:** Document vault (contracts, IDs, certificates) — upload + view

**11.4 Org Chart (`/employees/org-chart`)**
- Auto-rendered tree from reporting lines
- Click on node → employee profile

---

### MODULE 12 — Attendance (الحضور والانصراف)

**Purpose:** Daily attendance log, shifts, overtime, biometric import.

#### Screens

**12.1 Attendance Sheet (`/attendance`)**
- Month/week view: rows = employees, columns = days
- Cell values: Present / Absent / Leave type / Hours
- Color-coded: green (present) / red (absent) / yellow (leave) / blue (overtime)
- Inline edit per cell
- CTA: "+ تسجيل يدوي"

**12.2 Attendance Entry — New (`/attendance/new`)**
- Form: Employee | Date | Check-in time | Check-out time | Working hours (auto-calc) | Day status | Notes

**12.3 Import from Biometric (`/attendance/import`)**
- Upload CSV (ZKTeco format)
- Preview parsed records
- Conflict detection (duplicate entries)
- Confirm import

**12.4 Overtime Requests (`/attendance/overtime`)**
- DataTable: Employee | Date | Extra Hours | Reason | Status
- Status: Pending / Approved / Rejected
- Supervisor approves/rejects inline

**12.5 Monthly Summary (`/attendance/summary`)**
- Per employee: Working days | Leave days | Absent | Overtime hours | Late count
- Feeds directly into payroll run
- Export Excel

---

### MODULE 13 — Payroll (الرواتب)

**Purpose:** Monthly salary run with full deduction/addition tracking. Fully locked once approved.

#### Screens

**13.1 Payroll Runs List (`/payroll`)**
- DataTable: Month | Status | Employee Count | Total Net | Approved By | Date
- Status: Draft / Reviewed / Approved / Paid
- CTA: "+ بدء مسير رواتب"

**13.2 Payroll Run — New (`/payroll/new`)**
- Select month
- Auto-loads all active employees with:
  - Basic salary
  - Attendance working days (from Module 12 summary)
  - Pre-filled advances, deductions, gratuities from employee records
- Editable table per employee:
  - Basic | Housing | Transport | Food | Mobile allowances
  - Advances deducted | Deductions | Gratuities
  - Insurance | Tax
  - Net salary (auto-calculated)
- Running totals row at bottom

**13.3 Payroll Run — Detail / Review (`/payroll/:id`)**
- Full employee breakdown table (read-only after approval)
- Status timeline: Draft → Reviewed → Approved → Paid
- Approve button: triggers re-auth dialog → on confirm locks run + posts GL
- Print all payslips button

**13.4 Payslip — View (`/payroll/:id/payslip/:employeeId`)**
- Individual payslip: employee details + salary breakdown + net
- Print button (QuestPDF on server, rendered in browser)

**13.5 Advance Disbursement (`/payroll/advances/new`)**
- Form: Employee | Date | Amount | Notes
- Auto-deducted in next payroll run

**13.6 Advances List (`/payroll/advances`)**
- DataTable: Employee | Date | Amount | Remaining | Status

**13.7 Deductions & Gratuities (`/payroll/adjustments`)**
- DataTable: Employee | Date | Type (Deduction/Gratuity) | Amount | Reason
- CTA: "+ إضافة خصم / إكرامية"

---

### MODULE 14 — HR & Leaves (الإجازات)
**Priority: V2 — ships after stable V1**

#### Screens

**14.1 Leave Requests List (`/hr/leaves`)**
- DataTable: Employee | Type | Start | End | Days | Status
- Status: Pending / Approved / Rejected
- CTA: "+ طلب إجازة"

**14.2 Leave Request — New (`/hr/leaves/new`)**
- Form: Employee | Leave type (Annual / Sick / Emergency / Unpaid) | Start date | End date | Reason
- Auto-shows remaining balance of selected type

**14.3 Team Calendar (`/hr/calendar`)**
- Monthly calendar view
- All approved absences shown per department/group
- Color-coded by leave type

**14.4 HR Reports (`/hr/reports`)**
- Headcount over time
- New hires + terminations per month
- Leave utilisation per employee
- Turnover rate chart

---

### MODULE 15 — Reports Center (التقارير)

**Purpose:** Unified launcher for all system reports.

#### Screens

**15.1 Reports Home (`/reports`)**
- Searchable grid of all reports
- Grouped by module category
- Each card: Report name (AR) + description + icon
- Click → opens report with filter panel

**15.2 Report Viewer (shared pattern for all reports)**
- Page structure:
  - Filter bar: Date range | Group by | Module-specific filters
  - Preview table with subtotals
  - Charts (where applicable)
  - Export bar: Excel | PDF | Print

**Full report list by category:**

| Category | Reports |
|---|---|
| Cattle (الرؤوس) | Head list, Cycle summary, Feed cost per head, ADG report, Loss report, Weight history, Station count |
| Inventory (المخزون) | Stock balance, Stock ledger, Remaining days by item, Stock shortages, Item movement, Physical count variance |
| Purchasing (المشتريات) | PO status, GRN summary, Supplier bill aging, Purchase returns |
| Sales (المبيعات) | Sales summary, Invoice list, Customer aging, Instalment schedule, Cattle sales P&L |
| Accounts (الحسابات) | Trial balance, Income statement, Balance sheet, Account statement, Cost centre P&L, Cash flow |
| Cashier (الخزينة) | Safe daily log, Bank reconciliation, Cheque register, Cash request log |
| HR (الموارد البشرية) | Headcount, Attendance summary, Overtime, Leave utilisation, Payroll summary, Payslip history, Loan balance |
| Equipment (المعدات) | Monthly consumption rates, Maintenance history, Spare parts cost, Expected next service |

---

### MODULE 16 — Settings & Administration (الإعدادات)

**Purpose:** System configuration, farm profile, number series, backups.

#### Screens

**16.1 Farm Profile (`/settings/profile`)**
- Fields: Farm name (AR + EN) | Logo upload | Address | Fiscal year start | Currency | VAT rate | Invoice prefix

**16.2 Number Series (`/settings/number-series`)**
- Table: Transaction type | Prefix | Next number | Preview
- Types: INV- | PO- | REC- | PAY- | CYC- | MIX-
- Editable prefix + starting number

**16.3 Notification Templates (`/settings/notifications`)**
- List of system notifications (overdue payment, low stock, etc.)
- Each: toggle on/off | message template | recipients | trigger delay

**16.4 Database Backup (`/settings/backup`)**
- Manual backup: button → triggers download
- Scheduled backup: frequency selector (daily / every N hours) + time
- Backup history log: date | size | status | download link

**16.5 Audit Log (`/settings/audit`)**
- DataTable: Timestamp | User | Table | Record ID | Action | Old Value | New Value | IP
- Filter by user, table, date
- Read-only — populated by SQL triggers only
- 7-year retention enforced

---

## 8. Route Map Summary

```
/                           → Dashboard
/login                      → Login

/cattle/cycles              → Cycles List
/cattle/cycles/:id          → Cycle Detail (tabs)
/cattle/cycles/new          → New Cycle
/cattle/shipments/new       → New Shipment Receipt
/cattle/feeding/new         → New Mixer Drop
/cattle/losses/new          → New Loss Event
/cattle/weights/new         → New Weight Entry
/cattle/sales/new           → New Cattle Sale
/cattle/pens                → Pen Management
/cattle/report              → Station Overview

/inventory                  → Stock Overview
/inventory/items            → Items List
/inventory/items/:id        → Item Detail
/inventory/items/new        → Add Item
/inventory/warehouses       → Warehouses
/inventory/mixers           → Mixer Master List
/inventory/mixers/:id       → Mixer Detail
/inventory/receipts         → Receipt Transactions
/inventory/receipts/new     → New Receipt
/inventory/issues           → Issue Transactions
/inventory/issues/new       → New Issue
/inventory/shortages        → Shortages Report

/purchasing/orders          → PO List
/purchasing/orders/new      → New PO
/purchasing/orders/:id      → PO Detail
/purchasing/grn             → GRN List
/purchasing/grn/new         → New GRN
/purchasing/bills           → Supplier Bills
/purchasing/bills/:id       → Bill Match View
/purchasing/returns         → Purchase Returns
/purchasing/returns/new     → New Return

/sales                      → Sales Invoices
/sales/new                  → New Sale Invoice
/sales/:id                  → Invoice Detail
/sales/:id/payment          → Record Payment
/sales/instalments          → Instalment Schedule
/sales/returns              → Sales Returns

/accounts/coa               → Chart of Accounts
/accounts/journal           → Journal Entries
/accounts/journal/new       → New Journal Entry
/accounts/journal/:id       → Journal Entry Detail
/accounts/cost-centres      → Cost Centres
/accounts/cost-centres/:id  → Cost Centre P&L
/accounts/periods           → Period Management
/accounts/reports           → Financial Reports Hub

/cashier                    → Safes Overview
/cashier/safe/:id/log       → Safe Daily Log
/cashier/receipt/new        → New Receipt Voucher
/cashier/payment/new        → New Payment Voucher
/cashier/banks              → Bank Accounts
/cashier/banks/:id          → Bank Ledger
/cashier/cheques            → Cheque Register
/cashier/reconciliation     → Bank Reconciliation
/cashier/petty-cash         → Petty Cash
/cashier/cash-requests      → Cash Requests

/suppliers                  → Suppliers List
/suppliers/new              → Add Supplier
/suppliers/:id              → Supplier Statement

/customers                  → Customers List
/customers/new              → Add Customer
/customers/:id              → Customer Statement

/employees                  → Employees List
/employees/new              → Add Employee
/employees/:id              → Employee Profile
/employees/org-chart        → Org Chart

/attendance                 → Attendance Sheet
/attendance/new             → Manual Entry
/attendance/import          → Biometric Import
/attendance/overtime        → Overtime Requests
/attendance/summary         → Monthly Summary

/payroll                    → Payroll Runs List
/payroll/new                → New Payroll Run
/payroll/:id                → Payroll Run Detail
/payroll/:id/payslip/:eid   → Payslip View
/payroll/advances           → Advances List
/payroll/advances/new       → New Advance
/payroll/adjustments        → Deductions & Gratuities

/hr/leaves                  → Leave Requests
/hr/leaves/new              → New Leave Request
/hr/calendar                → Team Calendar
/hr/reports                 → HR Reports

/reports                    → Reports Center

/settings/profile           → Farm Profile
/settings/users             → Users List
/settings/users/new         → Add User
/settings/users/:id/edit    → Edit User
/settings/roles             → Roles List
/settings/roles/:id/permissions → Permission Grid
/settings/number-series     → Number Series
/settings/notifications     → Notification Templates
/settings/backup            → Database Backup
/settings/audit             → Audit Log
```

---

## 9. Sidebar Navigation Structure

```
الرئيسية          (Dashboard)          /
─────────────────────────────────────────
الرؤوس والدورات   (Cattle)
  ├── الدورات      Cycles               /cattle/cycles
  ├── العنابر      Pens                 /cattle/pens
  └── نزول ميكسر  Mixer Drop           /cattle/feeding/new
─────────────────────────────────────────
المخزون           (Inventory)
  ├── الأصناف      Items                /inventory/items
  ├── المخازن      Warehouses           /inventory/warehouses
  ├── الميكسرات    Mixers               /inventory/mixers
  ├── الاستلامات   Receipts             /inventory/receipts
  └── الصرف        Issues               /inventory/issues
─────────────────────────────────────────
المشتريات         (Purchasing)
  ├── أوامر الشراء PO List              /purchasing/orders
  ├── استلام بضاعة GRN                  /purchasing/grn
  ├── فواتير الموردين Bills             /purchasing/bills
  └── المرتجعات    Returns              /purchasing/returns
─────────────────────────────────────────
المبيعات          (Sales)
  ├── الفواتير      Invoices             /sales
  ├── الأقساط       Instalments          /sales/instalments
  └── المرتجعات    Returns              /sales/returns
─────────────────────────────────────────
الحسابات          (Accounts)
  ├── دليل الحسابات COA                 /accounts/coa
  ├── القيود        Journal              /accounts/journal
  ├── مراكز التكلفة Cost Centres         /accounts/cost-centres
  ├── الفترات       Periods              /accounts/periods
  └── التقارير      Reports              /accounts/reports
─────────────────────────────────────────
الخزينة والبنوك   (Cashier & Bank)
  ├── الخزائن       Safes                /cashier
  ├── البنوك        Banks                /cashier/banks
  ├── الشيكات       Cheques              /cashier/cheques
  ├── المطابقة      Reconciliation       /cashier/reconciliation
  └── طلبات نقدية   Cash Requests        /cashier/cash-requests
─────────────────────────────────────────
الموردين          (Suppliers)            /suppliers
العملاء           (Customers)            /customers
─────────────────────────────────────────
الموظفين          (Employees)
  ├── الموظفون      Staff List           /employees
  ├── الهيكل       Org Chart            /employees/org-chart
  ├── الحضور       Attendance           /attendance
  ├── مسير الرواتب  Payroll              /payroll
  └── الإجازات     HR & Leaves          /hr/leaves
─────────────────────────────────────────
التقارير          (Reports)              /reports
─────────────────────────────────────────
الإعدادات         (Settings)
  ├── المزرعة       Farm Profile         /settings/profile
  ├── المستخدمون    Users                /settings/users
  ├── الأدوار       Roles                /settings/roles
  ├── تسلسل الأرقام Number Series        /settings/number-series
  └── سجل التدقيق   Audit Log            /settings/audit
```

---

## 10. Key UX Patterns

| Pattern | Implementation |
|---|---|
| Empty state | Illustrated SVG + Arabic CTA text — never blank white page |
| Loading state | Skeleton shimmer (not spinner) for tables and cards |
| Form validation | Inline error under each field, Zod schema, red border |
| Success feedback | Toast notification (top-end, RTL) — auto-dismisses in 3s |
| Destructive action | ConfirmDialog with re-auth (password re-entry) |
| Long tables | Virtualized with TanStack Table — no pagination limit issues |
| Mobile | Responsive — sidebar collapses to bottom nav on small screens |
| Dark mode | CSS variables flip via `[data-theme="dark"]` — future ready |
| Permissions | Every action button checks permissions[] from JWT — hidden if not permitted |
| Status workflow | Visual step indicator for multi-status flows (PO, Payroll, etc.) |

---

*Negm Farm ERP — Frontend Reference v1.0*
*React 18 + Vite + TypeScript | Cairo Font | Arabic RTL Primary*
*16 Modules | ~65 Screens | shadcn/ui + Tailwind CSS*
