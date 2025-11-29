import React, { useCallback } from 'react';
import GlassCard from './GlassCard';
import { UploadCloud, FileText, CheckCircle2, Loader2, X } from 'lucide-react';
import { FileDoc } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface FileManagerProps {
  files: FileDoc[];
  onFileUpload: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ files, onFileUpload, onRemoveFile }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className="p-10 lg:p-14 h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        <header className="mb-14">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-5xl font-thin tracking-tight text-white mb-3"
          >
            Knowledge Base
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-white/50 font-light text-lg"
          >
            Upload notes, PDFs, or CSVs for Aether to study.
          </motion.p>
        </header>

        {/* Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="mb-12 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <GlassCard className="h-80 border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-6 rounded-full bg-white/5 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:scale-110"
              >
                <UploadCloud size={56} strokeWidth={1.5} />
              </motion.div>
              <div className="text-center">
                <p className="text-2xl text-white font-light tracking-wide mb-2">Drag & Drop files here</p>
                <p className="text-sm text-white/40 font-medium tracking-wider uppercase">or click to browse</p>
              </div>
              <input 
                type="file" 
                multiple 
                accept=".txt,.md,.json,.csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleInputChange}
              />
          </GlassCard>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-6 pl-1">Indexed Documents</h2>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            <AnimatePresence mode="popLayout">
              {files.map((file) => (
                <GlassCard 
                  layout
                  key={file.id} 
                  className="p-5 flex items-center justify-between group" 
                  hoverEffect
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, mass: 1 }}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      <FileText size={24} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white/90 text-base font-medium truncate mb-0.5">{file.name}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{file.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {file.status === 'indexing' ? (
                      <Loader2 size={18} className="text-cyan-400 animate-spin" />
                    ) : (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <CheckCircle2 size={18} className="text-emerald-400 shadow-[0_0_10px_#34d399]" />
                      </motion.div>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.2, color: '#fb7185' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemoveFile(file.id)}
                      className="p-2 rounded-full hover:bg-white/10 text-white/20 transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </GlassCard>
              ))}
            </AnimatePresence>
            
            {files.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="col-span-full py-20 text-center flex flex-col items-center justify-center border border-white/5 rounded-[2rem] bg-white/[0.01]"
              >
                <FileText size={48} className="text-white/10 mb-4" strokeWidth={1} />
                <p className="text-white/20 text-lg font-light">No documents indexed yet.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;