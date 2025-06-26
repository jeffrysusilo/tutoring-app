import React, { useState } from 'react';

function StudentForm({ onAdd }) {
  const [form, setForm] = useState({
    name: '',
    birthday: '',
    grade: '',
    class_type: 'private',
    parent_name: '',
    phone_number: '',
    alt_number: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        onAdd(data);
        setForm({ name: '', birthday: '', grade: '', class_type: 'private', parent_name: '', phone_number: '', alt_number: '', notes: '' });
      } else {
        alert(data.error || 'Gagal menambah siswa');
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h3>➕ Tambah Siswa</h3>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Nama" required /><br />
      <input name="birthday" value={form.birthday} onChange={handleChange} placeholder="Tanggal Lahir (YYYY-MM-DD)" /><br />
      <input name="grade" value={form.grade} onChange={handleChange} placeholder="Grade" /><br />
      <select name="class_type" value={form.class_type} onChange={handleChange}>
        <option value="private">Private</option>
        <option value="group">Group</option>
      </select><br />
      <input name="parent_name" value={form.parent_name} onChange={handleChange} placeholder="Nama Orang Tua" /><br />
      <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="No. HP" /><br />
      <input name="alt_number" value={form.alt_number} onChange={handleChange} placeholder="No. Alternatif" /><br />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan" /><br />
      <button type="submit">Simpan</button>
    </form>
  );
}

export default StudentForm;
