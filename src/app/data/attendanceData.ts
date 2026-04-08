import { AttendanceRecord } from '../types/attendance'

// ─── Record Builder ───────────────────────────────────────────────────────────
// Employee IDs correspond to EmployeesPage INITIAL_EMPLOYEES (e1-e25).
// Attendance tracks: e1, e2, e3, e4, e5, e7, e9, e10 (all active).

let _seq = 1
function nid() { return `att-${_seq++}` }

type R = AttendanceRecord

function ok(empId: string, date: string, ci = '07:50', co = '16:30'): R {
  return { id: nid(), employeeId: empId, date, checkIn: ci, checkOut: co, status: 'on-time', duration: 520 }
}
function late(empId: string, date: string, ci: string, notes?: string): R {
  return { id: nid(), employeeId: empId, date, checkIn: ci, checkOut: '16:30', status: 'late', notes }
}
function half(empId: string, date: string, notes?: string): R {
  return { id: nid(), employeeId: empId, date, checkIn: '07:55', checkOut: '12:30', status: 'half-day', duration: 275, notes }
}
function abs(empId: string, date: string, notes?: string): R {
  return { id: nid(), employeeId: empId, date, status: 'absent', notes }
}
function lv(empId: string, date: string, leaveType: R['leaveType'], notes?: string): R {
  return { id: nid(), employeeId: empId, date, status: 'leave', leaveType, notes }
}

// ─── Active employees tracked in attendance ───────────────────────────────────
// e1 = أحمد محمود النجار  (مدير عام)
// e2 = محمد علي حسن       (مدير عمليات)
// e3 = كريم عبدالله الشيخ  (دكتور بيطري أول)
// e4 = سارة طارق حجازي    (محاسبة قانونية)
// e5 = عمر رمضان درويش    (مسئول مخزن)
// e7 = مصطفى سامي منصور   (مسئول مشتريات)
// e9 = نور إبراهيم طه      (مديرة إنتاج)
// e10= ياسر سعد حافظ      (مسئول مخزن)
const TRACKED = ['e1','e2','e3','e4','e5','e7','e9','e10']

// ─── Working Dates (Sun-Thu, Egypt calendar) ──────────────────────────────────
const dates = [
  // Week 1 — Mar 9–13
  '2026-03-09','2026-03-10','2026-03-11','2026-03-12','2026-03-13',
  // Week 2 — Mar 15–19
  '2026-03-15','2026-03-16','2026-03-17','2026-03-18','2026-03-19',
  // Week 3 — Mar 22–26
  '2026-03-22','2026-03-23','2026-03-24','2026-03-25','2026-03-26',
  // Week 4 — Mar 29 – Apr 2
  '2026-03-29','2026-03-30','2026-03-31',
  '2026-04-01','2026-04-02',
  // Week 5 — Apr 5–7
  '2026-04-05','2026-04-06','2026-04-07',
]

// Default: everyone is on-time. Override specific employee/date pairs below.
const overrides: Record<string, Record<string, R>> = {}
function ex(r: R) {
  if (!overrides[r.date]) overrides[r.date] = {}
  overrides[r.date][r.employeeId] = r
}

// ── Week 1 ─────────────────────────────────────────────────────────────────
ex(late('e2', '2026-03-10', '08:25', 'ظروف طارئة'))
ex(late('e3', '2026-03-11', '08:50'))
ex(lv  ('e4', '2026-03-12', 'sick',  'إجازة مرضية'))
ex(late('e10','2026-03-13', '08:20'))
// ── Week 2 ─────────────────────────────────────────────────────────────────
ex(late('e2', '2026-03-15', '08:35'))
ex(late('e5', '2026-03-16', '08:30'))
ex(half('e9', '2026-03-17',          'مغادرة مبكرة بإذن'))
ex(late('e3', '2026-03-18', '09:00'))
ex(lv  ('e1', '2026-03-19', 'annual','إجازة سنوية'))
ex(lv  ('e2', '2026-03-19', 'annual','إجازة سنوية'))
// ── Week 3 ─────────────────────────────────────────────────────────────────
ex(late('e7', '2026-03-23', '08:40'))
ex(abs ('e2', '2026-03-24',          'غياب بدون إذن'))
ex(lv  ('e4', '2026-03-25', 'sick',  'إجازة مرضية'))
ex(late('e3', '2026-03-25', '09:10'))
ex(abs ('e10','2026-03-26',          'ظرف طارئ'))
// ── Week 4 ─────────────────────────────────────────────────────────────────
ex(late('e2', '2026-03-29', '08:15'))
ex(late('e3', '2026-03-30', '08:55'))
ex(lv  ('e4', '2026-04-01', 'sick',  'إجازة مرضية'))
ex(late('e5', '2026-04-02', '08:20'))
// ── Week 5 ─────────────────────────────────────────────────────────────────
ex(late('e1', '2026-04-05', '08:10'))
ex(late('e3', '2026-04-06', '09:20'))
ex(late('e7', '2026-04-07', '08:35'))

// Build historical records
const historical: R[] = []
for (const date of dates) {
  for (const empId of TRACKED) {
    const override = overrides[date]?.[empId]
    historical.push(override ?? ok(empId, date))
  }
}

// ─── Today ────────────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]

const todayRecords: R[] = [
  ok  ('e1',  today, '07:45', '16:30'),
  late('e2',  today, '08:15', 'ظروف طارئة'),
  ok  ('e3',  today, '07:50', '16:00'),
  lv  ('e4',  today, 'sick',  'إجازة مرضية'),
  ok  ('e5',  today, '08:00'),
  late('e7',  today, '09:30'),
  half('e9',  today,           'مغادرة مبكرة بإذن'),
  ok  ('e10', today, '07:55', '16:30'),
]

export const attendanceRecords: AttendanceRecord[] = [
  ...historical,
  ...todayRecords,
]
