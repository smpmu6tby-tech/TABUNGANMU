import React, { useState, useEffect } from 'react';
import { Student, TransactionType } from '../../types';
import { 
  formatRupiah, 
  parseRawAmount, 
  validateTransaction, 
  calculateNewBalance 
} from '../../utils/savingsLogic';
import { 
  X, 
  PlusCircle, 
  MinusCircle, 
  AlertCircle, 
  Check, 
  Calendar, 
  User, 
  FileText,
  Search,
  Sparkles
} from 'lucide-react';

interface TransactionInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialType?: TransactionType;
  initialStudentId?: string;
  onSubmitTransaction: (data: {
    studentId: string;
    type: TransactionType;
    amount: number;
    date: string;
    note: string;
    recordedBy: string;
  }) => void;
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export const TransactionInputModal: React.FC<TransactionInputModalProps> = ({
  isOpen,
  onClose,
  students,
  initialType = 'SETOR',
  initialStudentId,
  onSubmitTransaction,
}) => {
  const [txType, setTxType] = useState<TransactionType>(initialType);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [studentSearch, setStudentSearch] = useState('');
  const [amountRaw, setAmountRaw] = useState<string>('50000');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [note, setNote] = useState('');
  const [recordedBy, setRecordedBy] = useState('Nurul Hidayati (Bendahara)');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      setTxType(initialType);
      if (initialStudentId) {
        setSelectedStudentId(initialStudentId);
      } else if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
      setTransactionDate(new Date().toISOString().slice(0, 16));
      setErrorMessage('');
    }
  }, [isOpen, initialType, initialStudentId, students]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const numericAmount = parseRawAmount(amountRaw);
  const currentBalance = currentStudent ? currentStudent.balance : 0;
  const newBalance = calculateNewBalance(currentBalance, txType, numericAmount);

  const validation = validateTransaction(txType, numericAmount, currentBalance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) {
      setErrorMessage('Pilih siswa terlebih dahulu!');
      return;
    }

    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Data transaksi tidak valid');
      return;
    }

    setErrorMessage('');
    onSubmitTransaction({
      studentId: currentStudent.id,
      type: txType,
      amount: numericAmount,
      date: new Date(transactionDate).toISOString(),
      note: note.trim() || (txType === 'SETOR' ? 'Setoran tabungan' : 'Penarikan tabungan'),
      recordedBy: recordedBy.trim() || 'Bendahara Sekolah',
    });
    onClose();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nis.includes(studentSearch) ||
      s.className.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${txType === 'SETOR' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {txType === 'SETOR' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Input Transaksi Tabungan
              </h2>
              <p className="text-xs text-slate-500">
                Pencatatan mutasi setor tunai atau penarikan saldo siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Type Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mt-4">
          <button
            type="button"
            onClick={() => {
              setTxType('SETOR');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              txType === 'SETOR'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Setor Tabungan (Masuk)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTxType('TARIK');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              txType === 'TARIK'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>Tarik Tunai (Keluar)</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Select Student */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Pilih Siswa Penabung *</span>
              </label>
              {currentStudent && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Saldo Saat Ini: {formatRupiah(currentStudent.balance)}
                </span>
              )}
            </div>

            {/* Student Search & Select combo */}
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Ketik untuk memfilter nama / NIS siswa..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-slate-900"
              >
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Kelas {s.className} (NIS: {s.nis}) — Saldo: {formatRupiah(s.balance)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nominal Transaksi (Rp) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 text-sm pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                required
                value={numericAmount > 0 ? numericAmount.toLocaleString('id-ID') : ''}
                onChange={(e) => setAmountRaw(e.target.value)}
                placeholder="0"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border text-lg font-black focus:outline-hidden focus:ring-2 transition ${
                  txType === 'SETOR'
                    ? 'border-emerald-300 focus:ring-emerald-500 text-emerald-800 bg-emerald-50/20'
                    : 'border-rose-300 focus:ring-rose-500 text-rose-800 bg-rose-50/20'
                }`}
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Nominal Cepat:</span>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountRaw(String(amt))}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                    numericAmount === amt
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  +{amt >= 1000 ? `${amt / 1000}rb` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Prominent Insufficient Balance Warning for Withdrawal */}
          {txType === 'TARIK' && validation.isInsufficientBalance && currentStudent && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 shadow-xs animate-shake">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <h3 className="font-extrabold text-sm text-rose-900 flex items-center gap-1.5">
                    Peringatan: Saldo Tabungan Tidak Mencukupi!
                  </h3>
                  <p className="text-rose-800">
                    Siswa <strong>{currentStudent.name}</strong> hanya memiliki saldo <strong>{formatRupiah(currentBalance)}</strong>, sedangkan permohonan tarik tunai sebesar <strong>{formatRupiah(numericAmount)}</strong>.
                  </p>
                  <p className="font-bold text-rose-700 bg-rose-100/70 p-2 rounded-lg border border-rose-200 mt-2">
                    Kekurangan dana: {formatRupiah(validation.shortfall || (numericAmount - currentBalance))}
                  </p>
                  {currentBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmountRaw(String(currentBalance))}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Setel Penarikan ke Saldo Maksimal ({formatRupiah(currentBalance)})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Valid Withdrawal Balance Affirmation */}
          {txType === 'TARIK' && validation.isValid && numericAmount > 0 && currentStudent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Saldo siswa mencukupi untuk ditarik. Sisa saldo akhir nantinya: <strong>{formatRupiah(newBalance)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Simulation Balance Card */}
          {currentStudent && (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition ${
              txType === 'TARIK' && validation.isInsufficientBalance
                ? 'bg-rose-50/50 border-rose-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-slate-500 font-medium block">
                  Simulasi Saldo Rekening Siswa
                </span>
                <span className="text-slate-700 font-semibold">
                  {formatRupiah(currentBalance)} {txType === 'SETOR' ? '+' : '-'} {formatRupiah(numericAmount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Saldo Akhir</span>
                <span className={`text-sm font-black ${
                  txType === 'TARIK' && validation.isInsufficientBalance
                    ? 'text-rose-600'
                    : 'text-emerald-700'
                }`}>
                  {formatRupiah(newBalance)}
                </span>
              </div>
            </div>
          )}

          {/* Date and Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal & Waktu</span>
              </label>
              <input
                type="datetime-local"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Petugas / Kasir</span>
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Note / Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan / Berita Transaksi
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={txType === 'SETOR' ? 'Contoh: Tabungan mingguan rutin' : 'Contoh: Pembelian buku/seragam sekolah'}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(txType === 'SETOR'
                ? ['Tabungan mingguan rutin', 'Sisa uang saku', 'Hadiah prestasi', 'Tabungan kurban']
                : ['Buku & modul sekolah', 'Seragam / atribut HW', 'Keperluan mendesak anak', 'Study tour']
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNote(preset)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!validation.isValid}
              className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer ${
                validation.isInsufficientBalance
                  ? 'bg-rose-700/80 cursor-not-allowed opacity-70'
                  : txType === 'SETOR'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              } disabled:cursor-not-allowed`}
            >
              {validation.isInsufficientBalance ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Saldo Siswa Kurang ({formatRupiah(validation.shortfall || 0)})</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Transaksi ({txType === 'SETOR' ? 'Setor Tabungan' : 'Tarik Tunai'})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
