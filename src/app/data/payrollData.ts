import { PayrollRecord } from '../types/payroll'

// ─── Employee IDs map to EmployeesPage INITIAL_EMPLOYEES ─────────────────────
// e1  = أحمد محمود النجار   — مدير عام          — basicSalary: 22000, ins: 2200, tax: 660
// e2  = محمد علي حسن        — مدير عمليات       — basicSalary: 16000, ins: 1600, tax: 480
// e3  = كريم عبدالله الشيخ  — دكتور بيطري أول   — basicSalary: 18000, ins: 1800, tax: 540
// e4  = سارة طارق حجازي     — محاسبة قانونية    — basicSalary: 12000, ins: 1200, tax: 360
// e5  = عمر رمضان درويش     — مسئول مخزن        — basicSalary:  5500, ins:  550, tax: 165
// e7  = مصطفى سامي منصور    — مسئول مشتريات     — basicSalary:  7500, ins:  750, tax: 225
// e9  = نور إبراهيم طه       — مديرة إنتاج       — basicSalary: 15000, ins: 1500, tax: 450
// e10 = ياسر سعد حافظ       — مسئول مخزن        — basicSalary:  6000, ins:  600, tax: 180

function net(baseSalary: number, insurance: number, taxes: number,
  allowances: number, gratuities: number, bonus: number,
  advances: number, deductions: number): number {
  return Math.max(0, baseSalary + allowances + gratuities + bonus - insurance - taxes - advances - deductions)
}

const cm = new Date().toISOString().slice(0, 7)
const lm = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7) })()
const lm2 = (() => { const d = new Date(); d.setMonth(d.getMonth() - 2); return d.toISOString().slice(0, 7) })()

