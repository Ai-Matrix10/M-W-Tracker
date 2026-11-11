import React, { useEffect, useState } from 'react';
import { 
  Dumbbell, 
  LogOut, 
  Database, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Battery, 
  Signal
} from 'lucide-react';
import { RoomDatabase, UserEntity } from '../db/room';

interface AndroidHeaderProps {
  title: string;
  currentUser: UserEntity | null;
  onLogout: () => void;
  onOpenInspector: () => void;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  backAction?: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  title,
  currentUser,
  onLogout,
  onOpenInspector,
  isPhoneFrame,
  onToggleFrame,
  backAction,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#12141a]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Android System Status Bar */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-1 text-[11px] font-mono text-slate-400 select-none">
        <span className="font-semibold text-slate-300 tracking-tight">{currentTime}</span>
        <div className="flex items-center gap-2 text-slate-400">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] tabular-nums">92%</span>
            <Battery className="w-3.5 h-3.5 fill-slate-400" />
          </div>
        </div>
      </div>

      {/* Android Top App Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 h-14">
        <div className="flex items-center gap-2.5 min-w-0">
          {backAction ? (
            <button
              onClick={backAction}
              className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors active:scale-95"
              title="Go back"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
            </div>
          )}

          <div className="truncate">
            <h1 className="text-base font-bold text-slate-100 tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Top Bar Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Device Mockup Toggle */}
          <button
            onClick={onToggleFrame}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors text-xs flex items-center gap-1"
            title={isPhoneFrame ? "Switch to Responsive View" : "Switch to Android Phone Mockup"}
            aria-label="Toggle Phone Frame"
          >
            {isPhoneFrame ? (
              <Monitor className="w-4 h-4 text-cyan-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Room Database Inspector */}
          <button
            onClick={onOpenInspector}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Inspect Room Database"
            aria-label="Room DB Inspector"
          >
            <Database className="w-4 h-4 text-emerald-400" />
          </button>

          {/* User / Logout */}
          {currentUser && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
              title={`Sign out (${currentUser.displayName})`}
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
