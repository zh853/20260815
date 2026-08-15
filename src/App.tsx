import React, { useState, useEffect } from 'react';
import { User, Project, AttendanceLog, TimesheetRecord, LeaveRequest, PerformanceReview, MonthlyPayrollSummary } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_PROJECTS, 
  INITIAL_ATTENDANCE_LOGS, 
  INITIAL_TIMESHEETS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_PERFORMANCE_REVIEWS, 
  INITIAL_MONTHLY_PAYROLL 
} from './data/mockData';
import { calculateUserHourlyRate } from './utils/calculations';
import { Header } from './components/common/Header';
import { UserEditModal } from './components/common/UserEditModal';
import { ProjectEditModal } from './components/common/ProjectEditModal';
import { DeviceSwitcher, ViewMode } from './components/common/DeviceSwitcher';
import { MobilePhoneSimulator } from './components/common/MobilePhoneSimulator';
import { DesktopCommandBar } from './components/common/DesktopCommandBar';
import { ServerStatusModal } from './components/common/ServerStatusModal';
import { SystemWorkflowPanel } from './components/workflow/SystemWorkflowPanel';
import { AttendancePanel } from './components/attendance/AttendancePanel';
import { TimesheetPanel } from './components/timesheet/TimesheetPanel';
import { PerformanceReviewPanel } from './components/performance/PerformanceReviewPanel';
import { PayrollPanel } from './components/payroll/PayrollPanel';
import { DirectorDashboard } from './components/director/DirectorDashboard';

