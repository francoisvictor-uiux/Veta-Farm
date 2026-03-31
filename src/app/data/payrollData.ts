import { PayrollEmployee, PayrollRecord } from '../types/payroll'

export const payrollEmployees: PayrollEmployee[] = [
  { id: '1', employeeNumber: 'EMP-001', name: 'أحمد محمد علي',  jobTitle: 'مدير المزرعة',      department: 'الإدارة',  baseSalary: 8500, insurance: 425, taxes: 212, annualLeave: 21, startDate: '2020-01-15' },
  { id: '2', employeeNumber: 'EMP-002', name: 'فاطمة حسن',      jobTitle: 'مشرفة الماشية',     department: 'الماشية',  baseSalary: 5200, insurance: 260, taxes: 104, annualLeave: 21, startDate: '2021-03-01' },
  { id: '3', employeeNumber: 'EMP-003', name: 'محمود إبراهيم',  jobTitle: 'عامل المزرعة',      department: 'الإنتاج',  baseSalary: 3800, insurance: 190, taxes:  76, annualLeave: 21, startDate: '2022-06-10' },
  { id: '4', employeeNumber: 'EMP-004', name: 'سارة خالد',      jobTitle: 'محاسبة',            department: 'المالية',  baseSalary: 5800, insurance: 290, taxes: 116, annualLeave: 21, startDate: '2021-09-01' },
  { id: '5', employeeNumber: 'EMP-005', name: 'عمر السيد',      jobTitle: 'فني صيانة',         department: 'الصيانة',  baseSalary: 4200, insurance: 210, taxes:  84, annualLeave: 21, startDate: '2022-02-14' },
  { id: '6', employeeNumber: 'EMP-006', name: 'نور الدين أحمد', jobTitle: 'طبيب بيطري',        department: 'الصحة',    baseSalary: 7000, insurance: 350, taxes: 175, annualLeave: 21, startDate: '2020-07-20' },
  { id: '7', employeeNumber: 'EMP-007', name: 'ليلى مصطفى',    jobTitle: 'مسؤولة المخزون',    department: 'المخازن',  baseSalary: 4500, insurance: 225, taxes:  90, annualLeave: 21, startDate: '2023-01-05' },
  { id: '8', employeeNumber: 'EMP-008', name: 'يوسف عبدالله',  jobTitle: 'سائق',              department: 'النقل',    baseSalary: 3600, insurance: 180, taxes:  72, annualLeave: 21, startDate: '2022-11-01' },
]

const currentMonth = new Date().toISOString().slice(0, 7)
const lastMonth = (() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 7)
})()

function calcNet(r: Omit<PayrollRecord, 'netSalary' | 'id' | 'employeeId' | 'month' | 'status' | 'paidAt' | 'notes'>): number {
  return Math.max(0, r.baseSalary + r.allowances + r.gratuities + r.bonus - r.insurance - r.taxes - r.advances - r.deductions)
}

