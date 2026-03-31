export interface Employee {
  id: string
  employeeNumber: string      // رقم الموظف
  name: string
  jobTitle: string
  department: string
  startDate: string           // بداية العمل
  annualLeave: number         // رصيد الإجازات السنوية الكلي (أيام)
  usedLeave: number           // الإجازات المستخدمة
  photo?: string
  isActive: boolean
}

export type LeaveType = 'annual' | 'sick' | 'emergency' | 'unpaid' | 'none'

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual:    'إجازة سنوية',
  sick:      'إجازة مرضية',
  emergency: 'إجازة طارئة',
  unpaid:    'إجازة بدون راتب',
  none:      'غياب بدون إذن',
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-time' | 'leave'
  leaveType?: LeaveType       // نوع الإجازة عند الغياب
  notes?: string
  duration?: number           // في دقائق
}

export interface AttendanceStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateToday: number
  onLeave: number
}

// عمليات مالية سريعة مرتبطة بالموظف
export interface QuickTransaction {
  id: string
  employeeId: string
  date: string
  type: 'advance' | 'advance-return' | 'gratuity' | 'bonus' | 'deduction'
  amount: number
  notes?: string
}
