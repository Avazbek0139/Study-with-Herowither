'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, BookOpen, GraduationCap, ClipboardList, BarChart3, MessageSquare } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Vocabulary', href: '/vocabulary', icon: BookOpen },
  { name: 'Learn', href: '/learn', icon: GraduationCap },
  { name: 'Test', href: '/test', icon: ClipboardList },
  { name: 'Feedback', href: '/feedback', icon: MessageSquare },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-dark-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-2 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-brand-400" : "text-dark-500 hover:text-dark-300"
              )}
            >
              <div className={cn(
                "p-1 rounded-full transition-all",
                isActive ? "bg-brand-500/10" : ""
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "fill-brand-500/20" : ""
                )} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
