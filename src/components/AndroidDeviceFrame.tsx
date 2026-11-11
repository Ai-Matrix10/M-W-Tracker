import React from 'react';

interface AndroidDeviceFrameProps {
  isPhoneFrame: boolean;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  isPhoneFrame,
  header,
  bottomNav,
  children,
}) => {
  if (!isPhoneFrame) {
    return (
      <div className="min-h-screen bg-[#0c0e12] text-slate-100 flex flex-col justify-between">
        {header && (
          <div className="sticky top-0 z-30 bg-[#0c0e12]/95 backdrop-blur-md border-b border-slate-800/80">
            <div className="max-w-2xl w-full mx-auto px-3 sm:px-4">
              {header}
            </div>
          </div>
        )}

        <div className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-3">
          {children}
        </div>

        {bottomNav && (
          <div className="sticky bottom-0 z-30 bg-[#12141a]/98 backdrop-blur-md border-t border-slate-800/90 shadow-2xl">
            <div className="max-w-2xl w-full mx-auto">
              {bottomNav}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] py-2 sm:py-5 px-1 sm:px-4 flex items-center justify-center">
      {/* Android Smartphone Device Shell */}
      <div className="relative w-full max-w-[430px] h-[880px] max-h-[96vh] bg-[#121319] rounded-[44px] border-[8px] border-[#222532] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-slate-700/60">
        {/* Device Front Camera Punch Hole */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-slate-800 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-cyan-900/40"></div>
        </div>

        {/* Pinned Top Header inside Phone Frame */}
        {header && (
          <div className="shrink-0 z-30 bg-[#121319]">
            {header}
          </div>
        )}

        {/* Scrollable Device Screen Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 pt-1.5 pb-3">
          {children}
        </div>

        {/* Pinned Bottom Navigation inside Phone Frame */}
        {bottomNav && (
          <div className="shrink-0 z-30">
            {bottomNav}
          </div>
        )}

        {/* Android Gesture Bar */}
        <div className="h-4 bg-[#12141a] flex items-center justify-center shrink-0 border-t border-slate-900 z-40">
          <div className="w-28 h-1 rounded-full bg-slate-600/70"></div>
        </div>
      </div>
    </div>
  );
};

