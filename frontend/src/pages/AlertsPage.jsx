import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get((import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000') + '/api/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div>
      <h2>Patient List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Diagnosis</th>
            <th>Admission Date</th>
            <th>Discharge Date</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.gender}</td>
              <td>{patient.diagnosis || patient.disease}</td>
              <td>{new Date(patient.admissionDate).toLocaleDateString()}</td>
              <td>{patient.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;
