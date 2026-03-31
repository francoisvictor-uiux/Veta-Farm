import { Employee, AttendanceRecord } from '../types/attendance'

export const employees: Employee[] = [
  { id: '1', employeeNumber: 'EMP-001', name: 'أحمد محمد علي',  jobTitle: 'مدير المزرعة',      department: 'الإدارة',  startDate: '2020-01-15', annualLeave: 21, usedLeave: 3,  isActive: true },
  { id: '2', employeeNumber: 'EMP-002', name: 'فاطمة حسن',      jobTitle: 'مشرفة الماشية',     department: 'الماشية',  startDate: '2021-03-01', annualLeave: 21, usedLeave: 5,  isActive: true },
  { id: '3', employeeNumber: 'EMP-003', name: 'محمود إبراهيم',  jobTitle: 'عامل المزرعة',      department: 'الإنتاج',  startDate: '2022-06-10', annualLeave: 21, usedLeave: 1,  isActive: true },
  { id: '4', employeeNumber: 'EMP-004', name: 'سارة خالد',      jobTitle: 'محاسبة',            department: 'المالية',  startDate: '2021-09-01', annualLeave: 21, usedLeave: 7,  isActive: true },
  { id: '5', employeeNumber: 'EMP-005', name: 'عمر السيد',      jobTitle: 'فني صيانة',         department: 'الصيانة',  startDate: '2022-02-14', annualLeave: 21, usedLeave: 2,  isActive: true },
  { id: '6', employeeNumber: 'EMP-006', name: 'نور الدين أحمد', jobTitle: 'طبيب بيطري',        department: 'الصحة',    startDate: '2020-07-20', annualLeave: 21, usedLeave: 4,  isActive: true },
  { id: '7', employeeNumber: 'EMP-007', name: 'ليلى مصطفى',    jobTitle: 'مسؤولة المخزون',    department: 'المخازن',  startDate: '2023-01-05', annualLeave: 21, usedLeave: 1,  isActive: true },
  { id: '8', employeeNumber: 'EMP-008', name: 'يوسف عبدالله',  jobTitle: 'سائق',              department: 'النقل',    startDate: '2022-11-01', annualLeave: 21, usedLeave: 0,  isActive: true },
]

const today = new Date().toISOString().split('T')[0]

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'att-1', employeeId: '1', date: today, checkIn: '07:45', checkOut: '16:30', status: 'on-time', duration: 525 },
  { id: 'att-2', employeeId: '2', date: today, checkIn: '08:15', status: 'late', notes: 'ظروف طارئة' },
  { id: 'att-3', employeeId: '3', date: today, checkIn: '07:50', checkOut: '16:00', status: 'on-time', duration: 490 },
  { id: 'att-4', employeeId: '4', date: today, status: 'leave', leaveType: 'sick', notes: 'إجازة مرضية' },
  { id: 'att-5', employeeId: '5', date: today, checkIn: '08:00', status: 'on-time' },
  { id: 'att-6', employeeId: '6', date: today, checkIn: '09:30', status: 'late' },
  { id: 'att-7', employeeId: '7', date: today, checkIn: '07:55', checkOut: '12:30', status: 'half-day', duration: 275, notes: 'مغادرة مبكرة بإذن' },
]
