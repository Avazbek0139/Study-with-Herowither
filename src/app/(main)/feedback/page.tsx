'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  AlertOctagon, 
  Bug, 
  HelpCircle, 
  CheckCircle, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  User, 
  Mail, 
  Phone 
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn, formatDate } from '@/lib/utils'

const feedbackTypes = [
  {
    id: 'suggestion',
    label: 'Taklif',
    desc: "Yangi g'oya yoki yaxshilash",
    icon: Lightbulb,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-500/10 border-amber-500 text-amber-400',
  },
  {
    id: 'complaint',
    label: 'Shikoyat',
    desc: 'Kamchilik yoki muammo',
    icon: AlertOctagon,
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    activeBg: 'bg-rose-500/10 border-rose-500 text-rose-400',
  },
  {
    id: 'bug',
    label: 'Xatolik (Bug)',
    desc: 'Texnik nosozlik',
    icon: Bug,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    activeBg: 'bg-orange-500/10 border-orange-500 text-orange-400',
  },
  {
    id: 'question',
    label: 'Savol',
    desc: 'Savol yoki yordam',
    icon: HelpCircle,
    color: 'text-sky-400',
    border: 'border-sky-500/30',
    activeBg: 'bg-sky-500/10 border-sky-500 text-sky-400',
  },
]

export default function FeedbackPage() {
  const { data: session } = useSession()
  const [type, setType] = useState('suggestion')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [myFeedbacks, setMyFeedbacks] = useState<any[]>([])

  useEffect(() => {
    if (session?.user) {
      setSenderName(session.user.name || '')
      setSenderEmail(session.user.email || '')
      fetchMyFeedbacks()
    }
  }, [session])

  const fetchMyFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback')
      if (res.ok) {
        const data = await res.json()
        setMyFeedbacks(data.feedbacks || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError("Iltimos, mavzu va xabar matnini to'liq kiriting!")
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          subject,
          message,
          contactInfo,
          name: senderName,
          email: senderEmail,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Xabar yuborishda xatolik yuz berdi")
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      setSubject('')
      setMessage('')
      setContactInfo('')
      setIsLoading(false)
      fetchMyFeedbacks()
    } catch (err) {
      console.error(err)
      setError("Tarmoq xatoligi. Qaytadan urinib ko'ring.")
      setIsLoading(false)
    }
  }

  const getTelegramDirectUrl = () => {
    const text = encodeURIComponent(
      `[Study with HERO]\n📌 ${subject || 'Taklif/Shikoyat'}\n\n${message || ''}`
    )
    return `https://t.me/Herowither_org0139?text=${text}`
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-500/10 text-brand-400 mb-2">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-dark-100">
          Taklif va Shikoyatlar
        </h1>
        <p className="text-dark-400 max-w-xl mx-auto text-sm md:text-base">
          Sizning fikringiz biz uchun juda muhim! Har bir taklif va shikoyat to&apos;g&apos;ridan-to&apos;g&apos;ri Telegram orqali admin lichkasiga yetkaziladi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feedback Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-surface p-6 md:p-8 rounded-2xl border border-dark-700/80 shadow-card">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-dark-100">
                  Rahmat! Xabaringiz qabul qilindi
                </h2>
                <p className="text-dark-400 text-sm max-w-md mx-auto">
                  Murojaatingiz to&apos;g&apos;ridan-to&apos;g&apos;ri Telegram adminiga (@Herowither_org0139 / ID: 5744904641) yuborildi va tez orada ko&apos;rib chiqiladi.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="btn-primary py-2.5 px-6"
                  >
                    Yana xabar yuborish
                  </button>
                  <a
                    href="https://t.me/Herowither_org0139"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-2.5 px-6 flex items-center justify-center gap-2"
                  >
                    <span>Telegramda ochish</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-dark-200 mb-3">
                    Murojaat turi:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {feedbackTypes.map((t) => {
                      const Icon = t.icon
                      const isSelected = type === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id)}
                          className={cn(
                            "p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all text-xs font-medium",
                            isSelected
                              ? t.activeBg
                              : "bg-dark-850 border-dark-700/80 text-dark-400 hover:border-dark-600 hover:bg-dark-800"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", isSelected ? t.color : "text-dark-400")} />
                          <span className="font-semibold">{t.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-dark-200 mb-2">
                    Mavzu <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Masalan: Test savollarini ko'paytirish haqida"
                    className="input-field w-full"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-dark-200 mb-2">
                    Batafsil xabar <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Taklif yoki shikoyatingizni batafsil yozing..."
                    className="input-field w-full resize-none leading-relaxed"
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="telegramUsername" className="block text-xs font-semibold text-brand-300 mb-1.5 flex items-center justify-between">
                      <span>Telegram Username</span>
                      <span className="text-[10px] text-brand-400 font-normal">Tavsiya etiladi</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-400 font-mono text-xs">
                        @
                      </div>
                      <input
                        id="telegramUsername"
                        type="text"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="username"
                        className="input-field w-full pl-7 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="senderName" className="block text-xs font-semibold text-dark-300 mb-1.5">
                      Ismingiz
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="senderName"
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Ismingiz"
                        className="input-field w-full pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="senderEmail" className="block text-xs font-semibold text-dark-300 mb-1.5">
                      Email manzili (ixtiyoriy)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="senderEmail"
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="email@misol.uz"
                        className="input-field w-full pl-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold text-base shadow-glow disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Telegramga Yuborish</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info & Direct Telegram */}
        <div className="space-y-6">
          {/* Telegram Card */}
          <div className="glass-surface p-6 rounded-2xl border border-brand-500/30 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-dark-100">Telegram Bot Ulangan</h3>
                <p className="text-xs text-emerald-400 font-mono">@Taklif_va_shikoyat777_bot</p>
                <p className="text-[11px] text-dark-400">Admin: @Herowither_org0139</p>
              </div>
            </div>

            <p className="text-xs text-dark-300 leading-relaxed">
              Saytdan yuborilgan barcha taklif va shikoyatlar avtomatik ravishda Telegram bot orqali lichkangizga yetkaziladi.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="https://t.me/Taklif_va_shikoyat777_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <span>Botni ochish (/start)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://t.me/Herowither_org0139"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-2 text-dark-300 hover:text-brand-400"
              >
                <span>Admin bilan to&apos;g&apos;ridan-to&apos;g&apos;ri bog&apos;lanish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Tips Card */}
          <div className="glass-surface p-6 rounded-2xl border border-dark-700/60 space-y-3">
            <h4 className="text-sm font-semibold text-dark-200">
              💡 Foydali maslahat
            </h4>
            <ul className="text-xs text-dark-400 space-y-2 list-disc list-inside">
              <li>Takliflaringiz keyingi yangilanishlarda qo&apos;shiladi.</li>
              <li>Nosozlik bo&apos;lsa, qaysi sahifada yuz berganini yozing.</li>
              <li>Bog&apos;lanish uchun Telegram manzilingizni qoldiring.</li>
            </ul>
          </div>

          {/* Past feedbacks */}
          {myFeedbacks.length > 0 && (
            <div className="glass-surface p-6 rounded-2xl border border-dark-700/60 space-y-3">
              <h4 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Yuborgan xabarlaringiz ({myFeedbacks.length})</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {myFeedbacks.map((f: any) => (
                  <div key={f.id} className="p-2.5 rounded-lg bg-dark-900/60 border border-dark-800 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-dark-500">
                      <span className="capitalize font-semibold text-dark-300">{f.type}</span>
                      <span>{formatDate(f.createdAt)}</span>
                    </div>
                    <p className="font-medium text-dark-200 truncate">{f.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
