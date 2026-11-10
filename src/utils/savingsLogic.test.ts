import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  parseRawAmount,
  validateTransaction,
  calculateNewBalance,
  calculateSavingsStats,
  generateReceiptNumber,
  numberToIndonesianWords,
} from './savingsLogic';
import { Student, Transaction } from '../types';

test('numberToIndonesianWords converts amounts accurately', () => {
  assert.equal(numberToIndonesianWords(50000), 'Lima Puluh Ribu Rupiah');
  assert.equal(numberToIndonesianWords(150000), 'Seratus Lima Puluh Ribu Rupiah');
  assert.equal(numberToIndonesianWords(1000000), 'Satu Juta Rupiah');
});

test('formatRupiah formats Indonesian currency correctly', () => {
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(50000), 'Rp 50.000');
  assert.equal(formatRupiah(1250000), 'Rp 1.250.000');
});

test('parseRawAmount extracts digits correctly', () => {
  assert.equal(parseRawAmount('Rp 50.000'), 50000);
  assert.equal(parseRawAmount('100.000'), 100000);
  assert.equal(parseRawAmount(25000), 25000);
  assert.equal(parseRawAmount(''), 0);
});

test('validateTransaction handles deposit and withdrawal constraints', () => {
  // Deposit of zero or negative should fail
  const invalidZero = validateTransaction('SETOR', 0, 100000);
  assert.equal(invalidZero.isValid, false);

  // Deposit below min should fail
  const invalidMin = validateTransaction('SETOR', 500, 100000);
  assert.equal(invalidMin.isValid, false);

  // Valid deposit
  const validDeposit = validateTransaction('SETOR', 50000, 100000);
  assert.equal(validDeposit.isValid, true);

  // Withdrawal exceeding balance must fail with shortfall and flag
  const overdraw = validateTransaction('TARIK', 150000, 100000);
  assert.equal(overdraw.isValid, false);
  assert.equal(overdraw.isInsufficientBalance, true);
  assert.equal(overdraw.shortfall, 50000);
  assert.match(overdraw.errorMessage || '', /Saldo siswa tidak mencukupi/);

  // Valid withdrawal equal or less than balance
  const validWithdrawal = validateTransaction('TARIK', 100000, 100000);
  assert.equal(validWithdrawal.isValid, true);
  assert.equal(validWithdrawal.isInsufficientBalance, undefined);
});

test('calculateNewBalance calculates correct balance for deposit and withdrawal', () => {
  assert.equal(calculateNewBalance(100000, 'SETOR', 50000), 150000);
  assert.equal(calculateNewBalance(100000, 'TARIK', 40000), 60000);
  assert.equal(calculateNewBalance(50000, 'TARIK', 50000), 0);
});

test('generateReceiptNumber produces expected prefix and format', () => {
  const setorReceipt = generateReceiptNumber('SETOR', new Date(2026, 10, 9));
  assert.match(setorReceipt, /^STR-20261109-\d{4}$/);

  const tarikReceipt = generateReceiptNumber('TARIK', new Date(2026, 10, 9));
  assert.match(tarikReceipt, /^TRK-20261109-\d{4}$/);
});

test('calculateSavingsStats computes aggregated values accurately', () => {
  const mockStudents: Student[] = [
    {
      id: 's1',
      nis: '202401',
      name: 'Ahmad',
      className: 'VII-A',
      gender: 'L',
      parentName: 'Bapak Ahmad',
      phone: '08123456789',
      address: 'Tambakboyo',
      balance: 150000,
      createdAt: '2026-01-01',
    },
    {
      id: 's2',
      nis: '202402',
      name: 'Fatimah',
      className: 'VII-B',
      gender: 'P',
      parentName: 'Ibu Fatimah',
      phone: '08129876543',
      address: 'Tambakboyo',
      balance: 250000,
      createdAt: '2026-01-01',
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 't1',
      receiptNumber: 'STR-001',
      studentId: 's1',
      studentNis: '202401',
      studentName: 'Ahmad',
      studentClass: 'VII-A',
      type: 'SETOR',
      amount: 150000,
      balanceBefore: 0,
      balanceAfter: 150000,
      date: new Date().toISOString(),
      note: 'Awal',
      recordedBy: 'Admin',
    },
  ];

  const stats = calculateSavingsStats(mockStudents, mockTransactions);
  assert.equal(stats.totalSavings, 400000);
  assert.equal(stats.totalStudents, 2);
  assert.equal(stats.totalSetorAllTime, 150000);
  assert.equal(stats.classBreakdown['VII-A'].totalSavings, 150000);
  assert.equal(stats.classBreakdown['VII-B'].totalSavings, 250000);
});
