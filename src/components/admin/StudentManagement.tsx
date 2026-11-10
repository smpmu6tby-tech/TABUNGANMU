import React, { useState } from 'react';
import { Student } from '../../types';
import { formatRupiah } from '../../utils/savingsLogic';
import { AVAILABLE_CLASSES } from '../../data/initialData';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  BookOpen, 
  Phone, 
  MapPin, 
  X,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, 'id' | 'createdAt'>) => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onQuickTransaction: (type: 'SETOR' | 'TARIK', student: Student) => void;
  onViewPassbook: (student: Student) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onQuickTransaction,
  onViewPassbook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    nis: '',
    name: '',
    className: 'VII-A',
    gender: 'L' as 'L' | 'P',
    parentName: '',
    phone: '',
    address: '',
    initialBalance: 0,
    goalTitle: '',
    goalAmount: 0,
  });

  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    // Generate next suggested NIS based on year
    const nextNis = `2024${String(students.length + 1).padStart(4, '0')}`;
    setFormData({
      nis: nextNis,
      name: '',
      className: 'VII-A',
      gender: 'L',
      parentName: '',
      phone: '',
      address: '',
      initialBalance: 0,
      goalTitle: 'Tabungan Kegiatan Sekolah',
      goalAmount: 500000,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      name: student.name,
      className: student.className,
      gender: student.gender,
      parentName: student.parentName,
      phone: student.phone,
      address: student.address,
      initialBalance: student.balance,
      goalTitle: student.savingsGoal?.title || '',
      goalAmount: student.savingsGoal?.targetAmount || 0,
    });
    setFormError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nis.trim()) {
      setFormError('Nama siswa dan NIS wajib diisi!');
      return;
    }

    // NIS uniqueness check
    const existing = students.find(
      (s) => s.nis.trim() === formData.nis.trim() && (!editingStudent || s.id !== editingStudent.id)
    );
    if (existing) {
      setFormError(`NIS "${formData.nis}" sudah digunakan oleh siswa ${existing.name}!`);
      return;
    }

    if (editingStudent) {
      // Update
      onUpdateStudent(editingStudent.id, {
        nis: formData.nis.trim(),
        name: formData.name.trim(),
        className: formData.className,
        gender: formData.gender,
        parentName: formData.parentName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        savingsGoal: formData.goalTitle.trim()
          ? {
              title: formData.goalTitle.trim(),
              targetAmount: Number(formData.goalAmount) || 0,
            }
          : undefined,
      });
      setEditingStudent(null);
    } else {
      // Add
      onAddStudent({
        nis: formData.nis.trim(),
        name: formData.name.trim(),
        className: formData.className,
        gender: formData.gender,
        parentName: formData.parentName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        balance: Math.max(0, Number(formData.initialBalance) || 0),
        savingsGoal: formData.goalTitle.trim()
          ? {
              title: formData.goalTitle.trim(),
              targetAmount: Number(formData.goalAmount) || 0,
            }
          : undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-700" />
              <span>Manajemen Data Siswa & Rombel</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola profil siswa, penetapan kelas, informasi wali murid, dan pantau saldo rekening siswa.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-6 pt-5 border-t border-slate-100">
          {/* Search Input */}
          <div className="sm:col-span-7 lg:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Nama Siswa, NIS, atau Nama Orang Tua..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          {/* Class Filter */}
          <div className="sm:col-span-5 lg:col-span-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 shrink-0">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Kelas:</span>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
            >
              <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
              {AVAILABLE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredStudents.length}</strong> dari{' '}
            <strong className="text-slate-900">{students.length}</strong> siswa
          </span>
          {selectedClass !== 'ALL' && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Filter: Kelas {selectedClass}
            </span>
          )}
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">Tidak ada data siswa ditemukan</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter kelas di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4">NIS & Nama Siswa</th>
                  <th className="py-3.5 px-4">Kelas & JK</th>
                  <th className="py-3.5 px-4 text-right">Saldo Tabungan</th>
                  <th className="py-3.5 px-4">Wali Murid / Kontak</th>
                  <th className="py-3.5 px-4">Target Menabung</th>
                  <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/40 transition-colors">
                    {/* NIS & Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        NIS: <span className="font-bold text-slate-800">{student.nis}</span>
                      </div>
                    </td>

                    {/* Class & Gender */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-md font-extrabold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                        Kelas {student.className}
                      </span>
                      <span className={`ml-1.5 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        student.gender === 'L'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {student.gender === 'L' ? 'Ikhwan (L)' : 'Akhwat (P)'}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-black text-emerald-700">
                        {formatRupiah(student.balance)}
                      </div>
                    </td>

                    {/* Parent & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-xs">
                        {student.parentName || '-'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        {student.phone && (
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {student.phone}
                          </span>
                        )}
                        {student.address && (
                          <span className="flex items-center gap-1 truncate max-w-[140px]" title={student.address}>
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {student.address}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Goal */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      {student.savingsGoal ? (
                        <div>
                          <p className="text-[11px] font-medium text-slate-700 truncate" title={student.savingsGoal.title}>
                            {student.savingsGoal.title}
                          </p>
                          <div className="text-[10px] text-emerald-800 font-bold">
                            Target: {formatRupiah(student.savingsGoal.targetAmount)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum diset</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        {/* Setor */}
                        <button
                          type="button"
                          onClick={() => onQuickTransaction('SETOR', student)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                          title={`Setor Tabungan untuk ${student.name}`}
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* Tarik */}
                        <button
                          type="button"
                          onClick={() => onQuickTransaction('TARIK', student)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                          title={`Tarik Tabungan untuk ${student.name}`}
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>

                        {/* Buku Tabungan / Mutasi */}
                        <button
                          type="button"
                          onClick={() => onViewPassbook(student)}
                          className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 transition cursor-pointer"
                          title={`Cetak / Buka Buku Tabungan ${student.name}`}
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(student)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeletingStudent(student)}
                          className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 border border-slate-200 transition cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIS (Nomor Induk) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="Contoh: 20240105"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas / Rombel *
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Contoh: Muhammad Ihsan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="L">Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="Nama ayah / ibu / wali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. HP / WhatsApp Wali
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
                {!editingStudent && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Setoran Awal (Rp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={formData.initialBalance || ''}
                      onChange={(e) => setFormData({ ...formData, initialBalance: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Tempat Tinggal
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Contoh: Desa Tambakboyo RT 03 / RW 01"
                />
              </div>

              {/* Target Tabungan */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Target Menabung Siswa (Opsional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.goalTitle}
                    onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                    className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-medium"
                    placeholder="Tujuan (cth: Study Tour)"
                  />
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={formData.goalAmount || ''}
                    onChange={(e) => setFormData({ ...formData, goalAmount: Number(e.target.value) })}
                    className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-700"
                    placeholder="Target Rp"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-12 h-12 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Konfirmasi Hapus Data Siswa
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Apakah Anda yakin ingin menghapus data siswa <strong className="text-slate-900">{deletingStudent.name}</strong> (NIS: {deletingStudent.nis})?
            </p>
            {deletingStudent.balance > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                ⚠️ Siswa ini masih memiliki saldo tabungan aktif sebesar{' '}
                <strong>{formatRupiah(deletingStudent.balance)}</strong>. Pastikan dana sudah diselesaikan sebelum menghapus.
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
