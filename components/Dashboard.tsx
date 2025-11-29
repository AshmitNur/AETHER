import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_GRADES } from '../constants';
import { Calendar, Clock, Award, Activity, Edit2, Save, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  userName: string;
}

interface ClassItem {
  time: string;
  name: string;
  room: string;
}

interface GradeItem {
  name: string;
  value: number;
  fullMark: number;
}

interface DeadlineItem {
  task: string;
  days: string;
  urgent: boolean;
}

interface DashboardData {
  cgpa: string;
  cgpaTrend: string;
  classes: ClassItem[];
  grades: GradeItem[];
  deadlines: DeadlineItem[];
}

const DEFAULT_DATA: DashboardData = {
  cgpa: '3.85',
  cgpaTrend: '+0.2% vs last term',
  classes: [
    { time: '09:00 AM', name: 'Advanced Algorithms', room: 'Hall A' },
    { time: '11:30 AM', name: 'Human-Computer Interaction', room: 'Lab 3' },
    { time: '02:00 PM', name: 'Database Systems', room: 'Remote' }
  ],
  grades: MOCK_GRADES,
  deadlines: [
    { task: 'RAG Implementation', days: '2 days left', urgent: true },
    { task: 'Physics Lab Report', days: '5 days left', urgent: false },
    { task: 'Literature Review', days: '1 week left', urgent: false },
    { task: 'Calculus Quiz', days: '2 weeks left', urgent: false },
  ]
};

const STORAGE_KEY = 'AETHER_DASHBOARD_DATA';

