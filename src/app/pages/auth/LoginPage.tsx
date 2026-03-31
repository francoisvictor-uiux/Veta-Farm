import { useState } from 'react'
import { Eye, EyeOff, Mail, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginForm {
  email: string
  password: string
  remember: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

// ─── Logo SVG ─────────────────────────────────────────────────────────────────

function LogoIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="22" fill="#eef6ec" />
      <g transform="translate(11,8)">
        <path d="M11 29 L11 14" stroke="#1a4a26" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M11 14 C11 8 19 4 21 2 C21 2 21 10 15 14 C13.5 15 11 14 11 14Z" fill="#1a4a26" />
        <path d="M11 19 C11 13 3 9 1 7 C1 7 1 15 7 19 C8.5 20 11 19 11 19Z" fill="#1a4a26" opacity="0.7" />
        <path d="M11 23 C13 19 19 17 21 15 C21 15 19 21 14 24 C12.5 25 11 23 11 23Z" fill="#1a4a26" opacity="0.5" />
      </g>
    </svg>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-3 justify-end py-1">
      <div className="flex flex-col items-end">
        <span className="font-cairo font-bold text-[20px] text-primary-500 leading-snug">
          نجم فارم
        </span>
        <span className="font-cairo font-medium text-[10px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">
          نظام إدارة محطات التسمين
        </span>
      </div>
      <LogoIcon />
    </div>
  )
}

// ─── Input Field ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string
  id: string
  type: string
  value: string
  placeholder: string
  onChange: (v: string) => void
  error?: string
  iconStart: React.ReactNode
  iconEnd?: React.ReactNode
  onIconEndClick?: () => void
}