export const payrollRecords: PayrollRecord[] = [
  // الشهر الحالي
  {
    id: 'pay-1', employeeId: '1', month: currentMonth,
    baseSalary: 8500, insurance: 425, taxes: 212, advances: 0,
    allowances: 1200, gratuities: 300, deductions: 320, bonus: 500,
    workDays: 26, leaveDays: 0, status: 'pending',
    netSalary: calcNet({ baseSalary: 8500, insurance: 425, taxes: 212, advances: 0, allowances: 1200, gratuities: 300, deductions: 320, bonus: 500, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-2', employeeId: '2', month: currentMonth,
    baseSalary: 5200, insurance: 260, taxes: 104, advances: 500,
    allowances: 800, gratuities: 0, deductions: 200, bonus: 0,
    workDays: 25, leaveDays: 1, status: 'pending',
    netSalary: calcNet({ baseSalary: 5200, insurance: 260, taxes: 104, advances: 500, allowances: 800, gratuities: 0, deductions: 200, bonus: 0, workDays: 25, leaveDays: 1 }),
  },
  {
    id: 'pay-3', employeeId: '3', month: currentMonth,
    baseSalary: 3800, insurance: 190, taxes: 76, advances: 0,
    allowances: 500, gratuities: 150, deductions: 150, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'pending',
    netSalary: calcNet({ baseSalary: 3800, insurance: 190, taxes: 76, advances: 0, allowances: 500, gratuities: 150, deductions: 150, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-4', employeeId: '4', month: currentMonth,
    baseSalary: 5800, insurance: 290, taxes: 116, advances: 1000,
    allowances: 700, gratuities: 0, deductions: 180, bonus: 300,
    workDays: 24, leaveDays: 2, status: 'on-hold', notes: 'في انتظار مراجعة الغياب',
    netSalary: calcNet({ baseSalary: 5800, insurance: 290, taxes: 116, advances: 1000, allowances: 700, gratuities: 0, deductions: 180, bonus: 300, workDays: 24, leaveDays: 2 }),
  },
  {
    id: 'pay-5', employeeId: '5', month: currentMonth,
    baseSalary: 4200, insurance: 210, taxes: 84, advances: 0,
    allowances: 600, gratuities: 0, deductions: 120, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'pending',
    netSalary: calcNet({ baseSalary: 4200, insurance: 210, taxes: 84, advances: 0, allowances: 600, gratuities: 0, deductions: 120, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-6', employeeId: '6', month: currentMonth,
    baseSalary: 7000, insurance: 350, taxes: 175, advances: 0,
    allowances: 900, gratuities: 500, deductions: 250, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: new Date().toISOString().split('T')[0],
    netSalary: calcNet({ baseSalary: 7000, insurance: 350, taxes: 175, advances: 0, allowances: 900, gratuities: 500, deductions: 250, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-7', employeeId: '7', month: currentMonth,
    baseSalary: 4500, insurance: 225, taxes: 90, advances: 0,
    allowances: 550, gratuities: 0, deductions: 160, bonus: 0,
    workDays: 25, leaveDays: 1, status: 'pending',
    netSalary: calcNet({ baseSalary: 4500, insurance: 225, taxes: 90, advances: 0, allowances: 550, gratuities: 0, deductions: 160, bonus: 0, workDays: 25, leaveDays: 1 }),
  },
  {
    id: 'pay-8', employeeId: '8', month: currentMonth,
    baseSalary: 3600, insurance: 180, taxes: 72, advances: 500,
    allowances: 400, gratuities: 0, deductions: 100, bonus: 200,
    workDays: 26, leaveDays: 0, status: 'partial', notes: 'صُرف جزء مقدم',
    netSalary: calcNet({ baseSalary: 3600, insurance: 180, taxes: 72, advances: 500, allowances: 400, gratuities: 0, deductions: 100, bonus: 200, workDays: 26, leaveDays: 0 }),
  },
  // الشهر الماضي
  {
    id: 'pay-9',  employeeId: '1', month: lastMonth,
    baseSalary: 8500, insurance: 425, taxes: 212, advances: 0,
    allowances: 1200, gratuities: 500, deductions: 300, bonus: 1000,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 8500, insurance: 425, taxes: 212, advances: 0, allowances: 1200, gratuities: 500, deductions: 300, bonus: 1000, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-10', employeeId: '2', month: lastMonth,
    baseSalary: 5200, insurance: 260, taxes: 104, advances: 0,
    allowances: 800, gratuities: 0, deductions: 190, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 5200, insurance: 260, taxes: 104, advances: 0, allowances: 800, gratuities: 0, deductions: 190, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-11', employeeId: '3', month: lastMonth,
    baseSalary: 3800, insurance: 190, taxes: 76, advances: 0,
    allowances: 500, gratuities: 0, deductions: 140, bonus: 0,
    workDays: 25, leaveDays: 1, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 3800, insurance: 190, taxes: 76, advances: 0, allowances: 500, gratuities: 0, deductions: 140, bonus: 0, workDays: 25, leaveDays: 1 }),
  },
  {
    id: 'pay-12', employeeId: '4', month: lastMonth,
    baseSalary: 5800, insurance: 290, taxes: 116, advances: 0,
    allowances: 700, gratuities: 0, deductions: 175, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 5800, insurance: 290, taxes: 116, advances: 0, allowances: 700, gratuities: 0, deductions: 175, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-13', employeeId: '5', month: lastMonth,
    baseSalary: 4200, insurance: 210, taxes: 84, advances: 0,
    allowances: 600, gratuities: 0, deductions: 110, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 4200, insurance: 210, taxes: 84, advances: 0, allowances: 600, gratuities: 0, deductions: 110, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-14', employeeId: '6', month: lastMonth,
    baseSalary: 7000, insurance: 350, taxes: 175, advances: 0,
    allowances: 900, gratuities: 200, deductions: 240, bonus: 500,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 7000, insurance: 350, taxes: 175, advances: 0, allowances: 900, gratuities: 200, deductions: 240, bonus: 500, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-15', employeeId: '7', month: lastMonth,
    baseSalary: 4500, insurance: 225, taxes: 90, advances: 0,
    allowances: 550, gratuities: 0, deductions: 155, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 4500, insurance: 225, taxes: 90, advances: 0, allowances: 550, gratuities: 0, deductions: 155, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
  {
    id: 'pay-16', employeeId: '8', month: lastMonth,
    baseSalary: 3600, insurance: 180, taxes: 72, advances: 0,
    allowances: 400, gratuities: 0, deductions: 95, bonus: 0,
    workDays: 26, leaveDays: 0, status: 'paid', paidAt: lastMonth + '-28',
    netSalary: calcNet({ baseSalary: 3600, insurance: 180, taxes: 72, advances: 0, allowances: 400, gratuities: 0, deductions: 95, bonus: 0, workDays: 26, leaveDays: 0 }),
  },
]