export default function App() {
  // State management with sensible initial datasets
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // EMP_042 (林哲宇)
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(INITIAL_ATTENDANCE_LOGS);
  const [timesheets, setTimesheets] = useState<TimesheetRecord[]>(INITIAL_TIMESHEETS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(INITIAL_PERFORMANCE_REVIEWS);
  const [monthlyPayrolls, setMonthlyPayrolls] = useState<MonthlyPayrollSummary[]>(INITIAL_MONTHLY_PAYROLL);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('workflow');

  // Device View Mode ('desktop' | 'mobile' | 'responsive') & Desktop Command Bar
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);
  const [isServerStatusOpen, setIsServerStatusOpen] = useState<boolean>(false);

  // Edit Modals State
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const handleOpenUserEdit = (userId?: string) => {
    setEditingUserId(userId || currentUser.id);
    setIsUserModalOpen(true);
  };

  const handleOpenProjectEdit = (projectId?: string) => {
    setEditingProjectId(projectId || (projects[0]?.id || null));
    setIsProjectModalOpen(true);
  };

  // Save / Update User handler
  const handleSaveUser = (savedUser: User) => {
    const rateCalc = calculateUserHourlyRate(savedUser);
    const updatedUser: User = {
      ...savedUser,
      hourlyCostRate: rateCalc.totalHourlyCostRate
    };

    setAllUsers(prev => {
      const idx = prev.findIndex(u => u.id === updatedUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedUser;
        return copy;
      }
      return [updatedUser, ...prev];
    });

    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // Save / Update Project handler
  const handleSaveProject = (savedProject: Project) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === savedProject.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedProject;
        return copy;
      }
      return [savedProject, ...prev];
    });
  };

  // Handle switching user role
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ROLE_DIRECTOR' && activeTab === 'director') {
      // stay
    } else if (user.role !== 'ROLE_DIRECTOR' && activeTab === 'director') {
      setActiveTab('workflow');
    }
  };

  // Add Attendance Log (Module 1)
  const handleAddAttendanceLog = (log: AttendanceLog) => {
    setAttendanceLogs(prev => [log, ...prev]);
  };

  // Add Leave Request (Module 1)
  const handleAddLeaveRequest = (leave: LeaveRequest) => {
    setLeaveRequests(prev => [leave, ...prev]);
  };

  // Update user comp-time pool
  const handleUpdateUserCompTime = (userId: string, newHours: number) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, compTimeHours: newHours } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, compTimeHours: newHours }));
    }
  };

  // Add Timesheet Record (Module 1)
  const handleAddTimesheet = (record: TimesheetRecord) => {
    setTimesheets(prev => [record, ...prev]);
  };

  // PM Timesheet Approval (Module 1)
  const handleApproveTimesheet = (recordId: string, approverName: string) => {
    setTimesheets(prev => prev.map(t => {
      if (t.id === recordId) {
        return {
          ...t,
          approvalStatus: 'APPROVED',
          approvedBy: approverName,
          approvedAt: new Date().toLocaleString('zh-TW')
        };
      }
      return t;
    }));
  };

  // PM Timesheet Rejection (Module 1)
  const handleRejectTimesheet = (recordId: string) => {
    setTimesheets(prev => prev.map(t => {
      if (t.id === recordId) {
        return {
          ...t,
          approvalStatus: 'REJECTED'
        };
      }
      return t;
    }));
  };

  // PM Batch Approve (Module 1)
  const handleBatchApprove = (approverName: string) => {
    setTimesheets(prev => prev.map(t => {
      if (t.approvalStatus === 'PENDING') {
        return {
          ...t,
          approvalStatus: 'APPROVED',
          approvedBy: approverName,
          approvedAt: new Date().toLocaleString('zh-TW')
        };
      }
      return t;
    }));
  };

  // Update Performance Review (Module 2)
  const handleUpdatePerformanceReview = (review: PerformanceReview) => {
    setPerformanceReviews(prev => {
      const idx = prev.findIndex(r => r.userId === review.userId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = review;
        return next;
      }
      return [...prev, review];
    });
  };

  // Distribute Project Post-mortem Bonus (Module 2 -> Module 3)
  const handleDistributeProjectBonus = (projectId: string, bonusAllocations: any[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, isBonusDistributed: true };
      }
      return p;
    }));

    // Update individual payrolls with their bonus
    bonusAllocations.forEach(alloc => {
      setMonthlyPayrolls(prev => prev.map(pay => {
        if (pay.userId === alloc.userId) {
          const newProjectBonus = (pay.variablePay.projectPostMortemBonus || 0) + alloc.calculatedBonus;
          const newVariable = pay.variablePay.totalOvertimePay + pay.variablePay.performanceBonus + newProjectBonus + pay.variablePay.transportAllowance;
          const newGross = pay.fixedPay.totalFixedPay + newVariable;
          const newNet = newGross - pay.statutoryDeductions.totalDeductions;
          return {
            ...pay,
            variablePay: {
              ...pay.variablePay,
              projectPostMortemBonus: newProjectBonus,
              totalVariablePay: newVariable
            },
            grossSalary: newGross,
            netPay: newNet
          };
        }
        return pay;
      }));
    });
  };

  // Update Payroll (Module 3)
  const handleUpdatePayroll = (payroll: MonthlyPayrollSummary) => {
    setMonthlyPayrolls(prev => {
      const idx = prev.findIndex(p => p.id === payroll.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = payroll;
        return next;
      }
      return [...prev, payroll];
    });
  };

  // Update Project Bonus Pool (Director Principal)
  const handleUpdateProjectBonusPool = (projectId: string, newPool: number) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, totalBonusPool: newPool } : p));
  };

  const renderMainContent = () => (
    <>
      {activeTab === 'workflow' && (
        <SystemWorkflowPanel
          currentUser={currentUser}
          projects={projects}
          timesheets={timesheets}
          onNavigateTab={setActiveTab}
          onOpenUserEdit={handleOpenUserEdit}
          onOpenProjectEdit={handleOpenProjectEdit}
        />
      )}

      {activeTab === 'attendance' && (
        <AttendancePanel
          currentUser={currentUser}
          projects={projects}
          attendanceLogs={attendanceLogs}
          onAddAttendanceLog={handleAddAttendanceLog}
          leaveRequests={leaveRequests}
          onAddLeaveRequest={handleAddLeaveRequest}
          onUpdateUserCompTime={handleUpdateUserCompTime}
          onOpenProjectEdit={handleOpenProjectEdit}
          onOpenUserEdit={handleOpenUserEdit}
        />
      )}

      {activeTab === 'timesheet' && (
        <TimesheetPanel
          currentUser={currentUser}
          allUsers={allUsers}
          projects={projects}
          timesheets={timesheets}
          onAddTimesheet={handleAddTimesheet}
          onApproveTimesheet={handleApproveTimesheet}
          onRejectTimesheet={handleRejectTimesheet}
          onBatchApprove={handleBatchApprove}
          onOpenProjectEdit={handleOpenProjectEdit}
          onOpenUserEdit={handleOpenUserEdit}
        />
      )}

      {activeTab === 'performance' && (
        <PerformanceReviewPanel
          currentUser={currentUser}
          allUsers={allUsers}
          projects={projects}
          timesheets={timesheets}
          performanceReviews={performanceReviews}
          onUpdatePerformanceReview={handleUpdatePerformanceReview}
          onDistributeProjectBonus={handleDistributeProjectBonus}
          onOpenProjectEdit={handleOpenProjectEdit}
          onOpenUserEdit={handleOpenUserEdit}
        />
      )}

      {activeTab === 'payroll' && (
        <PayrollPanel
          currentUser={currentUser}
          allUsers={allUsers}
          projects={projects}
          timesheets={timesheets}
          performanceReviews={performanceReviews}
          monthlyPayrolls={monthlyPayrolls}
          onUpdatePayroll={handleUpdatePayroll}
          onOpenUserEdit={handleOpenUserEdit}
          onOpenProjectEdit={handleOpenProjectEdit}
        />
      )}

      {activeTab === 'director' && currentUser.role === 'ROLE_DIRECTOR' && (
        <DirectorDashboard
          currentUser={currentUser}
          allUsers={allUsers}
          projects={projects}
          timesheets={timesheets}
          performanceReviews={performanceReviews}
          onUpdateProjectBonusPool={handleUpdateProjectBonusPool}
          onOpenProjectEdit={handleOpenProjectEdit}
          onOpenUserEdit={handleOpenUserEdit}
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Device Switcher Toolbar */}
      <DeviceSwitcher
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
      />

      {/* Main Top Header & Role Switcher */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUserEdit={handleOpenUserEdit}
        onOpenProjectEdit={handleOpenProjectEdit}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        onOpenServerStatus={() => setIsServerStatusOpen(true)}
      />

      {/* Main Content Area: Mobile Simulator vs Desktop Layout */}
      {viewMode === 'mobile' ? (
        <MobilePhoneSimulator
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {renderMainContent()}
        </MobilePhoneSimulator>
      ) : (
        <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-5 ${viewMode === 'desktop' ? 'max-w-full font-desktop' : 'max-w-7xl'}`}>
          {renderMainContent()}
        </main>
      )}

      {/* Global Personnel Data Edit Modal */}
      <UserEditModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        allUsers={allUsers}
        initialUserId={editingUserId}
        onSaveUser={handleSaveUser}
      />

      {/* Global Project / Case Edit Modal */}
      <ProjectEditModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        allUsers={allUsers}
        initialProjectId={editingProjectId}
        onSaveProject={handleSaveProject}
      />

      {/* Desktop Quick Command Search Bar (Alt+K) */}
      <DesktopCommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        allUsers={allUsers}
        projects={projects}
        onSelectUser={handleSelectUser}
        onNavigateTab={setActiveTab}
        onOpenUserEdit={handleOpenUserEdit}
        onOpenProjectEdit={handleOpenProjectEdit}
      />

      {/* Server Status & Incoming IP Monitor Modal */}
      <ServerStatusModal
        isOpen={isServerStatusOpen}
        onClose={() => setIsServerStatusOpen(false)}
      />

      {/* High-density System Footer */}
      <footer className="h-8 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-6 text-[10px] text-slate-500 uppercase tracking-widest font-medium shrink-0">
        <span>ARCHSYSTEMS ERP · 三位一體整合系統 (桌面/手機雙模式)</span>
        <span className="font-mono text-slate-400 hidden sm:inline">勞基法驗證 · GEOFENCING R=200M · DESKTOP LAUNCHER READY</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-mono text-slate-600">DESKTOP READY</span>
        </div>
      </footer>
    </div>
  );
}
