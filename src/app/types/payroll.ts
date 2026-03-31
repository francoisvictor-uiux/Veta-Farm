export interface PayrollEmployee {
  id: string
  employeeNumber: string      // رقم الموظف
  name: string
  jobTitle: string
  department: string
  baseSalary: number
  insurance: number           // تأمينات (مبلغ ثابت شهري)
  taxes: number               // ضرائب (مبلغ ثابت شهري)
  annualLeave: number         // رصيد الإجازات السنوية (أيام)
  startDate: string           // بداية العمل
  bankAccount?: string
}

export type PayrollStatus = 'paid' | 'pending' | 'on-hold' | 'partial'

export interface PayrollRecord {
  id: string
  employeeId: string
  month: string               // YYYY-MM
  baseSalary: number
  insurance: number           // تأمينات
  taxes: number               // ضرائب
  advances: number            // سُلف
  allowances: number          // بدلات
  gratuities: number          // اكراميات
  deductions: number          // خصومات أخرى
  bonus: number               // مكافآت
  workDays: number            // ايام العمل الفعلية
  leaveDays: number           // ايام الإجازة المستخدمة
  netSalary: number
  status: PayrollStatus
  paidAt?: string
  notes?: string
}