export const payrollRecords: PayrollRecord[] = [
  // ─── الشهر الحالي (pending / on-hold) ───────────────────────────────────────
  {
    id:'pay-cm-1', employeeId:'e1',  month:cm,
    baseSalary:22000, insurance:2200, taxes:660, advances:0,
    allowances:2500, gratuities:500, deductions:400, bonus:1000,
    workDays:26, leaveDays:0, status:'pending',
    netSalary: net(22000,2200,660,2500,500,1000,0,400),
  },
  {
    id:'pay-cm-2', employeeId:'e2',  month:cm,
    baseSalary:16000, insurance:1600, taxes:480, advances:1000,
    allowances:1800, gratuities:0,   deductions:300, bonus:500,
    workDays:25, leaveDays:1, status:'pending',
    netSalary: net(16000,1600,480,1800,0,500,1000,300),
  },
  {
    id:'pay-cm-3', employeeId:'e3',  month:cm,
    baseSalary:18000, insurance:1800, taxes:540, advances:0,
    allowances:2000, gratuities:700, deductions:350, bonus:0,
    workDays:26, leaveDays:0, status:'pending',
    netSalary: net(18000,1800,540,2000,700,0,0,350),
  },
  {
    id:'pay-cm-4', employeeId:'e4',  month:cm,
    baseSalary:12000, insurance:1200, taxes:360, advances:2000,
    allowances:1200, gratuities:0,   deductions:200, bonus:300,
    workDays:24, leaveDays:2, status:'on-hold', notes:'في انتظار مراجعة الغياب',
    netSalary: net(12000,1200,360,1200,0,300,2000,200),
  },
  {
    id:'pay-cm-5', employeeId:'e5',  month:cm,
    baseSalary:5500,  insurance:550,  taxes:165, advances:0,
    allowances:600,  gratuities:0,   deductions:120, bonus:0,
    workDays:26, leaveDays:0, status:'pending',
    netSalary: net(5500,550,165,600,0,0,0,120),
  },
  {
    id:'pay-cm-6', employeeId:'e7',  month:cm,
    baseSalary:7500,  insurance:750,  taxes:225, advances:0,
    allowances:800,  gratuities:0,   deductions:150, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:cm+'-05',
    netSalary: net(7500,750,225,800,0,0,0,150),
  },
  {
    id:'pay-cm-7', employeeId:'e9',  month:cm,
    baseSalary:15000, insurance:1500, taxes:450, advances:0,
    allowances:1600, gratuities:0,   deductions:280, bonus:0,
    workDays:25, leaveDays:1, status:'pending',
    netSalary: net(15000,1500,450,1600,0,0,0,280),
  },
  {
    id:'pay-cm-8', employeeId:'e10', month:cm,
    baseSalary:6000,  insurance:600,  taxes:180, advances:500,
    allowances:650,  gratuities:0,   deductions:100, bonus:200,
    workDays:26, leaveDays:0, status:'partial', notes:'صُرف جزء مقدم',
    netSalary: net(6000,600,180,650,0,200,500,100),
  },

  // ─── الشهر الماضي (paid) ──────────────────────────────────────────────────
  {
    id:'pay-lm-1', employeeId:'e1',  month:lm,
    baseSalary:22000, insurance:2200, taxes:660, advances:0,
    allowances:2500, gratuities:800, deductions:380, bonus:2000,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm+'-28',
    netSalary: net(22000,2200,660,2500,800,2000,0,380),
  },
  {
    id:'pay-lm-2', employeeId:'e2',  month:lm,
    baseSalary:16000, insurance:1600, taxes:480, advances:0,
    allowances:1800, gratuities:0,   deductions:290, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm+'-28',
    netSalary: net(16000,1600,480,1800,0,0,0,290),
  },
  {
    id:'pay-lm-3', employeeId:'e3',  month:lm,
    baseSalary:18000, insurance:1800, taxes:540, advances:0,
    allowances:2000, gratuities:0,   deductions:340, bonus:0,
    workDays:25, leaveDays:1, status:'paid', paidAt:lm+'-28',
    netSalary: net(18000,1800,540,2000,0,0,0,340),
  },
  {
    id:'pay-lm-4', employeeId:'e4',  month:lm,
    baseSalary:12000, insurance:1200, taxes:360, advances:0,
    allowances:1200, gratuities:0,   deductions:185, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm+'-28',
    netSalary: net(12000,1200,360,1200,0,0,0,185),
  },
  {
    id:'pay-lm-5', employeeId:'e5',  month:lm,
    baseSalary:5500,  insurance:550,  taxes:165, advances:0,
    allowances:600,  gratuities:0,   deductions:110, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm+'-28',
    netSalary: net(5500,550,165,600,0,0,0,110),
  },
  {
    id:'pay-lm-6', employeeId:'e7',  month:lm,
    baseSalary:7500,  insurance:750,  taxes:225, advances:0,
    allowances:800,  gratuities:200, deductions:145, bonus:500,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm+'-28',
    netSalary: net(7500,750,225,800,200,500,0,145),
  },
  {
    id:'pay-lm-7', employeeId:'e9',  month:lm,
    baseSalary:15000, insurance:1500, taxes:450, advances:0,
    allowances:1600, gratuities:0,   deductions:270, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm+'-28',
    netSalary: net(15000,1500,450,1600,0,0,0,270),
  },
  {
    id:'pay-lm-8', employeeId:'e10', month:lm,
    baseSalary:6000,  insurance:600,  taxes:180, advances:0,
    allowances:650,  gratuities:0,   deductions:95,  bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm+'-28',
    netSalary: net(6000,600,180,650,0,0,0,95),
  },

  // ─── قبل الشهر الماضي (paid) ───────────────────────────────────────────────
  {
    id:'pay-lm2-1', employeeId:'e1',  month:lm2,
    baseSalary:22000, insurance:2200, taxes:660, advances:0,
    allowances:2500, gratuities:0,   deductions:370, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(22000,2200,660,2500,0,0,0,370),
  },
  {
    id:'pay-lm2-2', employeeId:'e2',  month:lm2,
    baseSalary:16000, insurance:1600, taxes:480, advances:0,
    allowances:1800, gratuities:0,   deductions:280, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(16000,1600,480,1800,0,0,0,280),
  },
  {
    id:'pay-lm2-3', employeeId:'e3',  month:lm2,
    baseSalary:18000, insurance:1800, taxes:540, advances:0,
    allowances:2000, gratuities:300, deductions:330, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(18000,1800,540,2000,300,0,0,330),
  },
  {
    id:'pay-lm2-4', employeeId:'e4',  month:lm2,
    baseSalary:12000, insurance:1200, taxes:360, advances:0,
    allowances:1200, gratuities:0,   deductions:175, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(12000,1200,360,1200,0,0,0,175),
  },
  {
    id:'pay-lm2-5', employeeId:'e5',  month:lm2,
    baseSalary:5500,  insurance:550,  taxes:165, advances:0,
    allowances:600,  gratuities:0,   deductions:105, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(5500,550,165,600,0,0,0,105),
  },
  {
    id:'pay-lm2-6', employeeId:'e7',  month:lm2,
    baseSalary:7500,  insurance:750,  taxes:225, advances:0,
    allowances:800,  gratuities:0,   deductions:140, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(7500,750,225,800,0,0,0,140),
  },
  {
    id:'pay-lm2-7', employeeId:'e9',  month:lm2,
    baseSalary:15000, insurance:1500, taxes:450, advances:0,
    allowances:1600, gratuities:0,   deductions:260, bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(15000,1500,450,1600,0,0,0,260),
  },
  {
    id:'pay-lm2-8', employeeId:'e10', month:lm2,
    baseSalary:6000,  insurance:600,  taxes:180, advances:0,
    allowances:650,  gratuities:0,   deductions:90,  bonus:0,
    workDays:26, leaveDays:0, status:'paid', paidAt:lm2+'-28',
    netSalary: net(6000,600,180,650,0,0,0,90),
  },
]
