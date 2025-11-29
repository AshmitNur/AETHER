import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, MessageSquare, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'chat', icon: MessageSquare, label: 'Assistant' },
    { id: 'files', icon: FolderOpen, label: 'Knowledge' },
  ];

  const springTransition = { type: "spring", stiffness: 300, damping: 30, mass: 1.2 };

  return (
    <motion.nav 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={springTransition}
      className="w-24 lg:w-80 flex-shrink-0 flex flex-col items-center lg:items-start py-10 lg:px-10 h-screen sticky top-0 border-r border-white/5 bg-black/20 backdrop-blur-xl z-50"
    >
      <div className="mb-20 flex items-center gap-4 pl-2">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
        />
        <span className="hidden lg:block text-2xl font-thin tracking-[0.2em] text-white">AETHER</span>
      </div>

      <div className="space-y-6 w-full">
        {navItems.map((item, index) => {
          const isActive = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ...springTransition, delay: index * 0.1 + 0.2 }}
              onClick={() => onChangeView(item.id as AppView)}
              className={`
                group flex items-center gap-5 w-full p-4 rounded-[1.25rem] transition-all duration-300
                ${isActive ? 'bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)] border border-white/5' : 'hover:bg-white/5 text-white/50 hover:text-white'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon 
                size={26} 
                strokeWidth={1.5}
                className={`transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'group-hover:text-white'}`} 
              />
              <span className={`hidden lg:block text-base tracking-wide font-light ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto hidden lg:block w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.6 }}
          className="p-6 rounded-[1.5rem] bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5 backdrop-blur-md"
        >
          <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-3">System Status</p>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
            <span className="text-sm font-medium text-white/80">Online & Ready</span>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Sidebar;