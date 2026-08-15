import React from 'react';
import { Monitor, Smartphone, Layout, RefreshCw, Command } from 'lucide-react';

export type ViewMode = 'desktop' | 'mobile' | 'responsive';

interface DeviceSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenCommandBar?: () => void;
}

export const DeviceSwitcher: React.FC<DeviceSwitcherProps> = ({
  viewMode,
  onViewModeChange,
  onOpenCommandBar
}) => {
  return (
    <div className="bg-slate-950 text-slate-200 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-xs font-mono select-none z-50">
      {/* Left: Desktop Status Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="tracking-wider">DESKTOP APP v2.6</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            LOCAL PORT: 3000
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">
            STATUS: READY
          </span>
        </div>
      </div>

      {/* Center: Viewport Switcher Controls */}
      <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 shadow-inner">
        <button
          type="button"
          id="btn-viewmode-desktop"
          onClick={() => onViewModeChange('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewMode === 'desktop'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="電腦桌面頁面 (大螢幕多欄位佈局 100% Wide)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>電腦桌面</span>
          <span className="text-[10px] opacity-75 hidden sm:inline">(1920px)</span>
        </button>

        <button
          type="button"
          id="btn-viewmode-mobile"
          onClick={() => onViewModeChange('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewMode === 'mobile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="手機行動頁面 (390px 擬真手機裝置外框與行動端 UI)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>手機頁面</span>
          <span className="text-[10px] opacity-75 hidden sm:inline">(390px)</span>
        </button>

        <button
          type="button"
          id="btn-viewmode-responsive"
          onClick={() => onViewModeChange('responsive')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewMode === 'responsive'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="自動響應模式 (隨瀏覽器視窗自由調整)"
        >
          <Layout className="w-3.5 h-3.5" />
          <span>自動響應</span>
        </button>
      </div>

      {/* Right: Desktop Action Shortcut */}
      <div className="flex items-center gap-2">
        {onOpenCommandBar && (
          <button
            type="button"
            onClick={onOpenCommandBar}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title="快捷搜尋功能 (Alt+K)"
          >
            <Command className="w-3 h-3 text-blue-400" />
            <span>快捷指令</span>
            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono">Alt+K</kbd>
          </button>
        )}

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="重新載入桌面頁面"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
