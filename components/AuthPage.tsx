import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { ArrowRight, UserCircle, Lock, Loader2, IdCard } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Local Storage Key
  const STORAGE_KEY = 'AETHER_USERS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation of Network Delay
    setTimeout(() => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        if (isSignUp) {
          // SIGN UP LOGIC
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
          }
          if (!studentId || !password || !name) {
            throw new Error("Please fill in all fields");
          }
          
          // Check if user already exists
          if (storedUsers.some((u: any) => u.studentId === studentId)) {
            throw new Error("Student ID already registered");
          }

          // Create new user
          const newUser = {
            id: Date.now().toString(),
            studentId,
            name,
            password // In a real app, this should be hashed!
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify([...storedUsers, newUser]));
          
          // Auto-login after signup
          onLogin({
            id: newUser.id,
            studentId: newUser.studentId,
            name: newUser.name,
          });

        } else {
          // LOGIN LOGIC
          if (!studentId || !password) {
             throw new Error("Please enter your ID and password");
          }

          const user = storedUsers.find((u: any) => u.studentId === studentId && u.password === password);

          if (!user) {
            throw new Error("Invalid Student ID or Password");
          }

          // Successful Login
          onLogin({
            id: user.id,
            studentId: user.studentId,
            name: user.name,
          });
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen relative overflow-hidden p-6">
       {/* Background Elements */}
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px] pointer-events-none" />

       <div className="w-full max-w-md z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8 text-center"
          >
            <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_40px_rgba(168,85,247,0.5)] mb-6" />
            <h1 className="text-4xl font-thin tracking-tight text-white mb-2">AETHER</h1>
            <p className="text-white/40 tracking-widest text-xs uppercase">Student Intelligence System</p>
          </motion.div>

          <GlassCard className="px-8 pt-8 pb-6 md:px-10 md:pt-10 md:pb-8">
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup' : 'signin'}
                  initial={{ x: isSignUp ? 20 : -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isSignUp ? -20 : 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <h2 className="text-2xl font-light text-white mb-1">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-white/40 text-sm mb-8">
                    {isSignUp ? 'Enter your details to register.' : 'Sign in to access your dashboard.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div className="group">
                         <div className="relative">
                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" size={20} />
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            />
                         </div>
                      </div>
                    )}

                    <div className="group">
                       <div className="relative">
                          <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" size={20} />
                          <input
                            type="text"
                            placeholder="Student ID"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          />
                       </div>
                    </div>

                    <div className="group">
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" size={20} />
                          <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          />
                       </div>
                    </div>

                    {isSignUp && (
                      <div className="group">
                         <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" size={20} />
                            <input
                              type="password"
                              placeholder="Confirm Password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            />
                         </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-rose-400 text-xs text-center mt-2">{error}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl py-3.5 font-medium shadow-lg shadow-blue-500/25 mt-4 flex items-center justify-center gap-2 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          {isSignUp ? 'Create Account' : 'Sign In'}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 text-center pt-4 border-t border-white/5">
                <p className="text-white/40 text-sm">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                    }}
                    className="ml-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          </GlassCard>
       </div>
    </div>
  );
};

export default AuthPage;