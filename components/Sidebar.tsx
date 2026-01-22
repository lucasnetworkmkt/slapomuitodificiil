import React, { useEffect, useState } from 'react';
import { AppMode, UserStats } from '../types';
import { getUserStats, getStageName } from '../services/gamificationService';
import { useAuth } from '../context/AuthContext';
import EagleBadge from './EagleBadge';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  startNewChat: () => void;
  onResumeChat: () => void;
  onOpenProgression: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentMode, 
    setMode, 
    startNewChat,
    onResumeChat, 
    onOpenProgression, 
    isOpen, 
    onClose 
}) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats>(getUserStats());

  useEffect(() => {
    setStats(getUserStats());
    const handleStatsUpdate = () => {
      setStats(getUserStats());
    };
    window.addEventListener('statsUpdated', handleStatsUpdate);
    return () => window.removeEventListener('statsUpdated', handleStatsUpdate);
  }, [user]);

  const displayId = user ? user.id.split('_')[1].toUpperCase().substring(0, 8) : 'UNK';

  const menuItems = [
    { id: AppMode.CHAT, label: 'MENTOR IA', icon: 'M' },
    { id: AppMode.MIND_MAP, label: 'MAPA MENTAL', icon: '⚡' },
    { id: AppMode.EXECUTION, label: 'MODO EXECUÇÃO', icon: '⚔' },
    { id: AppMode.HISTORY, label: 'HISTÓRICO', icon: '📜' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#050505] border-r border-[#222] flex flex-col h-screen transform transition-transform duration-300 ease-in-out font-sans
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:w-80 md:flex-shrink-0
      `}>
        
        {/* Header Logo Area */}
        <div className="p-6 pb-2 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-[#E50914] transform rotate-45"></div>
              <h1 className="text-white font-black text-lg tracking-tighter uppercase italic">
                O MENTOR
              </h1>
            </div>
            <div className="pl-6">
                <p className="text-[12px] text-white font-bold truncate">{user?.name || 'Recruta'}</p>
                <p className="text-[10px] text-[#666] font-mono">ID: {displayId}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-[#666] p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Card */}
        <div className="px-4 py-4">
            <div 
                onClick={onOpenProgression}
                className="bg-[#0A0A0A] border border-[#222] hover:border-[#E50914] transition-colors rounded-lg p-3 cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#E50914" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </div>
                
                <div className="flex items-center gap-3">
                     <EagleBadge points={stats.points} size="sm" />
                     <div>
                         <p className="text-[10px] text-[#666] uppercase tracking-wider font-bold">Nível {stats.level}</p>
                         <p className="text-sm text-white font-black uppercase italic tracking-tighter">{getStageName(stats.points)}</p>
                     </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#444]">
                    <span>{stats.points} PTS</span>
                    <span className="text-[#E50914] font-bold">{stats.currentStreak} 🔥 DIAS</span>
                </div>
                
                {/* Progress Bar Mini */}
                <div className="w-full bg-[#111] h-1 mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E50914]" style={{ width: `${(stats.points % 1000) / 10}%` }}></div>
                </div>
            </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-2">
            <button 
                onClick={() => { startNewChat(); onClose(); }}
                className="w-full bg-[#E50914] hover:bg-red-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 uppercase text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(229,9,20,0.2)]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nova Direção
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => { setMode(item.id); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase tracking-wide transition-all ${
                        currentMode === item.id 
                            ? 'bg-[#1a1a1a] text-white border-l-2 border-[#E50914]' 
                            : 'text-[#666] hover:text-white hover:bg-[#111]'
                    }`}
                >
                    <span className="w-5 text-center">{item.icon}</span>
                    {item.label}
                </button>
            ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#222]">
            <button 
                onClick={logout}
                className="flex items-center gap-2 text-[#444] hover:text-white text-xs font-bold uppercase transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Sair do Sistema
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;