const Dashboard: React.FC<DashboardProps> = ({ userName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse dashboard data", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setIsEditing(false);
  };

  const updateClass = (index: number, field: keyof ClassItem, value: string) => {
    const newClasses = [...data.classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    setData({ ...data, classes: newClasses });
  };

  const addClass = () => {
    setData({
      ...data,
      classes: [...data.classes, { time: '00:00 AM', name: 'New Class', room: 'Room' }]
    });
  };

  const removeClass = (index: number) => {
    const newClasses = data.classes.filter((_, i) => i !== index);
    setData({ ...data, classes: newClasses });
  };

  const updateGrade = (index: number, field: keyof GradeItem, value: string | number) => {
    const newGrades = [...data.grades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setData({ ...data, grades: newGrades });
  };

  const updateDeadline = (index: number, field: keyof DeadlineItem, value: any) => {
    const newDeadlines = [...data.deadlines];
    newDeadlines[index] = { ...newDeadlines[index], [field]: value };
    setData({ ...data, deadlines: newDeadlines });
  };

  const addDeadline = () => {
    setData({
      ...data,
      deadlines: [...data.deadlines, { task: 'New Task', days: 'Due soon', urgent: false }]
    });
  };

  const removeDeadline = (index: number) => {
    const newDeadlines = data.deadlines.filter((_, i) => i !== index);
    setData({ ...data, deadlines: newDeadlines });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20, mass: 1.2 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="p-10 lg:p-14 h-full overflow-y-auto pb-32 custom-scrollbar"
    >
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-14 flex justify-between items-end">
          <div>
            <motion.h1
              variants={item}
              className="text-5xl font-thin tracking-tight text-white mb-3"
            >
              Welcome back, {userName}.
            </motion.h1>
            <motion.p
              variants={item}
              className="text-white/50 font-light text-lg"
            >
              Here is your academic overview for the semester.
            </motion.p>
          </div>
          <motion.button
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${isEditing
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
          >
            {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
            {isEditing ? 'Save Changes' : 'Edit Dashboard'}
          </motion.button>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Main Stat - GPA */}
          <motion.div variants={item} className="md:col-span-1">
            <GlassCard className="p-8 flex flex-col justify-between h-72" hoverEffect>
              <div className="flex justify-between items-start">
                <div className="p-4 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <Award size={28} strokeWidth={1.5} />
                </div>
                {isEditing ? (
                  <input
                    value={data.cgpaTrend}
                    onChange={(e) => setData({ ...data, cgpaTrend: e.target.value })}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-emerald-400 w-1/2"
                  />
                ) : (
                  <span className="px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium tracking-wide">
                    {data.cgpaTrend}
                  </span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    value={data.cgpa}
                    onChange={(e) => setData({ ...data, cgpa: e.target.value })}
                    className="text-6xl font-thin text-white mb-2 bg-transparent border-b border-white/20 w-full focus:outline-none focus:border-cyan-400"
                  />
                ) : (
                  <h3 className="text-7xl font-thin text-white mb-2 tracking-tighter">{data.cgpa}</h3>
                )}
                <p className="text-white/40 text-sm tracking-[0.2em] uppercase font-medium">Current CGPA</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Schedule */}
          <motion.div variants={item} className="md:col-span-2">
            <GlassCard className="p-8 flex flex-col h-72 relative" hoverEffect>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    <Calendar size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-light text-white tracking-wide">Upcoming Classes</h3>
                </div>
                {isEditing && (
                  <button onClick={addClass} className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-cyan-400 transition-colors">
                    <Plus size={20} />
                  </button>
                )}
              </div>
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {data.classes.map((cls, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-colors group">
                    {isEditing ? (
                      <div className="flex items-center gap-4 w-full">
                        <input
                          value={cls.time}
                          onChange={(e) => updateClass(idx, 'time', e.target.value)}
                          className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-blue-300 font-mono"
                        />
                        <input
                          value={cls.name}
                          onChange={(e) => updateClass(idx, 'name', e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white/90"
                        />
                        <input
                          value={cls.room}
                          onChange={(e) => updateClass(idx, 'room', e.target.value)}
                          className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60"
                        />
                        <button onClick={() => removeClass(idx)} className="text-rose-400 hover:text-rose-300 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-6">
                          <span className="text-sm font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/10">{cls.time}</span>
                          <span className="text-white/90 font-light text-lg">{cls.name}</span>
                        </div>
                        <span className="text-xs text-white/40 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 group-hover:border-white/20 transition-colors">{cls.room}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Performance Chart */}
          <motion.div variants={item} className="md:col-span-2">
            <GlassCard className="p-8 h-96 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Activity size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-light text-white tracking-wide">Academic Performance</h3>
                </div>
              </div>

              <div className="flex gap-6 h-full">
                {/* Chart Area */}
                <div className="flex-1 h-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.grades} barSize={isEditing ? 40 : 60}>
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Inter' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.9)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          padding: '12px 16px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {data.grades.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorGradient-${index})`} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                        ))}
                      </Bar>
                      <defs>
                        {data.grades.map((entry, index) => (
                          <linearGradient key={`colorGradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                          </linearGradient>
                        ))}
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Edit Panel for Grades */}
                {isEditing && (
                  <div className="w-1/3 border-l border-white/10 pl-6 overflow-y-auto custom-scrollbar">
                    <h4 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">Edit Grades</h4>
                    <div className="space-y-3">
                      {data.grades.map((grade, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={grade.name}
                            onChange={(e) => updateGrade(idx, 'name', e.target.value)}
                            className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                            placeholder="Subj"
                          />
                          <input
                            type="number"
                            value={grade.value}
                            onChange={(e) => updateGrade(idx, 'value', Number(e.target.value))}
                            className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-cyan-300"
                            max={100}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Assignments */}
          <motion.div variants={item} className="md:col-span-1">
            <GlassCard className="p-8 h-96 flex flex-col" hoverEffect>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                    <Clock size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-light text-white tracking-wide">Deadlines</h3>
                </div>
                {isEditing && (
                  <button onClick={addDeadline} className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-cyan-400 transition-colors">
                    <Plus size={20} />
                  </button>
                )}
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {data.deadlines.map((task, idx) => (
                  <div key={idx} className="group">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <input
                            value={task.task}
                            onChange={(e) => updateDeadline(idx, 'task', e.target.value)}
                            className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white"
                            placeholder="Task Name"
                          />
                          <button onClick={() => removeDeadline(idx)} className="text-rose-400 p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            value={task.days}
                            onChange={(e) => updateDeadline(idx, 'days', e.target.value)}
                            className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white/60"
                            placeholder="Time left"
                          />
                          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={task.urgent}
                              onChange={(e) => updateDeadline(idx, 'urgent', e.target.checked)}
                              className="rounded border-white/20 bg-white/10 text-rose-500 focus:ring-rose-500"
                            />
                            Urgent
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-base text-white/90 font-light">{task.task}</span>
                          <span className={`text-xs font-medium tracking-wide uppercase ${task.urgent ? 'text-rose-400' : 'text-white/30'}`}>{task.days}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: task.urgent ? '85%' : '45%' }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (idx * 0.1) }}
                            className={`h-full rounded-full ${task.urgent ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;