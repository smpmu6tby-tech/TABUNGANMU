import React, { useState, useEffect } from 'react';
import { ActiveRole, Student, Transaction, TransactionType } from './types';
import { INITIAL_SCHOOL_INFO } from './data/initialData';
import { 
  getStoredStudents, 
  saveStoredStudents, 
  getStoredTransactions, 
  saveStoredTransactions, 
  resetAllDataToDefault 
} from './utils/storage';
import { 
  generateReceiptNumber, 
  calculateNewBalance, 
  formatRupiah 
} from './utils/savingsLogic';
import { Navbar } from './components/Navbar';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { TransactionHistory } from './components/admin/TransactionHistory';
import { TransactionInputModal } from './components/admin/TransactionInputModal';
import { ParentPortal } from './components/parent/ParentPortal';
import { PrintPassbookModal } from './components/common/PrintPassbookModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [schoolInfo] = useState(INITIAL_SCHOOL_INFO);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Navigation & Role states
  const [activeRole, setActiveRole] = useState<ActiveRole | 'NONE'>('NONE');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'transactions'>('dashboard');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('SETOR');
  const [txModalStudentId, setTxModalStudentId] = useState<string | undefined>(undefined);

  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [activePassbookStudent, setActivePassbookStudent] = useState<Student | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load initial data from localStorage
  useEffect(() => {
    const loadedStudents = getStoredStudents();
    const loadedTx = getStoredTransactions();
    setStudents(loadedStudents);
    setTransactions(loadedTx);

    // Support autostart or deep-linking via query parameters (useful for verification and quick testing)
    const params = new URLSearchParams(window.location.search);
    const autostart = params.get('autostart');
    const roleParam = params.get('role');
    const nisParam = params.get('nis');

    if (roleParam === 'admin' || autostart === '1') {
      setActiveRole('ADMIN');
    } else if (nisParam) {
      const match = loadedStudents.find((s) => s.nis === nisParam);
      if (match) {
        setCurrentStudent(match);
        setActiveRole('PARENT');
      }
    }
  }, []);

  // Save changes to localStorage
  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
    // If current student in parent view was updated, sync it
    if (currentStudent) {
      const updatedCurr = newStudents.find((s) => s.id === currentStudent.id);
      if (updatedCurr) setCurrentStudent(updatedCurr);
    }
  };

  const updateTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    saveStoredTransactions(newTx);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Transaction Handler
  const handleRecordTransaction = (data: {
    studentId: string;
    type: TransactionType;
    amount: number;
    date: string;
    note: string;
    recordedBy: string;
  }) => {
    const targetStudent = students.find((s) => s.id === data.studentId);
    if (!targetStudent) {
      showToast('Data siswa tidak ditemukan', 'error');
      return;
    }

    const balanceBefore = targetStudent.balance;
    const balanceAfter = calculateNewBalance(balanceBefore, data.type, data.amount);

    const newTx: Transaction = {
      id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receiptNumber: generateReceiptNumber(data.type, new Date(data.date)),
      studentId: targetStudent.id,
      studentNis: targetStudent.nis,
      studentName: targetStudent.name,
      studentClass: targetStudent.className,
      type: data.type,
      amount: data.amount,
      balanceBefore,
      balanceAfter,
      date: data.date,
      note: data.note,
      recordedBy: data.recordedBy,
    };

    // Update student balance
    const updatedStudents = students.map((s) =>
      s.id === targetStudent.id ? { ...s, balance: balanceAfter } : s
    );

    const updatedTransactions = [newTx, ...transactions];

    updateStudents(updatedStudents);
    updateTransactions(updatedTransactions);

    showToast(
      `Berhasil mencatat ${data.type === 'SETOR' ? 'setoran' : 'penarikan'} ${formatRupiah(data.amount)} untuk ${targetStudent.name}!`,
      'success'
    );

    // Open receipt modal right away
    setActiveReceiptTx(newTx);
  };

  // Student CRUD handlers
  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `std-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // If initial balance > 0, create initial deposit transaction
    let newTransactionsList = [...transactions];
    if (newStudent.balance > 0) {
      const initialTx: Transaction = {
        id: `trx-init-${Date.now()}`,
        receiptNumber: generateReceiptNumber('SETOR'),
        studentId: newStudent.id,
        studentNis: newStudent.nis,
        studentName: newStudent.name,
        studentClass: newStudent.className,
        type: 'SETOR',
        amount: newStudent.balance,
        balanceBefore: 0,
        balanceAfter: newStudent.balance,
        date: new Date().toISOString(),
        note: 'Setoran saldo tabungan awal pembukaan rekening',
        recordedBy: schoolInfo.treasurerName,
      };
      newTransactionsList = [initialTx, ...newTransactionsList];
      updateTransactions(newTransactionsList);
    }

    updateStudents([...students, newStudent]);
    showToast(`Data siswa ${newStudent.name} berhasil ditambahkan!`, 'success');
  };

  const handleUpdateStudent = (id: string, updated: Partial<Student>) => {
    const updatedStudents = students.map((s) => (s.id === id ? { ...s, ...updated } : s));
    updateStudents(updatedStudents);
    showToast('Data siswa berhasil diperbarui!', 'success');
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    const updatedStudents = students.filter((s) => s.id !== id);
    updateStudents(updatedStudents);
    showToast(`Data siswa ${target?.name || ''} telah dihapus!`, 'success');
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data kembali ke data contoh awal?')) {
      const result = resetAllDataToDefault();
      setStudents(result.students);
      setTransactions(result.transactions);
      if (currentStudent) {
        const found = result.students.find((s) => s.id === currentStudent.id) || result.students[0];
        setCurrentStudent(found);
      }
      showToast('Data berhasil dikembalikan ke pengaturan demo awal!', 'success');
    }
  };

  // Switch role or logout
  const handleSwitchRole = () => {
    setActiveRole('NONE');
    setCurrentStudent(null);
  };

  // If no role chosen yet, display RoleSelectScreen
  if (activeRole === 'NONE') {
    return (
      <RoleSelectScreen
        schoolInfo={schoolInfo}
        students={students}
        onSelectAdmin={() => {
          setActiveRole('ADMIN');
          setActiveTab('dashboard');
        }}
        onSelectParent={(student) => {
          setCurrentStudent(student);
          setActiveRole('PARENT');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        schoolInfo={schoolInfo}
        activeRole={activeRole}
        currentStudent={currentStudent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {/* Toast Alert */}
        {toast && (
          <div className="mb-6 p-4 rounded-2xl shadow-lg border flex items-center justify-between transition-all bg-white animate-fade-in border-slate-200">
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              <span className="text-sm font-bold text-slate-800">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ADMIN ROLE VIEWS */}
        {activeRole === 'ADMIN' && (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                students={students}
                transactions={transactions}
                schoolInfo={schoolInfo}
                onOpenTransactionModal={(type, studentId) => {
                  setTxModalType(type);
                  setTxModalStudentId(studentId);
                  setIsTxModalOpen(true);
                }}
                onOpenAddStudentModal={() => {
                  setActiveTab('students');
                }}
                onViewStudent={(student) => {
                  setActivePassbookStudent(student);
                }}
                onViewReceipt={(tx) => {
                  setActiveReceiptTx(tx);
                }}
                onNavigateToTransactions={() => {
                  setActiveTab('transactions');
                }}
                onNavigateToStudents={() => {
                  setActiveTab('students');
                }}
              />
            )}

            {activeTab === 'students' && (
              <StudentManagement
                students={students}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onQuickTransaction={(type, student) => {
                  setTxModalType(type);
                  setTxModalStudentId(student.id);
                  setIsTxModalOpen(true);
                }}
                onViewPassbook={(student) => {
                  setActivePassbookStudent(student);
                }}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionHistory
                transactions={transactions}
                schoolInfo={schoolInfo}
                onViewReceipt={(tx) => {
                  setActiveReceiptTx(tx);
                }}
                onOpenNewTransaction={() => {
                  setTxModalType('SETOR');
                  setTxModalStudentId(students[0]?.id);
                  setIsTxModalOpen(true);
                }}
              />
            )}
          </>
        )}

        {/* PARENT / WALI MURID VIEW */}
        {activeRole === 'PARENT' && currentStudent && (
          <ParentPortal
            student={currentStudent}
            transactions={transactions}
            schoolInfo={schoolInfo}
            onPrintPassbook={() => {
              setActivePassbookStudent(currentStudent);
            }}
            onViewReceipt={(tx) => {
              setActiveReceiptTx(tx);
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            {schoolInfo.name} • {schoolInfo.subtitle}
          </p>
          <p className="mt-1 text-slate-400">
            {schoolInfo.address} • Telp: {schoolInfo.phone} • Email: {schoolInfo.email}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            SiTabung Siswa © {new Date().getFullYear()} — Dirancang untuk efisiensi, akurasi, dan transparansi keuangan sekolah.
          </p>
        </div>
      </footer>

      {/* Transaction Input Modal */}
      <TransactionInputModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        students={students}
        initialType={txModalType}
        initialStudentId={txModalStudentId}
        onSubmitTransaction={handleRecordTransaction}
      />

      {/* Single Transaction Receipt Modal */}
      <ReceiptModal
        isOpen={activeReceiptTx !== null}
        onClose={() => setActiveReceiptTx(null)}
        transaction={activeReceiptTx}
        schoolInfo={schoolInfo}
      />

      {/* Printable Passbook / Statement Modal */}
      {activePassbookStudent && (
        <PrintPassbookModal
          isOpen={true}
          onClose={() => setActivePassbookStudent(null)}
          student={activePassbookStudent}
          transactions={transactions}
          schoolInfo={schoolInfo}
        />
      )}
    </div>
  );
}
