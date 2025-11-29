import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import FileManager from './components/FileManager';
import AuthPage from './components/AuthPage';
import { AppView, FileDoc, User } from './types';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load default files from public/Data
  useEffect(() => {
    const loadDefaultFiles = async () => {
      const defaultFiles = [
        { name: 'Scrapped.mkd', path: '/Data/Scrapped.mkd' },
        { name: 'combined_data.md', path: '/Data/combined_data.md' },
        { name: 'students_db.json', path: '/Data/students_db.json' }
      ];

      const loadedFiles: FileDoc[] = [];

      for (const fileInfo of defaultFiles) {
        try {
          const response = await fetch(fileInfo.path);
          if (response.ok) {
            const text = await response.text();
            loadedFiles.push({
              id: `default-${fileInfo.name}`,
              name: fileInfo.name,
              content: text,
              type: fileInfo.name.split('.').pop() || 'txt',
              status: 'ready'
            });
          } else {
            console.warn(`Failed to load default file: ${fileInfo.name}`);
          }
        } catch (error) {
          console.error(`Error loading default file ${fileInfo.name}:`, error);
        }
      }

      setFiles(prev => {
        // Avoid duplicates if already loaded
        const existingNames = new Set(prev.map(f => f.name));
        const newFiles = loadedFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...newFiles];
      });
    };

    loadDefaultFiles();
  }, []);

  // Derived state: Combined text content of all "indexed" files for RAG context
  const filesContent = useMemo(() => {
    return files
      .filter(f => f.status === 'ready')
      .map(f => `--- Document: ${f.name} ---\n${f.content}\n--- End Document ---`)
      .join('\n\n');
  }, [files]);

  const handleFileUpload = async (fileList: FileList) => {
    const newFiles: FileDoc[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      content: '', // Will be filled after reading
      type: file.name.split('.').pop() || 'unknown',
      status: 'indexing'
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate RAG Indexing (Reading file content)
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const text = await readFileAsText(file);
      const fileId = newFiles[i].id;

      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, content: text, status: 'ready' } : f
      ));
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  return (
    <div className="flex h-screen bg-mesh bg-cover bg-fixed bg-no-repeat overflow-hidden text-white selection:bg-cyan-500/30 relative">

      {/* Global Mouse Spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`
        }}
      />

      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <>
          {/* Sidebar Navigation */}
          <Sidebar currentView={currentView} onChangeView={setCurrentView} />

          {/* Main Content Area */}
          <main className="flex-1 relative overflow-hidden flex flex-col">
            {/* Background Overlay for Depth */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            <div className="relative z-10 h-full w-full">
              <AnimatePresence mode="wait">
                {currentView === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="h-full"
                  >
                    <Dashboard userName={user.name} />
                  </motion.div>
                )}
                {currentView === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="h-full"
                  >
                    <ChatInterface filesContent={filesContent} />
                  </motion.div>
                )}
                {currentView === 'files' && (
                  <motion.div
                    key="files"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="h-full"
                  >
                    <FileManager
                      files={files}
                      onFileUpload={handleFileUpload}
                      onRemoveFile={handleRemoveFile}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App;