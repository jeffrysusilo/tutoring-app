// src/pages/StudentsPage.jsx
import React, { useEffect, useState } from 'react';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    const res = await fetch('http://localhost:3000/students');
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = (newStudent) => {
    setStudents(prev => [...prev, newStudent]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Daftar Siswa</h2>
      <StudentForm onAdd={handleAdd} />
      {loading ? <p>Memuat data siswa...</p> : <StudentList students={students} />}
    </div>
  );
}

export default StudentsPage;
