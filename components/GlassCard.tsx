import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface GlassCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = false, ...props }) => {
  return (
    <motion.div 
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { 
        scale: 1.02, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      } : {}}
      whileTap={hoverEffect ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 1.05 }}
      className={`
        relative overflow-hidden
        bg-glass-100 backdrop-blur-2xl 
        border border-white/10 
        rounded-[1.5rem] 
        shadow-xl shadow-black/20
        ${hoverEffect ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;