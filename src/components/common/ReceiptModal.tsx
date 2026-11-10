import React from 'react';
import { Transaction, SchoolInfo } from '../../types';
import { 
  formatRupiah, 
  formatDateIndo, 
  numberToIndonesianWords 
} from '../../utils/savingsLogic';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  schoolInfo: SchoolInfo;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  schoolInfo,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDeposit = transaction.type === 'SETOR';
  const terbilangStr = numberToIndonesianWords(transaction.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-4 print:shadow-none print:border-none print:p-0 print:my-0">
        {/* Modal Controls - Hidden when printed */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Kuitansi Bukti Transaksi Tabungan
              </h2>
              <p className="text-xs text-slate-500">
                No. Bukti: <span className="font-mono font-bold text-slate-700">{transaction.receiptNumber}</span>
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
              <span>Cetak Kuitansi</span>
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

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50/50 print:border-slate-800 print:bg-white print:p-4 text-slate-900 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 shrink-0">
                <img
                  src={schoolInfo.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase text-emerald-950">
                  {schoolInfo.name}
                </h1>
                <p className="text-[10px] text-slate-600">
                  {schoolInfo.address} • Telp: {schoolInfo.phone}
                </p>
                <p className="text-[10px] font-bold text-slate-700">
                  PENGELOLA TABUNGAN SISWA (SITABUNG)
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase border ${
                isDeposit
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {isDeposit ? 'BUKTI SETORAN' : 'BUKTI PENARIKAN'}
              </span>
              <p className="font-mono text-xs font-bold text-slate-700 mt-1">
                {transaction.receiptNumber}
              </p>
            </div>
          </div>

          {/* Body Lines */}
          <div className="space-y-2.5 text-xs">
            <div className="flex">
              <span className="w-40 text-slate-500 font-medium">Telah terima dari / untuk</span>
              <span className="font-bold text-slate-900 flex-1">
                : {transaction.studentName} (Kelas {transaction.studentClass})
              </span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-500 font-medium">Nomor Induk Siswa (NIS)</span>
              <span className="font-mono font-bold text-slate-900 flex-1">
                : {transaction.studentNis}
              </span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-500 font-medium">Jenis Transaksi</span>
              <span className="font-bold flex-1">
                : {isDeposit ? 'Setoran Tabungan Siswa (Kredit)' : 'Penarikan Tabungan Siswa (Debit)'}
              </span>
            </div>

            <div className="flex items-start">
              <span className="w-40 text-slate-500 font-medium">Uang Sejumlah (Terbilang)</span>
              <span className="italic font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 flex-1">
                # {terbilangStr} #
              </span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-500 font-medium">Untuk Keperluan / Catatan</span>
              <span className="text-slate-800 flex-1">
                : {transaction.note || (isDeposit ? 'Tabungan sukarela siswa' : 'Penarikan tabungan')}
              </span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-500 font-medium">Saldo Sesudah Transaksi</span>
              <span className="font-black text-slate-900 flex-1">
                : {formatRupiah(transaction.balanceAfter)}
              </span>
            </div>
          </div>

          {/* Amount Box & Date */}
          <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="p-3 bg-white border-2 border-slate-900 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Jumlah Nominal:</span>
              <span className="text-lg font-black text-slate-900">
                {formatRupiah(transaction.amount)}
              </span>
            </div>

            <div className="text-right text-xs text-slate-600">
              <p>Tambakboyo, {formatDateIndo(transaction.date, { includeTime: false })}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Waktu: {formatDateIndo(transaction.date).split(',')[1] || ''}</p>
            </div>
          </div>

          {/* Dual Signatures */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-1">{isDeposit ? 'Penyetor / Siswa' : 'Penerima / Siswa'}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
              </div>
              <p className="font-bold underline text-slate-900">{transaction.studentName}</p>
              <p className="text-[10px] text-slate-500">Siswa / Wali Murid</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Kasir / Bendahara Sekolah</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">(Tanda Tangan & Cap)</span>
              </div>
              <p className="font-bold underline text-slate-900">{transaction.recordedBy}</p>
              <p className="text-[10px] text-slate-500">Bendahara Tabungan SMP MU 6</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
