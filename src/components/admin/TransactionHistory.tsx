import React, { useState } from 'react';
import { Transaction, SchoolInfo } from '../../types';
import { 
  formatRupiah, 
  formatDateIndo 
} from '../../utils/savingsLogic';
import { AVAILABLE_CLASSES } from '../../data/initialData';
import { 
  ReceiptText, 
  Search, 
  Filter, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Printer, 
  Calendar
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  schoolInfo: SchoolInfo;
  onViewReceipt: (tx: Transaction) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  schoolInfo,
  onViewReceipt,
  onOpenNewTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SETOR' | 'TARIK'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Filter logic
  const filtered = transactions.filter((tx) => {
    // Type filter
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

    // Class filter
    if (classFilter !== 'ALL' && tx.studentClass !== classFilter) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.studentName.toLowerCase().includes(q);
      const matchNis = tx.studentNis.toLowerCase().includes(q);
      const matchReceipt = tx.receiptNumber.toLowerCase().includes(q);
      const matchNote = tx.note.toLowerCase().includes(q);
      if (!matchName && !matchNis && !matchReceipt && !matchNote) return false;
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const txTime = new Date(tx.date).getTime();
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (dateFilter === 'TODAY') {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (!tx.date.startsWith(todayStr)) return false;
      } else if (dateFilter === 'WEEK') {
        if (now - txTime > 7 * oneDay) return false;
      } else if (dateFilter === 'MONTH') {
        if (now - txTime > 30 * oneDay) return false;
      }
    }

    return true;
  });

  // Calculate totals for filtered transactions
  const totalFilteredSetor = filtered
    .filter((t) => t.type === 'SETOR')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredTarik = filtered
    .filter((t) => t.type === 'TARIK')
    .reduce((sum, t) => sum + t.amount, 0);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['No. Bukti', 'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Jenis', 'Nominal', 'Saldo Sesudah', 'Keterangan', 'Petugas'];
    const rows = filtered.map((tx) => [
      `"${tx.receiptNumber}"`,
      `"${formatDateIndo(tx.date)}"`,
      `"${tx.studentNis}"`,
      `"${tx.studentName}"`,
      `"${tx.studentClass}"`,
      `"${tx.type}"`,
      tx.amount,
      tx.balanceAfter,
      `"${tx.note.replace(/"/g, '""')}"`,
      `"${tx.recordedBy}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Tabungan_SMPMU6_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ReceiptText className="w-6 h-6 text-emerald-700" />
              <span>Riwayat Transaksi Tabungan Masuk & Keluar</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Daftar seluruh transaksi setoran dan penarikan tabungan siswa {schoolInfo.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              <span>+ Input Transaksi</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-6 pt-5 border-t border-slate-100">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Bukti, Nama, NIS, atau Keterangan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
            />
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="SETOR">Hanya Setoran (Masuk)</option>
              <option value="TARIK">Hanya Tarik Tunai (Keluar)</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="lg:col-span-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="ALL">Semua Kelas</option>
              {AVAILABLE_CLASSES.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="lg:col-span-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="ALL">Semua Periode Waktu</option>
              <option value="TODAY">Hari Ini Saja</option>
              <option value="WEEK">7 Hari Terakhir</option>
              <option value="MONTH">30 Hari Terakhir</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl text-xs">
          <div className="text-slate-600 font-semibold">
            Ditemukan <strong className="text-slate-900">{filtered.length}</strong> transaksi sesuai kriteria
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-bold">
              Total Setor: {formatRupiah(totalFilteredSetor)}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-700 font-bold">
              Total Tarik: {formatRupiah(totalFilteredTarik)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ReceiptText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">Tidak ada riwayat transaksi</p>
            <p className="text-xs text-slate-500 mt-1">
              Coba sesuaikan filter pencarian atau lakukan input transaksi baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4">No. Bukti Transaksi</th>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-3">Kelas</th>
                  <th className="py-3.5 px-3">Jenis</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4 text-right">Saldo Sesudah</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-3 text-center">Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {tx.receiptNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {formatDateIndo(tx.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block text-xs">{tx.studentName}</span>
                      <span className="text-[11px] text-slate-500 font-medium">NIS: <span className="font-mono">{tx.studentNis}</span></span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-extrabold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                        {tx.studentClass}
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
                    <td className="py-3 px-4 max-w-[220px] truncate text-slate-600 font-medium" title={tx.note}>
                      {tx.note || '-'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                        title="Lihat / Cetak Kuitansi"
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
