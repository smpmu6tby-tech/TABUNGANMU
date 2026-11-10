import React from 'react';
import { ActiveRole, Student, SchoolInfo } from '../types';
import { 
  PiggyBank, 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  RotateCcw,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  schoolInfo: SchoolInfo;
  activeRole: ActiveRole;
  currentStudent: Student | null;
  activeTab: 'dashboard' | 'students' | 'transactions';
  setActiveTab: (tab: 'dashboard' | 'students' | 'transactions') => void;
  onSwitchRole: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolInfo,
  activeRole,
  currentStudent,
  activeTab,
  setActiveTab,
  onSwitchRole,
  onResetData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 sm:h-13 sm:w-13 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={schoolInfo.logoUrl}
                alt={schoolInfo.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  <PiggyBank className="w-5 h-5 text-emerald-600 inline" />
                  SiTabung
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  SMP MU 6
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {schoolInfo.name}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links based on role */}
          {activeRole === 'ADMIN' ? (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'students'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Data Siswa
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Riwayat Transaksi
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <div className="text-xs">
                  <span className="text-slate-500 font-medium">Siswa: </span>
                  <span className="font-bold text-emerald-900">
                    {currentStudent?.name}
                  </span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="font-medium text-emerald-700">
                    NIS: {currentStudent?.nis} ({currentStudent?.className})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {activeRole === 'ADMIN' && (
              <button
                type="button"
                onClick={onResetData}
                title="Kembalikan data contoh awal"
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            )}

            {/* Current Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-200/80">
              {activeRole === 'ADMIN' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin Sekolah</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Portal Wali Murid</span>
                </>
              )}
            </div>

            {/* Switch / Exit Role */}
            <button
              type="button"
              onClick={onSwitchRole}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ganti Peran / Keluar</span>
              <span className="sm:hidden">Keluar</span>
            </button>

            {/* Mobile menu trigger */}
            {activeRole === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown for Admin */}
        {activeRole === 'ADMIN' && mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Dashboard Tabungan
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('students');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                activeTab === 'students'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Data Siswa & Kelas
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('transactions');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                activeTab === 'transactions'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Riwayat Transaksi Masuk & Keluar
            </button>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1 px-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Data Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
