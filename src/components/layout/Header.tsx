'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { BookOpen, Search, Bell, User, Menu, LogOut, Settings, User as UserIcon, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Vocabulary', href: '/vocabulary' },
  { name: 'Learn', href: '/learn' },
  { name: 'Test', href: '/test' },
  { name: 'Progress', href: '/progress' },
  { name: 'Feedback', href: '/feedback' },
]

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-500/10 p-1.5 rounded-lg group-hover:bg-brand-500/20 transition-colors">
              <BookOpen className="w-6 h-6 text-brand-400" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-dark-200 hidden sm:block">
              Study with HERO
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                    isActive 
                      ? "text-brand-400" 
                      : "text-dark-400 hover:text-dark-200 hover:bg-dark-800/50"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-full transition-colors border border-transparent hover:border-dark-700"
            >
              <div className="w-7 h-7 rounded-full bg-dark-800 flex items-center justify-center border border-dark-700 overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {session?.user?.name?.split(' ')[0] || "User"}
              </span>
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-dark-900 border border-dark-700 rounded-xl shadow-card z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-dark-800">
                      <p className="text-sm font-medium text-white truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-dark-400 truncate">
                        {session?.user?.email || ""}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <Link
                        href="/feedback"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400 hover:text-brand-300 hover:bg-dark-800 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Taklif va Shikoyat
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          signOut()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors text-left mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button className="md:hidden p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
