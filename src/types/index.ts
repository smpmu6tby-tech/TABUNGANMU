export type TransactionType = 'SETOR' | 'TARIK';

export interface Student {
  id: string;
  nis: string;
  name: string;
  className: string;
  gender: 'L' | 'P';
  parentName: string;
  phone: string;
  address: string;
  balance: number;
  savingsGoal?: {
    title: string;
    targetAmount: number;
  };
  createdAt: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  studentClass: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  date: string; // ISO string
  note: string;
  recordedBy: string;
}

export interface SchoolInfo {
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  npsn: string;
  principalName: string;
  treasurerName: string;
  logoUrl: string;
}

export type ActiveRole = 'ADMIN' | 'PARENT';
