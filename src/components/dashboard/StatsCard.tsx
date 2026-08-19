import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: 'brand' | 'success' | 'warning' | 'error';
  delay: number;
}

export default function StatsCard({ icon: Icon, value, label, color, delay }: StatsCardProps) {
  const colorMap = {
    brand: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    error: 'text-error bg-error/10 border-error/20',
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        delay 
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      className="glass-surface rounded-xl p-4 flex flex-col items-center text-center shadow-card border border-dark-700/50 hover:border-dark-600 transition-colors"
    >
      <div className={cn('p-3 rounded-full mb-3 border', colorMap[color])}>
        <Icon size={24} className="currentColor" />
      </div>
      <h3 className="text-2xl font-bold text-dark-100 mb-1">{value}</h3>
      <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}
