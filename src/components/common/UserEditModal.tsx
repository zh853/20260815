import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { calculateUserHourlyRate } from '../../utils/calculations';
import { X, UserPlus, Save, Trash2, Shield, Award, CheckCircle2, DollarSign, Clock, Users, Building } from 'lucide-react';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  initialUserId?: string | null;
  onSaveUser: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  initialUserId,
  onSaveUser,
  onDeleteUser
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || allUsers[0]?.id || 'NEW');
  const [formData, setFormData] = useState<User>(() => {
    const existing = allUsers.find(u => u.id === (initialUserId || allUsers[0]?.id));
    if (existing) return { ...existing };
    return {
      id: `EMP_${String(Math.floor(Math.random() * 900) + 100)}`,
      name: '',
      role: 'ROLE_STAFF',
      title: '專案建築設計師',
      department: '設計一組 (商辦與公有建築)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: '',
      phone: '',
      baseSalary: 50000,
      positionAllowance: 5000,
      licenses: [],
      mealAllowance: 3000,
      pensionSelfRate: 0.06,
      compTimeHours: 0,
      compTimeExpiringHours: 0,
      hourlyCostRate: 420
    };
  });

  // License input state
  const [newLicenseName, setNewLicenseName] = useState('');
  const [newLicenseAllowance, setNewLicenseAllowance] = useState<number>(3000);

  // Sync when initialUserId or allUsers changes
  useEffect(() => {
    if (isOpen) {
      const targetId = initialUserId || (allUsers.length > 0 ? allUsers[0].id : 'NEW');
      setSelectedUserId(targetId);
      const existing = allUsers.find(u => u.id === targetId);
      if (existing) {
        setFormData({ ...existing });
      } else {
        setFormData({
          id: `EMP_${String(Math.floor(Math.random() * 900) + 100)}`,
          name: '新進同仁',
          role: 'ROLE_STAFF',
          title: '專案建築設計師',
          department: '設計組',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: 'staff@architect-studio.com.tw',
          phone: '0900-000-000',
          baseSalary: 48000,
          positionAllowance: 4000,
          licenses: [],
          mealAllowance: 3000,
          pensionSelfRate: 0.06,
          compTimeHours: 0,
          compTimeExpiringHours: 0,
          hourlyCostRate: 400
        });
      }
    }
  }, [isOpen, initialUserId, allUsers]);

  if (!isOpen) return null;

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    if (id === 'NEW') {
      setFormData({
        id: `EMP_${String(Math.floor(Math.random() * 900) + 100)}`,
        name: '',
        role: 'ROLE_STAFF',
        title: '專案建築設計師',
        department: '設計一組',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: '',
        phone: '',
        baseSalary: 50000,
        positionAllowance: 4000,
        licenses: [],
        mealAllowance: 3000,
        pensionSelfRate: 0.06,
        compTimeHours: 0,
        compTimeExpiringHours: 0,
        hourlyCostRate: 420
      });
    } else {
      const existing = allUsers.find(u => u.id === id);
      if (existing) {
        setFormData({ ...existing });
      }
    }
  };

  const handleAddLicense = () => {
    if (!newLicenseName.trim()) return;
    const newLicense = {
      name: newLicenseName.trim(),
      allowance: Number(newLicenseAllowance) || 0,
      code: `LIC_${Date.now().toString().slice(-4)}`
    };
    setFormData(prev => ({
      ...prev,
      licenses: [...prev.licenses, newLicense]
    }));
    setNewLicenseName('');
    setNewLicenseAllowance(3000);
  };

  const handleRemoveLicense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index)
    }));
  };

  // Live computed cost
  const rateCalc = calculateUserHourlyRate(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const userToSave: User = {
      ...formData,
      hourlyCostRate: rateCalc.totalHourlyCostRate
    };

    onSaveUser(userToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 text-xs">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                事務所人員資料與薪資參數編輯 (Personnel Profile & Compensation)
              </h3>
              <p className="text-[10px] text-slate-400">
                可維護同仁基本資料、角色權限、本薪職加、證照津貼與自動費率試算
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Left Staff List & Right Edit Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
          {/* Left Staff Navigation (4 Cols) */}
          <div className="md:col-span-4 bg-slate-50/70 p-3 overflow-y-auto flex flex-col gap-2 shrink-0 max-h-56 md:max-h-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                同仁名冊 ({allUsers.length} 人)
              </span>
              <button
                type="button"
                id="btn-add-new-user"
                onClick={() => handleSelectUser('NEW')}
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer font-mono"
              >
                <UserPlus className="w-3 h-3" />
                <span>新增同仁</span>
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto pr-1">
              {allUsers.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u.id)}
                    className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2.5 border ${
                      isSelected
                        ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-400/20'
                        : 'bg-white/80 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate">{u.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">{u.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{u.title}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mt-0.5">
                        <span className="text-blue-700 font-semibold">NT${(u.baseSalary + u.positionAllowance).toLocaleString()}</span>
                        <span className="text-slate-400">NT${u.hourlyCostRate}/h</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Form Editor (8 Cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-8 p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {selectedUserId === 'NEW' ? '＋ 新增人員資料' : `✏️ 編輯人員：${formData.name} (${formData.id})`}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {formData.role}
                </span>
              </div>

              {/* Rate Preview Pill */}
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block">試算專案成本費率</span>
                <span className="text-xs font-bold text-emerald-700">
                  NT$ {rateCalc.totalHourlyCostRate} / 小時
                </span>
              </div>
            </div>

            {/* Section A: Basic Information */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" />
                <span>A. 基本資料與職務分派</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    員工編號 (ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    同仁姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例: 林哲宇"
                    className="w-full text-xs font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    系統操作權限角色
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full text-xs font-semibold p-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="ROLE_STAFF">一般同仁 (ROLE_STAFF)</option>
                    <option value="ROLE_PM">專案主持人 / PM (ROLE_PM)</option>
                    <option value="ROLE_HR_FIN">人資 / 會計 (ROLE_HR_FIN)</option>
                    <option value="ROLE_DIRECTOR">主持建築師 (ROLE_DIRECTOR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">職稱</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例: 專案建築設計師"
                    className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">所屬部門 / 組別</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="例: 設計一組 (商辦與公有建築)"
                    className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">電子郵件 (Email)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs font-mono p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">聯絡電話</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs font-mono p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Compensation & Salary Parameters */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>B. 薪資與津貼參數 (連動模組三勞基法薪資計算)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    本薪 / 底薪 (Base Salary NT$)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="27470"
                    required
                    value={formData.baseSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    職務加給 (Position Allowance NT$)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={formData.positionAllowance}
                    onChange={(e) => setFormData(prev => ({ ...prev, positionAllowance: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    勞退自提比例 (Pension Self-Rate)
                  </label>
                  <select
                    value={formData.pensionSelfRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, pensionSelfRate: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-semibold p-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value={0.00}>0% (不自提)</option>
                    <option value={0.01}>1%</option>
                    <option value={0.02}>2%</option>
                    <option value={0.03}>3%</option>
                    <option value={0.04}>4%</option>
                    <option value={0.05}>5%</option>
                    <option value={0.06}>6% (最高上限)</option>
                  </select>
                </div>
              </div>

              {/* Comp time parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    現存累計補休 (Comp-Time Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.compTimeHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, compTimeHours: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    30天內即期補休 (Expiring Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.compTimeExpiringHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, compTimeExpiringHours: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Licenses & Certifications Allowance */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>C. 專業證照清單與每月津貼 (Licenses)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                  證照津貼小計: NT${formData.licenses.reduce((sum, l) => sum + l.allowance, 0).toLocaleString()}
                </span>
              </div>

              {/* License list */}
              <div className="space-y-1">
                {formData.licenses.map((lic, index) => (
                  <div key={index} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-800">{lic.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-700">+ NT$ {lic.allowance.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLicense(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                        title="移除此證照"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {formData.licenses.length === 0 && (
                  <div className="text-[11px] text-slate-400 italic py-1">尚未添加專業證照津貼</div>
                )}
              </div>

              {/* Add license input row */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="證照名稱 (如: 高考建築師執照、BIM協調師、品管人員...)"
                  value={newLicenseName}
                  onChange={(e) => setNewLicenseName(e.target.value)}
                  className="flex-1 text-xs p-1.5 rounded border border-slate-300 bg-white"
                />
                <input
                  type="number"
                  step="500"
                  placeholder="每月津貼"
                  value={newLicenseAllowance}
                  onChange={(e) => setNewLicenseAllowance(Number(e.target.value))}
                  className="w-24 text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddLicense}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer font-mono"
                >
                  + 加入證照
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-[10px] text-slate-500 font-mono">
                基本時薪 (加班費基準): NT${rateCalc.baseHourlyRate}/h | 專案工時費率: NT${rateCalc.totalHourlyCostRate}/h
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  id="btn-save-user-profile"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer font-mono"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>儲存同仁資料</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
