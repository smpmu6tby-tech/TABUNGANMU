import React, { useState } from 'react';
import { Student, Transaction, SchoolInfo } from '../../types';
import { 
  formatRupiah, 
  formatDateIndo 
} from '../../utils/savingsLogic';
import { 
  PiggyBank, 
  Wallet, 
  Printer, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ReceiptText, 
  Target, 
  Clock, 
  Award,
  Sparkles,
  Phone,
  Calendar
} from 'lucide-react';

interface ParentPortalProps {
  student: Student;
  transactions: Transaction[];
  schoolInfo: SchoolInfo;
  onPrintPassbook: () => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  student,
  transactions,
  schoolInfo,
  onPrintPassbook,
  onViewReceipt,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'SETOR' | 'TARIK'>('ALL');

  // Student specific transactions sorted newest first
  const studentTransactions = transactions
    .filter((t) => t.studentId === student.id || t.studentNis === student.nis)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = studentTransactions.filter((tx) => {
    if (filterType !== 'ALL' && tx.type !== filterType) return false;
    return true;
  });

  // Calculate totals
  const totalDeposit = studentTransactions
    .filter((t) => t.type === 'SETOR')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawal = studentTransactions
    .filter((t) => t.type === 'TARIK')
    .reduce((sum, t) => sum + t.amount, 0);

  // Goal progress calculation
  const goalTarget = student.savingsGoal?.targetAmount || 1000000;
  const goalTitle = student.savingsGoal?.title || 'Target Tabungan Mandiri Siswa';
  const progressPercent = Math.min(100, Math.round((student.balance / goalTarget) * 100));

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Student Savings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passbook / ID Card style display */}
        <div className="lg:col-span-2 bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[250px]">
          {/* Background School Watermark */}
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
            <img
              src={schoolInfo.logoUrl}
              alt=""
              className="w-64 h-64 object-contain"
            />
          </div>

          <div className="relative z-10">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
                  <img
                    src={schoolInfo.logoUrl}
                    alt={schoolInfo.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-amber-300">
                    Buku Tabungan Siswa Digital
                  </h1>
                  <p className="text-xs text-emerald-200">
                    {schoolInfo.name}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Status: Aktif Menabung
                </span>
              </div>
            </div>

            {/* Middle Balance */}
            <div className="my-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Saldo Tabungan Terkini
              </span>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-1">
                {formatRupiah(student.balance)}
              </div>
            </div>
          </div>

          {/* Bottom Student Metadata */}
          <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-emerald-300 block text-[11px]">Nama Siswa:</span>
              <span className="font-bold text-white text-sm truncate block">{student.name}</span>
            </div>
            <div>
              <span className="text-emerald-300 block text-[11px]">NIS:</span>
              <span className="font-mono font-bold text-white text-sm block">{student.nis}</span>
            </div>
            <div>
              <span className="text-emerald-300 block text-[11px]">Kelas:</span>
              <span className="font-bold text-amber-300 text-sm block">{student.className}</span>
            </div>
            <div>
              <span className="text-emerald-300 block text-[11px]">Nama Wali:</span>
              <span className="font-bold text-white text-sm truncate block">{student.parentName || '-'}</span>
            </div>
          </div>
        </div>

        {/* Action & Savings Goal Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Target Menabung Anak
                </h2>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {goalTitle}
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Tercapai ({progressPercent}%)</span>
                <span className="text-emerald-700">{formatRupiah(student.balance)} / {formatRupiah(goalTarget)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-linear-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1 font-medium">
                {student.balance >= goalTarget
                  ? '🎉 Selamat! Target tabungan telah berhasil tercapai.'
                  : `Kurang ${formatRupiah(Math.max(0, goalTarget - student.balance))} lagi untuk mencapai target.`}
              </p>
            </div>

            {/* Motivational Quote */}
            <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900">
              <span className="font-bold flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Pesan Pendidikan Karakter:
              </span>
              "Membiasakan anak gemar menabung sejak usia sekolah melatih sikap hidup hemat, sabar, dan mandiri demi masa depan yang gemilang."
            </div>
          </div>

          {/* Print Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onPrintPassbook}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Buku Tabungan / Mutasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Seluruh Setoran</span>
            <span className="text-lg font-black text-emerald-700">{formatRupiah(totalDeposit)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Penarikan Dana</span>
            <span className="text-lg font-black text-rose-700">{formatRupiah(totalWithdrawal)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Frekuensi Transaksi</span>
            <span className="text-lg font-black text-slate-900">{studentTransactions.length} Kali Transaksi</span>
          </div>
        </div>
      </div>

      {/* Transparent Mutation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Filter */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-emerald-700" />
              <span>Riwayat Mutasi Transaksi Tabungan Anak</span>
            </h2>
            <p className="text-xs text-slate-500">
              Catatan transparansi saldo keluar masuk yang disahkan oleh bendahara sekolah
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua ({studentTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('SETOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === 'SETOR'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Setor Saja
            </button>
            <button
              type="button"
              onClick={() => setFilterType('TARIK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === 'TARIK'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tarik Saja
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ReceiptText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">Belum ada catatan mutasi tabungan</p>
            <p className="text-xs text-slate-500 mt-1">
              Setiap setoran atau penarikan yang dicatat oleh sekolah akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4">Tanggal & Waktu</th>
                  <th className="py-3.5 px-4">No. Bukti Transaksi</th>
                  <th className="py-3.5 px-3">Jenis</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4 text-right">Saldo Akhir</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 text-center">Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {formatDateIndo(tx.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {tx.receiptNumber}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
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
                    <td className={`py-3.5 px-4 text-right font-black whitespace-nowrap text-xs ${
                      tx.type === 'SETOR' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'SETOR' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap text-xs">
                      {formatRupiah(tx.balanceAfter)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] font-medium">
                      {tx.note || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                        title="Lihat Kuitansi"
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

      {/* School Contact Footer Card */}
      <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-700" />
          <span>
            Ada pertanyaan seputar tabungan? Hubungi Bendahara Sekolah di: <strong>{schoolInfo.phone}</strong>
          </span>
        </div>
        <span className="text-slate-400">
          Email: {schoolInfo.email}
        </span>
      </div>
    </div>
  );
};
