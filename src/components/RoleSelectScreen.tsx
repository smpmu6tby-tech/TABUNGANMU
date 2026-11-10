import React, { useState } from 'react';
import { SchoolInfo, Student } from '../types';
import { 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  KeyRound, 
  Search, 
  Sparkles,
  CheckCircle2,
  Wallet
} from 'lucide-react';

interface RoleSelectScreenProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  onSelectAdmin: () => void;
  onSelectParent: (student: Student) => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  schoolInfo,
  students,
  onSelectAdmin,
  onSelectParent,
}) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<'ADMIN' | 'PARENT'>('ADMIN');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminError, setAdminError] = useState('');
  
  // Parent search states
  const [nisInput, setNisInput] = useState('');
  const [parentError, setParentError] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim() === 'admin123' || adminPassword.trim() === 'admin') {
      setAdminError('');
      onSelectAdmin();
    } else {
      setAdminError('Kata sandi admin salah! (Gunakan default: admin123)');
    }
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = nisInput.trim().toLowerCase();
    if (!query) {
      setParentError('Silakan masukkan NIS atau pilih siswa dari daftar.');
      return;
    }

    const matched = students.find(
      (s) => s.nis.toLowerCase() === query || s.name.toLowerCase().includes(query)
    );

    if (matched) {
      setParentError('');
      onSelectParent(matched);
    } else {
      setParentError(`Siswa dengan NIS/Nama "${nisInput}" tidak ditemukan dalam sistem.`);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.nis.includes(searchFilter) ||
      s.className.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-950/10 via-slate-50 to-amber-50/30 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full text-center pt-2 sm:pt-6">
        <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-2xl shadow-md border border-slate-200/80 mb-4">
          <img
            src={schoolInfo.logoUrl}
            alt="Logo SMP Muhammadiyah 6 Tambakboyo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          SiTabung Siswa
        </h1>
        <p className="text-base sm:text-lg font-bold text-emerald-800 mt-1">
          {schoolInfo.name}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1">
          Sistem Informasi Tabungan Siswa Modern, Aman, dan Transparan untuk Sekolah & Wali Murid
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full mt-6 bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-100/90 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedRoleTab('ADMIN')}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm sm:text-base font-bold transition-all ${
              selectedRoleTab === 'ADMIN'
                ? 'bg-white text-emerald-900 shadow-md shadow-emerald-950/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Admin Sekolah</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRoleTab('PARENT')}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm sm:text-base font-bold transition-all ${
              selectedRoleTab === 'PARENT'
                ? 'bg-white text-emerald-900 shadow-md shadow-emerald-950/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Wali Murid / Orang Tua</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {selectedRoleTab === 'ADMIN' ? (
            <div>
              <div className="flex items-center gap-3 mb-6 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Akses Khusus Bendahara & Pengelola Tabungan
                  </h2>
                  <p className="text-xs text-slate-600">
                    Kelola data seluruh siswa, input setor/tarik saldo, dan cetak kuitansi.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label htmlFor="adminPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kata Sandi Admin
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan kata sandi (default: admin123)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm font-medium transition"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                      Sandi demo: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">admin123</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdminPassword('admin123')}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      Isi Otomatis
                    </button>
                  </div>
                  {adminError && (
                    <p className="text-xs text-rose-600 mt-2 font-medium">{adminError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>Masuk ke Dashboard Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Sistem tabungan resmi SMP Muhammadiyah 6 Tambakboyo, Tuban
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Cek Saldo & Mutasi Tabungan Putra-Putri Anda
                  </h2>
                  <p className="text-xs text-slate-600">
                    Masukkan NIS atau pilih nama siswa untuk melihat buku tabungan digital secara real-time.
                  </p>
                </div>
              </div>

              {/* Direct NIS Form */}
              <form onSubmit={handleParentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nisInput" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nomor Induk Siswa (NIS) atau Nama Anak
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      id="nisInput"
                      type="text"
                      value={nisInput}
                      onChange={(e) => setNisInput(e.target.value)}
                      placeholder="Ketik NIS (contoh: 20240101) atau Nama Siswa"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-sm font-medium transition"
                    />
                  </div>
                  {parentError && (
                    <p className="text-xs text-rose-600 mt-2 font-medium">{parentError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>Lihat Tabungan & Mutasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Select Student List */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Atau Pilih Langsung Siswa Demo:
                  </span>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Saring daftar..."
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-36"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => onSelectParent(student)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-800">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          NIS: <span className="font-mono font-medium">{student.nis}</span> • {student.className}
                        </p>
                      </div>
                      <div className="shrink-0 p-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-700 transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-6">
        <p>© {new Date().getFullYear()} {schoolInfo.name} — SiTabung v1.0</p>
        <p className="mt-0.5">{schoolInfo.address} • Telp: {schoolInfo.phone}</p>
      </footer>
    </div>
  );
};
