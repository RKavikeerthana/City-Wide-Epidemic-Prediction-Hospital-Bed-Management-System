import React, { useState } from 'react';
import axios from 'axios';

const MLPage = () => {
  const [patientName, setPatientName] = useState('');
  const [admissionReason, setAdmissionReason] = useState('');
  const [region, setRegion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/doctor/admit-patient', {
        patientName,
        admissionReason,
        region,
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error submitting data', error);
    }
  };

  return (
    <div>
      <h1>ML Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Admission Reason"
          value={admissionReason}
          onChange={(e) => setAdmissionReason(e.target.value)}
        />
        <input
          type="text"
          placeholder="Region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default MLPage;
