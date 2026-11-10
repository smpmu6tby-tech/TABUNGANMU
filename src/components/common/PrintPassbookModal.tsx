import React from 'react';
import { Student, Transaction, SchoolInfo } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/savingsLogic';
import { X, Printer, Download, CheckCircle } from 'lucide-react';

interface PrintPassbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  transactions: Transaction[];
  schoolInfo: SchoolInfo;
}

export const PrintPassbookModal: React.FC<PrintPassbookModalProps> = ({
  isOpen,
  onClose,
  student,
  transactions,
  schoolInfo,
}) => {
  if (!isOpen) return null;

  // Sort chronological for passbook (oldest to newest)
  const studentTxChronological = transactions
    .filter((t) => t.studentId === student.id || t.studentNis === student.nis)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalDeposit = studentTxChronological
    .filter((t) => t.type === 'SETOR')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawal = studentTxChronological
    .filter((t) => t.type === 'TARIK')
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  const todayStr = formatDateIndo(new Date().toISOString(), { includeTime: false });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 my-4 print:shadow-none print:border-none print:p-0 print:my-0">
        {/* Modal Controls - Hidden when printed */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Pratinjau Cetak Buku Tabungan / Rekening Koran
              </h2>
              <p className="text-xs text-slate-500">
                Dokumen resmi ber-kop surat SMP Muhammadiyah 6 Tambakboyo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="printable-passbook" className="text-slate-900 font-sans p-2 sm:p-6 bg-white">
          {/* KOP SURAT RESMI */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              <img
                src={schoolInfo.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center flex-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
                MAJELIS PENDIDIKAN DASAR DAN MENENGAH PDM KAB. TUBAN
              </h2>
              <h1 className="text-lg sm:text-xl font-black uppercase text-emerald-950 tracking-wide mt-0.5">
                {schoolInfo.name}
              </h1>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                NPSN: {schoolInfo.npsn} • Status: Terakreditasi • NSS: 202050512800
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {schoolInfo.address} • Telp: {schoolInfo.phone} • Email: {schoolInfo.email}
              </p>
            </div>
            <div className="w-20 hidden sm:block shrink-0" />
          </div>
          {/* Double line separator standard Indonesian official letterhead */}
          <div className="border-b border-slate-900 mt-1 mb-5" />

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
              LAPORAN BUKU TABUNGAN & MUTASI SALDO SISWA
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Nomor: SITABUNG/{new Date().getFullYear()}/SMPMU6/{student.nis}
            </p>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
            <div className="flex justify-between border-b sm:border-b-0 pb-1 sm:pb-0 border-slate-200">
              <span className="text-slate-500 font-medium w-36">Nama Siswa</span>
              <span className="font-bold text-slate-900 flex-1">: {student.name}</span>
            </div>
            <div className="flex justify-between border-b sm:border-b-0 pb-1 sm:pb-0 border-slate-200">
              <span className="text-slate-500 font-medium w-36">NIS / NISN</span>
              <span className="font-mono font-bold text-slate-900 flex-1">: {student.nis}</span>
            </div>
            <div className="flex justify-between border-b sm:border-b-0 pb-1 sm:pb-0 border-slate-200">
              <span className="text-slate-500 font-medium w-36">Kelas / Rombel</span>
              <span className="font-bold text-slate-900 flex-1">: Kelas {student.className}</span>
            </div>
            <div className="flex justify-between border-b sm:border-b-0 pb-1 sm:pb-0 border-slate-200">
              <span className="text-slate-500 font-medium w-36">Nama Orang Tua / Wali</span>
              <span className="font-bold text-slate-900 flex-1">: {student.parentName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium w-36">Tanggal Laporan Cetak</span>
              <span className="font-medium text-slate-900 flex-1">: {todayStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium w-36">Saldo Terkini</span>
              <span className="font-black text-emerald-800 flex-1">: {formatRupiah(student.balance)}</span>
            </div>
          </div>

          {/* Mutation Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase">
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Tanggal</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">No. Bukti</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Keterangan</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right">Setor (Rp)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right">Tarik (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Saldo (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {studentTxChronological.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                      Belum ada transaksi mutasi tabungan tercatat.
                    </td>
                  </tr>
                ) : (
                  studentTxChronological.map((tx, index) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{index + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">{formatDateIndo(tx.date, { includeTime: false })}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px]">{tx.receiptNumber}</td>
                      <td className="py-2 px-3 border-r border-slate-200 max-w-[200px] truncate">{tx.note || '-'}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold text-emerald-800">
                        {tx.type === 'SETOR' ? formatRupiah(tx.amount).replace('Rp ', '') : '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold text-rose-800">
                        {tx.type === 'TARIK' ? formatRupiah(tx.amount).replace('Rp ', '') : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatRupiah(tx.balanceAfter).replace('Rp ', '')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td colSpan={4} className="py-2.5 px-3 text-right border-r border-slate-300 uppercase">
                    Total Akumulasi:
                  </td>
                  <td className="py-2.5 px-3 text-right border-r border-slate-300 text-emerald-800">
                    {formatRupiah(totalDeposit).replace('Rp ', '')}
                  </td>
                  <td className="py-2.5 px-3 text-right border-r border-slate-300 text-rose-800">
                    {formatRupiah(totalWithdrawal).replace('Rp ', '')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-blue-900">
                    {formatRupiah(student.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs text-slate-900">
            <div>
              <p className="text-slate-500 mb-1">Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah SMP Muhammadiyah 6</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[Tanda Tangan & Stempel Resmi]</span>
              </div>
              <p className="font-extrabold underline">{schoolInfo.principalName}</p>
              <p className="text-[11px] text-slate-500">NBM / NIP: 19680512 199403 1 004</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Tambakboyo, {todayStr}</p>
              <p className="font-bold">Bendahara Pengelola Tabungan</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[Tanda Tangan Petugas]</span>
              </div>
              <p className="font-extrabold underline">{schoolInfo.treasurerName}</p>
              <p className="text-[11px] text-slate-500">NBM: 1148 9201 02</p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
            <span>Dokumen dicetak secara elektronik melalui Aplikasi SiTabung Siswa SMP Muhammadiyah 6 Tambakboyo dan sah tanpa coretan.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
