import React, { useState } from 'react';
import { User, Project, AttendanceLog, LeaveRequest, LocationType, ClockType } from '../../types';
import { 
  MapPin, 
  Wifi, 
  Camera, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Calendar, 
  Layers, 
  ShieldCheck,
  Smartphone,
  Sparkles,
  Info,
  UserCheck,
  FileText,
  RefreshCw,
  Plus
} from 'lucide-react';
import { 
  OFFICE_COORDINATES, 
  TAICHUNG_SITE_COORDINATES, 
  KAOHSIUNG_SITE_COORDINATES,
  calculateDistanceMeters 
} from '../../utils/calculations';

interface AttendancePanelProps {
  currentUser: User;
  projects: Project[];
  attendanceLogs: AttendanceLog[];
  onAddAttendanceLog: (log: AttendanceLog) => void;
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (leave: LeaveRequest) => void;
  onUpdateUserCompTime: (userId: string, newHours: number) => void;
  onOpenProjectEdit?: (projectId?: string) => void;
  onOpenUserEdit?: (userId?: string) => void;
}

export const AttendancePanel: React.FC<AttendancePanelProps> = ({
  currentUser,
  projects,
  attendanceLogs,
  onAddAttendanceLog,
  leaveRequests,
  onAddLeaveRequest,
  onUpdateUserCompTime,
  onOpenProjectEdit,
  onOpenUserEdit
}) => {
  // Clock-in mode: 'OFFICE' | 'FIELD' | 'LEAVE'
  const [activeSubTab, setActiveSubTab] = useState<'OFFICE' | 'FIELD' | 'LEAVE'>('OFFICE');

  // Simulated GPS Location Selector
  const [selectedLocationPreset, setSelectedLocationPreset] = useState<'OFFICE' | 'TAICHUNG_SITE' | 'KAOHSIUNG_SITE' | 'GOV_PERMIT' | 'CUSTOM'>('OFFICE');
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number }>({
    lat: OFFICE_COORDINATES.latitude,
    lng: OFFICE_COORDINATES.longitude
  });
  const [simulatedWifiBSSID, setSimulatedWifiBSSID] = useState<string>('ARCH_OFFICE_5G');

  // Field Work Check-in Form States
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>('SITE_SUPERVISION');
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [customLocationName, setCustomLocationName] = useState<string>('');
  const [simulatedPhotoUrl, setSimulatedPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=600&auto=format&fit=crop&q=80');
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);

  // Leave Form States
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('COMP_TIME');
  const [leaveHours, setLeaveHours] = useState<number>(8);
  const [leaveStartDate, setLeaveStartDate] = useState<string>('2026-08-25 09:00');
  const [leaveEndDate, setLeaveEndDate] = useState<string>('2026-08-25 18:00');
  const [leaveReason, setLeaveReason] = useState<string>('');

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Location preset changes
  const handleLocationPresetChange = (preset: 'OFFICE' | 'TAICHUNG_SITE' | 'KAOHSIUNG_SITE' | 'GOV_PERMIT' | 'CUSTOM') => {
    setSelectedLocationPreset(preset);
    if (preset === 'OFFICE') {
      setCurrentGps({ lat: OFFICE_COORDINATES.latitude, lng: OFFICE_COORDINATES.longitude });
      setSimulatedWifiBSSID('ARCH_OFFICE_5G');
      setCustomLocationName('台北總所辦公室 (信義事務所)');
    } else if (preset === 'TAICHUNG_SITE') {
      setCurrentGps({ lat: TAICHUNG_SITE_COORDINATES.latitude, lng: TAICHUNG_SITE_COORDINATES.longitude });
      setSimulatedWifiBSSID('4G_LTE_MOBILE_HOTSPOT');
      setCustomLocationName(TAICHUNG_SITE_COORDINATES.name);
    } else if (preset === 'KAOHSIUNG_SITE') {
      setCurrentGps({ lat: KAOHSIUNG_SITE_COORDINATES.latitude, lng: KAOHSIUNG_SITE_COORDINATES.longitude });
      setSimulatedWifiBSSID('4G_LTE_MOBILE_HOTSPOT');
      setCustomLocationName(KAOHSIUNG_SITE_COORDINATES.name);
    } else if (preset === 'GOV_PERMIT') {
      setCurrentGps({ lat: 24.1620, lng: 120.6450 }); // 台中市政府都發局
      setSimulatedWifiBSSID('TAICHUNG_GOV_FREE_WIFI');
      setCustomLocationName('台中市都發局執照科');
    }
  };

  // Compute geofence status
  const officeDistance = calculateDistanceMeters(
    currentGps.lat,
    currentGps.lng,
    OFFICE_COORDINATES.latitude,
    OFFICE_COORDINATES.longitude
  );
  const isInsideOfficeGeofence = officeDistance <= OFFICE_COORDINATES.radiusMeters;
  const isOfficeWifiValid = OFFICE_COORDINATES.allowedWifiBSSIDs.includes(simulatedWifiBSSID);

  // 辦公室打卡 (上班/下班)
  const handleOfficeClock = (type: 'OFFICE_IN' | 'OFFICE_OUT') => {
    const isVerified = isInsideOfficeGeofence || isOfficeWifiValid;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const newLog: AttendanceLog = {
      id: `ATT_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: now.toISOString(),
      clockType: type,
      locationName: isInsideOfficeGeofence ? '台北總所辦公室' : `外部辦公室 (${customLocationName || 'GPS定位'})`,
      gps: { latitude: currentGps.lat, longitude: currentGps.lng },
      geofenceVerified: isInsideOfficeGeofence,
      wifiBssidVerified: isOfficeWifiValid,
      notes: `${type === 'OFFICE_IN' ? '上班簽到' : '下班簽退'} | ${timeStr} | 圍欄判定: ${isInsideOfficeGeofence ? '符合' : '非事務所區域'}`,
      approvalStatus: 'APPROVED'
    };

    onAddAttendanceLog(newLog);
    showToast(`✅ ${type === 'OFFICE_IN' ? '上班簽到成功' : '下班簽退成功'}！GPS 與 Wi-Fi 驗證完畢。`);
  };

  // 外勤/跑照簽到 (Field Check-in)
  const handleFieldCheckin = () => {
    const project = projects.find(p => p.id === selectedProjectId);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const watermark = `${project?.code || 'PRJ'} | ${dateStr} ${timeStr} | GPS: ${currentGps.lat.toFixed(4)}°N, ${currentGps.lng.toFixed(4)}°E | ${currentUser.name} (${selectedLocationType})`;

    const newLog: AttendanceLog = {
      id: `ATT_FIELD_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: now.toISOString(),
      clockType: 'OUT_OF_OFFICE_CHECKIN',
      projectId: selectedProjectId,
      projectName: project?.name,
      locationType: selectedLocationType,
      locationName: customLocationName || project?.location.name || '外勤公務現場',
      gps: { latitude: currentGps.lat, longitude: currentGps.lng },
      geofenceVerified: true,
      photoUrl: simulatedPhotoUrl,
      watermarkText: watermark,
      notes: fieldNotes || '專案外勤現勘與公務協商簽到',
      approvalStatus: 'APPROVED'
    };

    onAddAttendanceLog(newLog);
    showToast(`📸 外勤簽到成功！已生成帶有經緯度與專案代號之防偽浮水印日誌。`);
    setFieldNotes('');
  };

  // 公出免簽退自動判定 Engine 測試觸發 (SRS 3.1)
  const handleTriggerAutoExemptCheckout = () => {
    const now = new Date();
    const newLog: AttendanceLog = {
      id: `ATT_AUTO_EXEMPT_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: now.toISOString(),
      clockType: 'AUTO_EXEMPT_CHECKOUT',
      locationName: '公務外勤免簽退自動判定引擎 (18:30 觸發)',
      gps: { latitude: currentGps.lat, longitude: currentGps.lng },
      geofenceVerified: true,
      isAutoExemptApplied: true,
      notes: '符合觸發條件：事前具備已審核公務行程 + 16:30-18:30 外勤簽到 + 辦公室外 -> 系統於 18:30 自動完成免簽退並通知主管覆核。',
      approvalStatus: 'APPROVED'
    };

    onAddAttendanceLog(newLog);
    showToast(`⚡ 公出免簽退 Engine 觸發成功！系統自動標記「公務免簽退」並通知主管。`);
  };

  // 請假與補休申請
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leaveType === 'COMP_TIME' && currentUser.compTimeHours < leaveHours) {
      alert(`補休時數不足！當前補休池可用時數為 ${currentUser.compTimeHours} 小時，申請為 ${leaveHours} 小時。`);
      return;
    }

    const newLeave: LeaveRequest = {
      id: `LEV_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      hours: Number(leaveHours),
      reason: leaveReason || '專案工時補休調配',
      status: 'APPROVED',
      appliedAt: new Date().toISOString().split('T')[0]
    };

    onAddLeaveRequest(newLeave);

    // If comp-time, deduct from pool
    if (leaveType === 'COMP_TIME') {
      const remaining = Math.max(0, currentUser.compTimeHours - Number(leaveHours));
      onUpdateUserCompTime(currentUser.id, remaining);
    }

    showToast(`🎉 請假申請已核准！${leaveType === 'COMP_TIME' ? `已自補休池扣抵 ${leaveHours} 小時` : '假別記錄已歸檔'}`);
    setLeaveReason('');
  };

  // User attendance logs
  const userLogs = attendanceLogs.filter(
    log => currentUser.role === 'ROLE_STAFF' ? log.userId === currentUser.id : true
  );

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium font-mono">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls: Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            id="subtab-office-checkin"
            onClick={() => setActiveSubTab('OFFICE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'OFFICE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>辦公室打卡 (GPS/Wi-Fi)</span>
          </button>
          <button
            id="subtab-field-checkin"
            onClick={() => setActiveSubTab('FIELD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'FIELD'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>外勤 / 跑照 / 監造簽到</span>
          </button>
          <button
            id="subtab-leave-pool"
            onClick={() => setActiveSubTab('LEAVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'LEAVE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>補休時數池與請假管理</span>
          </button>
        </div>

        {/* Comp-time Quick Gauge */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">可用補休池:</span>
          <span className="font-bold font-mono text-slate-900">{currentUser.compTimeHours}h</span>
          {currentUser.compTimeExpiringHours > 0 && (
            <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-1 py-0.2 rounded border border-rose-200 font-semibold">
              {currentUser.compTimeExpiringHours}h 30天內到期
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Content based on Active Sub-Tab */}
      {activeSubTab === 'OFFICE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Interactive Clock-in Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                    <span>智慧彈性打卡終端 (SRS 3.1)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    整合 Mobile / LINE Bot / Web 打卡，自動檢核 GPS 地理圍欄 (R=200m) 與 Wi-Fi MAC 位址
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  08:55 AM · GPS READY
                </span>
              </div>

              {/* GPS & Wi-Fi Simulation Controller */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    模擬當前位置與連線設備 (GPS &amp; Wi-Fi Simulator)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">GEOFENCE SIMULATION</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLocationPresetChange('OFFICE')}
                    className={`p-2 rounded text-xs font-medium border text-left transition-all ${
                      selectedLocationPreset === 'OFFICE'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold">🏢 台北總所辦公室</div>
                    <div className="text-[10px] text-slate-500 font-normal">信義區 (圍欄內)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLocationPresetChange('TAICHUNG_SITE')}
                    className={`p-2 rounded text-xs font-medium border text-left transition-all ${
                      selectedLocationPreset === 'TAICHUNG_SITE'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold">🏗️ 台中七期商辦工地</div>
                    <div className="text-[10px] text-slate-500 font-normal">西屯區 (外勤現場)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLocationPresetChange('GOV_PERMIT')}
                    className={`p-2 rounded text-xs font-medium border text-left transition-all ${
                      selectedLocationPreset === 'GOV_PERMIT'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold">🏛️ 台中都發局執照科</div>
                    <div className="text-[10px] text-slate-500 font-normal">跑照外勤 (免簽退)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLocationPresetChange('KAOHSIUNG_SITE')}
                    className={`p-2 rounded text-xs font-medium border text-left transition-all ${
                      selectedLocationPreset === 'KAOHSIUNG_SITE'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold">🏗️ 高雄亞灣住宅工地</div>
                    <div className="text-[10px] text-slate-500 font-normal">前鎮區 (外勤現場)</div>
                  </button>
                </div>

                {/* Verification Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-xs">
                    <span className="text-slate-600 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      GPS 經緯度 ({currentGps.lat.toFixed(4)}, {currentGps.lng.toFixed(4)})
                    </span>
                    {isInsideOfficeGeofence ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> 圍欄內 ({officeDistance}m ≤ 200m)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-amber-700 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> 外部區域 ({Math.round(officeDistance / 1000)}km)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-xs">
                    <span className="text-slate-600 flex items-center gap-1 text-[11px]">
                      <Wifi className="w-3 h-3 text-slate-400" />
                      Wi-Fi ({simulatedWifiBSSID})
                    </span>
                    {isOfficeWifiValid ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> 指定 AP 驗證成功
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
                        外部網路 / 行動熱點
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Office Clock In / Out */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="btn-clock-in"
                  type="button"
                  onClick={() => handleOfficeClock('OFFICE_IN')}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>上班簽到 (Office In)</span>
                </button>

                <button
                  id="btn-clock-out"
                  type="button"
                  onClick={() => handleOfficeClock('OFFICE_OUT')}
                  className="py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>下班簽退 (Office Out)</span>
                </button>
              </div>

              {/* Auto Exempt Engine Banner (SRS 3.1) */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 border-l-3 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>公出免簽退自動判定 Engine (SRS 3.1 特殊機制)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerAutoExemptCheckout}
                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs cursor-pointer transition-colors font-mono"
                  >
                    模擬 18:30 觸發
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  若同仁事先填具核准之公務行程（如建管處跑照、業主會議），且最後一次外勤簽到時間介於 16:30 - 18:30 且在辦公室外，系統於 18:30 自動帶入「公務免簽退」標記並通知 PM 覆核，無需折返事務所打卡。
                </p>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Quick Profile & Comp-time Pool Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>同仁勤怠與補休池狀態</span>
                </h4>
                {onOpenUserEdit && (
                  <button
                    type="button"
                    id="btn-attendance-edit-user"
                    onClick={() => onOpenUserEdit(currentUser.id)}
                    className="text-[10px] text-blue-700 hover:text-blue-800 font-mono font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>✏️ 編輯人員</span>
                  </button>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">姓名 / 職稱</span>
                  <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.title})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">所屬組別</span>
                  <span className="text-slate-700">{currentUser.department}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">工時模式</span>
                  <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded text-[10px] font-bold border border-blue-200">
                    建築外勤彈性制
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">可用補休池</span>
                  <span className="font-bold font-mono text-blue-600 text-sm">{currentUser.compTimeHours} 小時</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">勞基法合規假別說明</div>
                <ul className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <li>• <strong>補休優先池:</strong> 加班工時優先轉入補休池，效期 12 個月。</li>
                  <li>• <strong>未休畢結轉:</strong> 期滿未休畢自動轉入薪資模組 (Module 3) 結算加班費。</li>
                  <li>• <strong>外勤免簽退:</strong> 建管處、都審及工地跑照皆可使用外勤簽到。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab: Field Check-in Form (SRS 3.1) */}
      {activeSubTab === 'FIELD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>外勤 / 跑照 / 監造簽到 (Field Check-in)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    必填專案代碼與地點類型，自動嵌合時間與經緯度防偽水印
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  SRS 3.1 FIELD WORKFLOW
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFieldCheckin();
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Project ID 專案代碼 [必填]
                      </label>
                      {onOpenProjectEdit && (
                        <button
                          type="button"
                          id="btn-attendance-edit-project"
                          onClick={() => onOpenProjectEdit(selectedProjectId)}
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 font-mono font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>✏️ 編輯案件/圍欄</span>
                        </button>
                      )}
                    </div>
                    <select
                      id="field-project-select"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.code}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location Type 地點類型 [必填]
                    </label>
                    <select
                      id="field-location-type-select"
                      value={selectedLocationType}
                      onChange={(e) => setSelectedLocationType(e.target.value as LocationType)}
                      className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="SITE_SUPERVISION">🏗️ 工地監造 (Site Supervision)</option>
                      <option value="BUILDING_PERMIT">🏛️ 都發局 / 建管處跑照 (Building Permit)</option>
                      <option value="CLIENT_MEETING">🤝 業主會議 / 簡報 (Client Meeting)</option>
                      <option value="URBAN_REVIEW">📋 都審 / 環評 / 幹事會 (Urban Review)</option>
                      <option value="SITE_SURVEY">📐 現場測繪 / 放樣查驗 (Site Survey)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    外勤地點名稱 / 地址
                  </label>
                  <input
                    type="text"
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    placeholder="例如：台中七期連續壁工區、台北市建管處執照管理科三樓"
                    className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes 外勤事項摘要 [選填]
                  </label>
                  <textarea
                    rows={2}
                    value={fieldNotes}
                    onChange={(e) => setFieldNotes(e.target.value)}
                    placeholder="摘要外勤辦理事由，例如：地下室結構版澆置現場抽驗、建築執照二次變更意見會商..."
                    className="w-full text-xs font-medium p-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Simulated Photo & Watermark Preview */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      Photo 現場水印拍照 [選填]
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTakingPhoto(!isTakingPhoto)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer font-mono"
                    >
                      {isTakingPhoto ? '收起相機' : '切換現場拍照預覽'}
                    </button>
                  </div>

                  <div className="relative rounded overflow-hidden border border-slate-300 bg-slate-900 max-h-52 flex items-center justify-center">
                    <img
                      src={simulatedPhotoUrl}
                      alt="Field Site"
                      className="w-full h-44 object-cover opacity-90"
                    />
                    {/* Watermark Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-xs text-white p-2 rounded text-[10px] font-mono leading-tight space-y-0.5 border border-slate-700">
                      <div className="text-amber-300 font-bold flex items-center justify-between">
                        <span>專案：{projects.find(p => p.id === selectedProjectId)?.code || 'PRJ-TC-01'}</span>
                        <span>{new Date().toLocaleDateString('zh-TW')} {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-slate-200">
                        GPS: {currentGps.lat.toFixed(4)}°N, {currentGps.lng.toFixed(4)}°E | 簽到同仁: {currentUser.name}
                      </div>
                      <div className="text-slate-400 truncate">
                        地點: {customLocationName || '外勤工區'} | 類型: {selectedLocationType}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-submit-field-checkin"
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>提交外勤簽到記錄 (產生 GPS 水印日誌)</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Field Guidance */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>建築師事務所外勤管理規範</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                外勤簽到紀錄將作為 <strong>Module 3 交通津貼</strong>（每次外勤基數 NT$ 150 + 公里數補貼）以及 <strong>專案監造工時審核</strong> 之依據。
              </p>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1 text-slate-800">
                <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500">交通津貼算式 (SRS 5.1)：</div>
                <div className="font-mono text-[11px] text-blue-600 font-bold">
                  Transport = Count × NT$150 + Mileage × NT$8/km
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab: Leave & Comp-time Pool (SRS 3.1) */}
      {activeSubTab === 'LEAVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>勞基法假別與補休時數池管理 (Comp-time Pool)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    加班工時可優先轉入補休池（12 個月期限），期滿未休畢自動結轉發放加班費
                  </p>
                </div>
              </div>

              {/* Comp-time Pool Visual Gauge */}
              <div className="bg-slate-900 rounded-lg p-4 text-white shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">個人可用補休時數池</div>
                  <div className="text-2xl font-bold font-mono mt-1 text-amber-400">
                    {currentUser.compTimeHours} <span className="text-xs font-normal text-slate-400 font-sans">小時</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    相當於 {Math.floor(currentUser.compTimeHours / 8)} 天 {currentUser.compTimeHours % 8} 小時工作天
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">30天內即將到期時數</div>
                  <div className="text-base font-bold font-mono text-rose-400">
                    {currentUser.compTimeExpiringHours} 小時
                  </div>
                  <span className="inline-block text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                    到期自動結算至薪資單
                  </span>
                </div>
              </div>

              {/* Leave Application Form */}
              <form onSubmit={handleLeaveSubmit} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      請假假別 [依勞基法規定]
                    </label>
                    <select
                      id="leave-type-select"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                      className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="COMP_TIME">⏱️ 補休 (Comp-time - 優先扣抵補休池)</option>
                      <option value="ANNUAL">🌴 特別休假 (Annual Leave)</option>
                      <option value="SICK">💊 普通傷病假 (半薪 Sick Leave)</option>
                      <option value="PERSONAL">🏠 事假 (不計薪 Personal Leave)</option>
                      <option value="OFFICIAL">🏛️ 公假 (公部門都審/跑照/點交)</option>
                      <option value="MARRIAGE_BEREAVEMENT">💐 婚假 / 喪假 / 產假</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      請假時數 (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="40"
                      value={leaveHours}
                      onChange={(e) => setLeaveHours(Number(e.target.value))}
                      className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">開始時間</label>
                    <input
                      type="text"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">結束時間</label>
                    <input
                      type="text"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">請假事由摘要</label>
                  <input
                    type="text"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="請簡述請記事由或專案代理人交接事項..."
                    className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  id="btn-submit-leave"
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>送出請假申請 (即時扣抵 / 送交審核)</span>
                </button>
              </form>
            </div>
          </div>

          {/* Leave History */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>近期請假與補休抵扣紀錄</span>
              </h4>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {leaveRequests.map((req) => (
                  <div key={req.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-0.5 border-l-2 border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{req.leaveType} ({req.hours}h)</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{req.startDate} ~ {req.endDate}</div>
                    <div className="text-[11px] text-slate-700 italic">"{req.reason}"</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance & Outing History Table (SRS 6.2 Schema Display) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-700" />
              <span>勤怠與外勤紀錄清單 (Attendance &amp; Out-of-Office Logs - SRS 6.2)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              即時顯示 GPS 圍欄判定、Wi-Fi BSSID 比對與公出免簽退標記
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            COUNT: {userLogs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2 px-2.5">紀錄 ID / 時間</th>
                <th className="py-2 px-2.5">同仁</th>
                <th className="py-2 px-2.5">打卡類型 (Clock Type)</th>
                <th className="py-2 px-2.5">地點 / 專案</th>
                <th className="py-2 px-2.5">GPS &amp; 圍欄</th>
                <th className="py-2 px-2.5">特殊標記 / 備註</th>
                <th className="py-2 px-2.5 text-right">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {userLogs.map((log) => {
                const isExempt = log.isAutoExemptApplied || log.clockType === 'AUTO_EXEMPT_CHECKOUT';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-2.5 text-slate-500">
                      <div className="font-semibold text-slate-700">{log.id}</div>
                      <div className="text-[10px]">{log.timestamp.replace('T', ' ').substring(0, 16)}</div>
                    </td>
                    <td className="py-2 px-2.5 font-sans font-medium text-slate-800">
                      {log.userName}
                    </td>
                    <td className="py-2 px-2.5 font-sans">
                      {log.clockType === 'OFFICE_IN' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[10px]">
                          上班打卡
                        </span>
                      )}
                      {log.clockType === 'OFFICE_OUT' && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[10px]">
                          下班打卡
                        </span>
                      )}
                      {log.clockType === 'OUT_OF_OFFICE_CHECKIN' && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 text-[10px]">
                          外勤簽到 ({log.locationType})
                        </span>
                      )}
                      {log.clockType === 'AUTO_EXEMPT_CHECKOUT' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-300 text-[10px] flex items-center gap-1 w-max">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          公務免簽退
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 font-sans">
                      <div className="font-medium text-slate-800">{log.locationName}</div>
                      {log.projectName && (
                        <div className="text-[10px] text-blue-600 font-mono">{log.projectName}</div>
                      )}
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="text-[10px] text-slate-500">
                        {log.gps.latitude.toFixed(4)}, {log.gps.longitude.toFixed(4)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        {log.geofenceVerified ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 圍欄驗證
                          </span>
                        ) : (
                          <span className="text-slate-400">非指定圍欄</span>
                        )}
                        {log.wifiBssidVerified && (
                          <span className="text-blue-600 font-semibold flex items-center gap-0.5 ml-1">
                            <Wifi className="w-2.5 h-2.5" /> Wi-Fi比對
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 font-sans text-[11px] text-slate-600 max-w-xs">
                      {isExempt && (
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] px-1 py-0.2 rounded font-bold mr-1 font-mono">
                          免簽退ENGINE
                        </span>
                      )}
                      {log.notes || '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {log.approvalStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
