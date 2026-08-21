'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Lock, KeyRound, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, User, Mail, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword.trim()) {
      setError('Iltimos, joriy parolingizni kiriting')
      return
    }

    if (!newPassword.trim()) {
      setError('Iltimos, yangi parolni kiriting')
      return
    }

    if (newPassword.trim().length < 8) {
      setError('Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak')
      return
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('Yangi parollar bir-biriga mos kelmadi')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Parolni o\'zgartirishda xatolik yuz berdi')
      } else {
        setSuccess('Parolingiz muvaffaqiyatli o\'zgartirildi!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError('Tarmoqda xatolik yuz berdi. Qayta urinib ko\'ring.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sozlamalar va Xavfsizlik</h1>
        <p className="text-dark-400">Profil ma&apos;lumotlari va parolni boshqarish</p>
      </div>

      {/* Profil Ma'lumotlari Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-surface p-6 rounded-2xl border border-dark-800 shadow-card space-y-4"
      >
        <div className="flex items-center gap-3 border-b border-dark-800 pb-4">
          <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Profil ma&apos;lumotlari</h2>
            <p className="text-xs text-dark-400">Sizning akkountingiz ma&apos;lumotlari</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-dark-900/60 p-4 rounded-xl border border-dark-800">
            <div className="flex items-center gap-2 text-xs text-dark-400 mb-1">
              <User className="w-3.5 h-3.5" />
              Foydalanuvchi ismi
            </div>
            <div className="text-white font-medium">{session?.user?.name || 'Avazbek'}</div>
          </div>

          <div className="bg-dark-900/60 p-4 rounded-xl border border-dark-800">
            <div className="flex items-center gap-2 text-xs text-dark-400 mb-1">
              <Mail className="w-3.5 h-3.5" />
              Email manzil
            </div>
            <div className="text-white font-medium truncate">{session?.user?.email || 'Noma\'lum'}</div>
          </div>
        </div>
      </motion.div>

      {/* Parolni O'zgartirish Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-surface p-6 rounded-2xl border border-dark-800 shadow-card space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-dark-800 pb-4">
          <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Parolni o&apos;zgartirish</h2>
            <p className="text-xs text-dark-400">Akkountingiz xavfsizligi uchun yangi parol o&apos;rnating</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {error && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5" htmlFor="currentPassword">
              Joriy parol
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5" htmlFor="newPassword">
              Yangi parol
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors text-sm"
                placeholder="Kamida 8 ta belgi"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5" htmlFor="confirmPassword">
              Yangi parolni tasdiqlang
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors text-sm"
                placeholder="Yangi parolni qayta kiriting"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-2.5 px-5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>O&apos;zgartirilmoqda...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Parolni Saqlash</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
