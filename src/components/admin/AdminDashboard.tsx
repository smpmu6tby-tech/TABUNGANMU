import React from 'react';
import { Student, Transaction, SchoolInfo } from '../../types';
import { 
  formatRupiah, 
  formatDateIndo, 
  calculateSavingsStats 
} from '../../utils/savingsLogic';
import { 
  PiggyBank, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle, 
  MinusCircle, 
  UserPlus, 
  ReceiptText,
  TrendingUp,
  School,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  transactions: Transaction[];
  schoolInfo: SchoolInfo;
  onOpenTransactionModal: (defaultType: 'SETOR' | 'TARIK', studentId?: string) => void;
  onOpenAddStudentModal: () => void;
  onViewStudent: (student: Student) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onNavigateToTransactions: () => void;
  onNavigateToStudents: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  transactions,
  schoolInfo,
  onOpenTransactionModal,
  onOpenAddStudentModal,
  onViewStudent,
  onViewReceipt,
  onNavigateToTransactions,
  onNavigateToStudents,
}) => {
  const stats = calculateSavingsStats(students, transactions);

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Top 5 students by savings
  const topStudents = [...students]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <img
            src={schoolInfo.logoUrl}
            alt=""
            className="w-72 h-72 object-contain"
          />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-xs font-semibold text-amber-300 mb-3">
            <School className="w-3.5 h-3.5" />
            <span>Dashboard Pengelolaan Tabungan • {schoolInfo.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Ringkasan Keuangan Tabungan Siswa
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-xl">
            Sistem pencatatan transaksi setor dan tarik tunai terpusat untuk mewujudkan transparansi dan kemudahan pelaporan sekolah kepada wali murid.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onOpenTransactionModal('SETOR')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>+ Setor Tabungan</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenTransactionModal('TARIK')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4 text-rose-300" />
              <span>- Tarik Tunai</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddStudentModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm border border-emerald-600/50 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Siswa Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tabungan Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Seluruh Saldo
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiah(stats.totalSavings)}
            </div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dana tabungan aman terdata</span>
            </p>
          </div>
        </div>

        {/* Total Siswa Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumlah Siswa Penabung
            </span>
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalStudents} <span className="text-base font-medium text-slate-500">Siswa</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Tersebar di {Object.keys(stats.classBreakdown).length} kelas aktif
            </p>
          </div>
        </div>

        {/* Total Setoran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Setor (Uang Masuk)
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatRupiah(stats.totalSetorAllTime)}
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-semibold">
              Hari ini: {formatRupiah(stats.totalSetorToday)}
            </p>
          </div>
        </div>

        {/* Total Penarikan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Tarik (Uang Keluar)
            </span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-700 tracking-tight">
              {formatRupiah(stats.totalTarikAllTime)}
            </div>
            <p className="text-xs text-rose-600 mt-1 font-medium">
              Hari ini: {formatRupiah(stats.totalTarikToday)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Class Breakdown & Top Savers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Distribusi Saldo Per Rombel / Kelas
              </h2>
              <p className="text-xs text-slate-500">
                Rincian tabungan berdasarkan jenjang kelas di SMP Muhammadiyah 6 Tambakboyo
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToStudents}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua Siswa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats.classBreakdown).map(([className, data]) => {
              const percentage = stats.totalSavings > 0 
                ? Math.round((data.totalSavings / stats.totalSavings) * 100) 
                : 0;

              return (
                <div
                  key={className}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs font-mono">
                      Kelas {className}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {data.studentCount} Siswa
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {formatRupiah(data.totalSavings)}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 text-right font-medium">
                    {percentage}% dari total saldo
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Siswa Penabung Tergiat
              </h2>
              <p className="text-xs text-slate-500">
                Siswa dengan saldo tabungan tertinggi
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topStudents.map((student, idx) => (
              <div
                key={student.id}
                onClick={() => onViewStudent(student)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/50 transition cursor-pointer group border border-transparent hover:border-emerald-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    idx === 0 
                      ? 'bg-amber-100 text-amber-800 font-extrabold' 
                      : idx === 1 
                      ? 'bg-slate-200 text-slate-700' 
                      : idx === 2 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {student.className} • NIS: <span className="font-mono">{student.nis}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-emerald-800">
                    {formatRupiah(student.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-emerald-600" />
              <span>Mutasi Transaksi Tabungan Terkini</span>
            </h2>
            <p className="text-xs text-slate-500">
              Daftar transaksi masuk dan keluar yang baru dicatat oleh kasir/bendahara
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToTransactions}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition self-start sm:self-auto cursor-pointer"
          >
            <span>Buka Semua Riwayat Transaksi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Belum ada data transaksi yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3 px-4">No. Bukti / Waktu</th>
                  <th className="py-3 px-4">Nama Siswa & Kelas</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Saldo Sesudah</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block">
                        {tx.receiptNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formatDateIndo(tx.date)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block text-xs">
                        {tx.studentName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        NIS: <span className="font-mono">{tx.studentNis}</span> • Kelas {tx.studentClass}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {tx.type === 'SETOR' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                          Setor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <ArrowUpRight className="w-3 h-3 text-rose-700" />
                          Tarik
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-black whitespace-nowrap text-xs ${
                      tx.type === 'SETOR' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'SETOR' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap text-xs">
                      {formatRupiah(tx.balanceAfter)}
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-slate-600 font-medium">
                      {tx.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                        title="Cetak Kuitansi Transaksi"
                      >
                        <ReceiptText className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
