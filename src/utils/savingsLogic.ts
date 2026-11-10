import { Student, Transaction, TransactionType } from '../types';

/**
 * Format numeric value to Indonesian Rupiah representation
 * e.g. 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const formatted = Math.floor(Math.abs(amount)).toLocaleString('id-ID');
  const sign = amount < 0 ? '-' : '';
  return `${sign}Rp ${formatted}`;
}

/**
 * Clean numeric string from non-digits to get raw number
 */
export function parseRawAmount(input: string | number): number {
  if (typeof input === 'number') return Math.max(0, input);
  const cleaned = input.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validates a transaction request with strict balance checks for withdrawals
 */
export function validateTransaction(
  type: TransactionType,
  amount: number,
  currentBalance: number
): {
  isValid: boolean;
  errorMessage?: string;
  isInsufficientBalance?: boolean;
  shortfall?: number;
} {
  if (!amount || isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      errorMessage: 'Nominal transaksi harus lebih besar dari Rp 0',
    };
  }

  if (amount < 1000) {
    return {
      isValid: false,
      errorMessage: 'Nominal minimal transaksi adalah Rp 1.000',
    };
  }

  if (type === 'TARIK') {
    if (amount > currentBalance) {
      const shortfall = amount - currentBalance;
      return {
        isValid: false,
        isInsufficientBalance: true,
        shortfall,
        errorMessage: `Saldo siswa tidak mencukupi untuk penarikan! Saldo saat ini ${formatRupiah(
          currentBalance
        )}, permohonan tarik ${formatRupiah(amount)} (kurang ${formatRupiah(shortfall)}).`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Calculate the new balance after a transaction
 */
export function calculateNewBalance(
  currentBalance: number,
  type: TransactionType,
  amount: number
): number {
  if (type === 'SETOR') {
    return currentBalance + amount;
  } else if (type === 'TARIK') {
    return Math.max(0, currentBalance - amount);
  }
  return currentBalance;
}

/**
 * Generate a unique receipt number, e.g. TRX-20261109-0823
 */
export function generateReceiptNumber(type: TransactionType, date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const prefix = type === 'SETOR' ? 'STR' : 'TRK';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${yyyy}${mm}${dd}-${randomSuffix}`;
}

/**
 * Calculate aggregate savings statistics
 */
export function calculateSavingsStats(students: Student[], transactions: Transaction[]) {
  const totalSavings = students.reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalStudents = students.length;

  let totalSetorAllTime = 0;
  let totalTarikAllTime = 0;

  const today = new Date().toISOString().slice(0, 10);
  let totalSetorToday = 0;
  let totalTarikToday = 0;

  for (const t of transactions) {
    if (t.type === 'SETOR') {
      totalSetorAllTime += t.amount;
      if (t.date.startsWith(today)) {
        totalSetorToday += t.amount;
      }
    } else if (t.type === 'TARIK') {
      totalTarikAllTime += t.amount;
      if (t.date.startsWith(today)) {
        totalTarikToday += t.amount;
      }
    }
  }

  // Aggregate by class
  const classBreakdown: Record<string, { studentCount: number; totalSavings: number }> = {};
  for (const s of students) {
    const cls = s.className || 'Lainnya';
    if (!classBreakdown[cls]) {
      classBreakdown[cls] = { studentCount: 0, totalSavings: 0 };
    }
    classBreakdown[cls].studentCount += 1;
    classBreakdown[cls].totalSavings += s.balance;
  }

  return {
    totalSavings,
    totalStudents,
    totalSetorAllTime,
    totalTarikAllTime,
    totalSetorToday,
    totalTarikToday,
    totalTransactionsCount: transactions.length,
    classBreakdown,
  };
}

/**
 * Format ISO date string into readable Indonesian format
 */
export function formatDateIndo(
  isoDate: string,
  options: { includeTime?: boolean } = { includeTime: true }
): string {
  if (!isoDate) return '-';
  try {
    const date = new Date(isoDate);
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    if (options.includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins} WIB`;
    }

    return `${day} ${month} ${year}`;
  } catch {
    return isoDate;
  }
}

/**
 * Converts numeric amount to Indonesian text (Terbilang)
 * e.g. 150000 -> "Seratus Lima Puluh Ribu Rupiah"
 */
export function numberToIndonesianWords(amount: number): string {
  if (amount === 0) return 'Nol Rupiah';
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  function konversi(num: number): string {
    if (num < 12) return ' ' + angka[num];
    if (num < 20) return konversi(num - 10) + ' Belas';
    if (num < 100) return konversi(Math.floor(num / 10)) + ' Puluh' + konversi(num % 10);
    if (num < 200) return ' Seratus' + konversi(num - 100);
    if (num < 1000) return konversi(Math.floor(num / 100)) + ' Ratus' + konversi(num % 100);
    if (num < 2000) return ' Seribu' + konversi(num - 1000);
    if (num < 1000000) return konversi(Math.floor(num / 1000)) + ' Ribu' + konversi(num % 1000);
    if (num < 1000000000) return konversi(Math.floor(num / 1000000)) + ' Juta' + konversi(num % 1000000);
    if (num < 1000000000000) return konversi(Math.floor(num / 1000000000)) + ' Miliar' + konversi(num % 1000000000);
    return '';
  }

  const result = konversi(Math.floor(Math.abs(amount))).replace(/\s+/g, ' ').trim();
  return (result ? result : 'Nol') + ' Rupiah';
}

