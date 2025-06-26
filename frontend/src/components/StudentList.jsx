import React from 'react';

function StudentList({ students }) {
  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Kelas</th>
          <th>Grade</th>
          <th>Parent</th>
          <th>Telepon</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.class_type}</td>
            <td>{s.grade}</td>
            <td>{s.parent_name}</td>
            <td>{s.phone_number}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StudentList;
