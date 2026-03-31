import { useState } from 'react'
import { Eye, EyeOff, Mail, KeyRound } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Logo SVG (inline — matches Figma plant icon) ────────────────────────────
function LogoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#eef6ec" />
      <g transform="translate(9,7)">
        {/* stem */}
        <path d="M11 27 L11 15" stroke="#1a4a26" strokeWidth="2" strokeLinecap="round" />
        {/* top leaf */}
        <path d="M11 15 C11 9 19 5 21 3 C21 3 21 11 15 15 C13.5 16 11 15 11 15Z" fill="#1a4a26" />
        {/* left leaf */}
        <path d="M11 19 C11 13 3 9 1 7 C1 7 1 15 7 19 C8.5 20 11 19 11 19Z" fill="#1a4a26" opacity="0.7" />
        {/* right leaf */}
        <path d="M11 22 C13 18 19 16 21 14 C21 14 19 20 14 23 C12.5 24 11 22 11 22Z" fill="#1a4a26" opacity="0.5" />
      </g>
    </svg>
  )
}

// ─── Logo header ─────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-3 justify-end py-2">
      <div className="flex flex-col items-end">
        <span className="font-cairo font-bold text-[18px] text-primary-500 leading-snug">
          فيتا فــارم
        </span>
        <span className="font-cairo font-medium text-[11px] text-neutral-600 uppercase tracking-wide whitespace-nowrap">
          نظام محطة التسمين
        </span>
      </div>
      <LogoIcon />
    </div>
  )
}

// ─── Input Field ─────────────────────────────────────────────────────────────
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
    <div className="flex flex-col gap-2 w-full">
      <label
        htmlFor={id}
        className="font-cairo font-medium text-[11px] text-neutral-600 uppercase tracking-wide text-right"
      >
        {label}
      </label>

      <div
        className={[
          'flex items-center gap-2 h-11 px-[17px] rounded-[12px] border transition-all duration-150',
          'bg-neutral-100',
          error
            ? 'border-error-500 ring-2 ring-error-500/20'
            : 'border-neutral-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
        ].join(' ')}
      >
        {/* icon — inline-end side (right in RTL) */}
        <span className="text-neutral-600 shrink-0 flex items-center">{iconStart}</span>

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
            'placeholder:text-neutral-700 placeholder:text-[12px]',
            'text-right',
          ].join(' ')}
        />

        {/* toggleable icon — inline-start side (left in RTL) */}
        {iconEnd && (
          <button
            type="button"
            onClick={onIconEndClick}
            tabIndex={-1}
            aria-label="تبديل إظهار كلمة المرور"
            className="text-neutral-600 shrink-0 flex items-center hover:text-primary-500 transition-colors"
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
    // TODO: replace with real auth API call
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
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

      {/* ── Left panel: Farm photo ── */}
      <div
        className="hidden lg:block lg:w-[56%] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0e2604 0%, #1a4a26 30%, #2d6e3e 55%, #4a9e60 75%, #73b367 90%, #b9d9b3 100%)',
        }}
      >
        {/* Cattle silhouette decorative overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-0 opacity-10">
          <svg viewBox="0 0 800 400" className="w-full" fill="white">
            {/* Simple pastoral hill silhouette */}
            <ellipse cx="200" cy="380" rx="300" ry="80" />
            <ellipse cx="600" cy="390" rx="250" ry="70" />
          </svg>
        </div>

        {/* Brand overlay at bottom */}
        <div className="absolute bottom-10 inset-inline-start-10 text-white">
          <p className="font-cairo font-bold text-[28px] leading-tight">نجم فارم</p>
          <p className="font-cairo font-medium text-[14px] text-white/70 mt-1">
            نظام إدارة محطات التسمين المتكامل
          </p>
        </div>

        {/* Gradient fade toward right (card side) */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-l from-neutral-100/20 to-transparent pointer-events-none" />
      </div>

      {/* ── Right panel: Login card ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 lg:px-20">
        <div className="w-full max-w-[400px]">

          <div className="bg-[#fdfdfd] border border-neutral-300 rounded-[12px] p-6 flex flex-col gap-4 shadow-sm">

            {/* Logo */}
            <Logo />

            {/* Heading */}
            <div className="flex flex-col items-end gap-1">
              <h1 className="font-cairo font-bold text-[24px] text-primary-500 leading-tight">
                أهلاً بعودتك
              </h1>
              <p className="font-cairo font-medium text-[11px] text-neutral-600 uppercase tracking-wide">
                سجل الدخول إلى حسابك
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

              <div className="flex flex-col gap-5">

                {/* Fields */}
                <div className="flex flex-col gap-5">
                  <InputField
                    label="عنوان البريد الإلكتروني"
                    id="email"
                    type="email"
                    value={form.email}
                    placeholder="you@example.com"
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
                  {/* Forgot — inline-start (left in RTL) */}
                  <button
                    type="button"
                    className="font-cairo font-medium text-[11px] text-neutral-600 uppercase tracking-wide hover:text-primary-500 transition-colors"
                  >
                    هل نسيت كلمة المرور؟
                  </button>

                  {/* Remember me — inline-end (right in RTL) */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="font-cairo font-medium text-[11px] text-neutral-600 uppercase tracking-wide">
                      تذكرني
                    </span>
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                      className="w-4 h-4 rounded-xs border border-neutral-300 bg-neutral-100 accent-primary-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* General API error */}
              {errors.general && (
                <div className="bg-error-500/10 border border-error-500/30 rounded-[8px] px-4 py-3">
                  <p className="font-cairo font-medium text-[12px] text-error-500 text-right">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit button */}
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
                    <svg
                      className="animate-spin w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>جارٍ تسجيل الدخول...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="font-cairo font-medium text-[11px] text-neutral-600 uppercase tracking-wide text-center flex items-center justify-center gap-2 pt-2 border-t border-neutral-200">
              <span>ليس لديك حساب؟</span>
              <button
                type="button"
                className="text-primary-500 hover:underline transition-colors normal-case"
              >
                تواصل مع الإدارة
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