function InputField({
  label, id, type, value, placeholder,
  onChange, error, iconStart, iconEnd, onIconEndClick,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={id}
        className="font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wider text-right"
      >
        {label}
      </label>

      <div
        className={[
          'flex items-center gap-2 h-11 px-4 rounded-[12px] border transition-all duration-150',
          'bg-neutral-100',
          error
            ? 'border-error-500 ring-2 ring-error-500/20'
            : 'border-neutral-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
        ].join(' ')}
      >
        <span className="text-neutral-500 shrink-0 flex items-center">{iconStart}</span>

        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
          onChange={(e) => onChange(e.target.value)}
          dir={type === 'password' ? 'ltr' : 'auto'}
          className={[
            'flex-1 min-w-0 bg-transparent outline-none',
            'font-cairo font-medium text-[13px] text-neutral-900',
            'placeholder:text-neutral-400',
            'text-right',
          ].join(' ')}
        />

        {iconEnd && (
          <button
            type="button"
            onClick={onIconEndClick}
            tabIndex={-1}
            aria-label="تبديل إظهار كلمة المرور"
            className="text-neutral-500 shrink-0 flex items-center hover:text-primary-500 transition-colors"
          >
            {iconEnd}
          </button>
        )}
      </div>

      {error && (
        <p className="font-cairo text-[11px] text-error-500 text-right">{error}</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.email.trim()) {
      e.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'صيغة البريد الإلكتروني غير صحيحة'
    }
    if (!form.password) {
      e.password = 'كلمة المرور مطلوبة'
    } else if (form.password.length < 6) {
      e.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setIsLoading(true)
    // Simulate auth
    await new Promise((r) => setTimeout(r, 1400))
    setIsLoading(false)
    navigate('/')
  }

  function setField(field: keyof LoginForm) {
    return (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex font-cairo bg-neutral-100" dir="rtl">

      {/* ── Left panel: decorative farm visual ── */}
      <div
        className="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-col"
        style={{
          background: 'linear-gradient(150deg, #0e2604 0%, #1a4a26 35%, #2d6e3e 60%, #4a9e60 80%, #73b367 95%, #b9d9b3 100%)',
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        {/* Decorative hills silhouette */}
        <div className="absolute bottom-0 inset-x-0 opacity-15">
          <svg viewBox="0 0 900 300" className="w-full" fill="white" preserveAspectRatio="none">
            <path d="M0 300 Q150 160 300 200 Q450 240 600 160 Q750 80 900 180 L900 300 Z" />
            <path d="M0 300 Q200 200 400 230 Q600 260 900 220 L900 300 Z" opacity="0.5" />
          </svg>
        </div>

        {/* KPI preview cards */}
        <div className="relative flex-1 flex flex-col justify-center px-14 py-12 gap-6">
          <div className="space-y-2 mb-4">
            <h2 className="font-cairo font-bold text-[36px] text-white leading-tight">
              نجم فارم
            </h2>
            <p className="font-cairo font-medium text-[15px] text-white/70">
              نظام إدارة محطات التسمين المتكامل
            </p>
          </div>

          {/* Feature chips */}
          {[
            { icon: '🐄', text: 'تتبع كامل لكل رأس ماشية' },
            { icon: '📦', text: 'إدارة المخزون والميكسرات' },
            { icon: '💰', text: 'محاسبة متكاملة وكشوف حسابات' },
            { icon: '👥', text: 'رواتب وحضور 13+ موظف' },
            { icon: '📊', text: 'لوحة تحكم مباشرة للمالك' },
          ].map((f) => (
            <div
              key={f.text}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-[12px] px-4 py-3"
            >
              <span className="text-[18px]">{f.icon}</span>
              <span className="font-cairo font-medium text-[13px] text-white/90">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom brand */}
        <div className="relative px-14 pb-10">
          <p className="font-cairo text-[12px] text-white/30">
            © 2025 نجم فارم — جميع الحقوق محفوظة
          </p>
        </div>

        {/* Edge fade */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-l from-neutral-100/0 to-transparent pointer-events-none" />
      </div>

      {/* ── Right panel: Login card ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 lg:px-16">
        <div className="w-full max-w-[400px]">

          <div className="bg-white border border-neutral-200 rounded-[16px] p-7 flex flex-col gap-6 shadow-sm">

            {/* Logo */}
            <Logo />

            {/* Divider */}
            <div className="h-px bg-neutral-100" />

            {/* Heading */}
            <div className="flex flex-col items-end gap-1">
              <h1 className="font-cairo font-bold text-[26px] text-primary-500 leading-tight">
                أهلاً بعودتك
              </h1>
              <p className="font-cairo font-medium text-[12px] text-neutral-500 uppercase tracking-wide">
                سجّل الدخول إلى حسابك
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

              <div className="flex flex-col gap-4">
                <InputField
                  label="البريد الإلكتروني"
                  id="email"
                  type="email"
                  value={form.email}
                  placeholder="you@negmfarm.com"
                  onChange={setField('email')}
                  error={errors.email}
                  iconStart={<Mail size={16} />}
                />
                <InputField
                  label="كلمة المرور"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  placeholder="••••••••"
                  onChange={setField('password')}
                  error={errors.password}
                  iconStart={<KeyRound size={16} />}
                  iconEnd={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  onIconEndClick={() => setShowPassword((v) => !v)}
                />
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="font-cairo font-medium text-[11px] text-neutral-500 uppercase tracking-wide hover:text-primary-500 transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="font-cairo font-medium text-[11px] text-neutral-600 uppercase tracking-wide">
                    تذكرني
                  </span>
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                    className="w-4 h-4 rounded border border-neutral-300 accent-primary-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* General error */}
              {errors.general && (
                <div className="bg-error-50 border border-error-200 rounded-[10px] px-4 py-3">
                  <p className="font-cairo font-medium text-[12px] text-error-600 text-right">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={[
                  'w-full h-11 rounded-[12px]',
                  'font-cairo font-semibold text-[14px] text-white',
                  'bg-primary-500 hover:bg-primary-600',
                  'active:scale-[0.98] transition-all duration-150',
                  'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
                  'flex items-center justify-center gap-2',
                ].join(' ')}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>جارٍ تسجيل الدخول...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="font-cairo font-medium text-[11px] text-neutral-500 text-center flex items-center justify-center gap-2 pt-2 border-t border-neutral-100">
              <span>ليس لديك حساب؟</span>
              <button type="button" className="text-primary-500 hover:underline transition-colors normal-case">
                تواصل مع الإدارة
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
