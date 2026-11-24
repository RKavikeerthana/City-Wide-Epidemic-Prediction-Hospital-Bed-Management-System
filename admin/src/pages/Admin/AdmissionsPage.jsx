import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import { DoctorContext } from '../../context/DoctorContext'

const todayString = () => new Date().toISOString().slice(0, 10)

const AdmissionsPage = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  const headers = aToken ? { Authorization: `Bearer ${aToken}` } : { dtoken: dToken }

  const [form, setForm] = useState({
    patientName: '',
    admissionReason: '',
    region: '',
    admissionDate: todayString(),
  })
  const [admissions, setAdmissions] = useState([])
  const [total, setTotal] = useState(0)
  const [sampleCount, setSampleCount] = useState(0)
  const [busy, setBusy] = useState(false)

  const errorText = (error) => error.response?.data?.message || error.message

  const loadAdmissions = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admissions`, { headers })
      if (data.success) {
        setAdmissions(data.admissions)
        setTotal(data.total)
        setSampleCount(data.sampleCount)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(errorText(error))
    }
  }

  useEffect(() => {
    loadAdmissions()
  }, [])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/admissions`, form, { headers })
      if (data.success) {
        toast.success(data.message)
        setForm((f) => ({ ...f, patientName: '' }))
        loadAdmissions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(errorText(error))
    } finally {
      setBusy(false)
    }
  }

  const loadSample = async () => {
    setBusy(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/admissions/sample`, {}, { headers })
      data.success ? toast.success(data.message) : toast.error(data.message)
      loadAdmissions()
    } catch (error) {
      toast.error(errorText(error))
    } finally {
      setBusy(false)
    }
  }

  const clearSample = async () => {
    if (!window.confirm('Remove all sample admissions? Records you entered yourself are kept.')) return
    setBusy(true)
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admissions/sample`, { headers })
      data.success ? toast.success(data.message) : toast.error(data.message)
      loadAdmissions()
    } catch (error) {
      toast.error(errorText(error))
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'border border-[#DADADA] rounded w-full p-2 mt-1'

  return (
    <div className='m-5 w-full max-w-5xl'>
      <p className='mb-3 text-lg font-medium'>Patient Admissions</p>
      <p className='text-sm text-gray-600 mb-4'>
        Record admissions here. The ML page uses them to forecast admissions and raise alerts.
      </p>

      <form onSubmit={submit} className='bg-white border rounded p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#5E5E5E]'>
        <div>
          <p>Patient name</p>
          <input className={inputClass} value={form.patientName} onChange={update('patientName')} required maxLength={100} />
        </div>
        <div>
          <p>Condition / disease</p>
          <input className={inputClass} value={form.admissionReason} onChange={update('admissionReason')} placeholder='e.g. Dengue' required maxLength={100} />
        </div>
        <div>
          <p>Region</p>
          <input className={inputClass} value={form.region} onChange={update('region')} placeholder='e.g. Chennai' required maxLength={100} />
        </div>
        <div>
          <p>Admission date</p>
          <input className={inputClass} type='date' value={form.admissionDate} max={todayString()} onChange={update('admissionDate')} required />
        </div>
        <div className='sm:col-span-2 flex flex-wrap gap-3 items-center'>
          <button disabled={busy} className='bg-primary text-white px-8 py-2 rounded-full disabled:opacity-60'>
            Add admission
          </button>
          <button type='button' onClick={loadSample} disabled={busy} className='border border-primary text-primary px-6 py-2 rounded-full disabled:opacity-60'>
            Load sample data (demo)
          </button>
          {sampleCount > 0 && (
            <button type='button' onClick={clearSample} disabled={busy} className='border border-red-400 text-red-500 px-6 py-2 rounded-full disabled:opacity-60'>
              Clear sample data
            </button>
          )}
        </div>
      </form>

      <p className='mt-6 mb-2 text-sm text-gray-600'>
        {total} admission(s) in total{sampleCount > 0 ? `, ${sampleCount} of them sample data` : ''}. Showing the latest {admissions.length}.
      </p>

      <div className='bg-white border rounded text-sm max-h-[50vh] overflow-y-auto'>
        <div className='grid grid-cols-[1fr_2fr_1.5fr_1.5fr] gap-2 py-3 px-6 border-b font-medium sticky top-0 bg-white'>
          <p>Date</p>
          <p>Patient</p>
          <p>Condition</p>
          <p>Region</p>
        </div>
        {admissions.length === 0 && <p className='p-6 text-gray-500'>No admissions yet.</p>}
        {admissions.map((a) => (
          <div key={a._id} className='grid grid-cols-[1fr_2fr_1.5fr_1.5fr] gap-2 items-center py-3 px-6 border-b text-gray-600'>
            <p>{new Date(a.createdAt).toISOString().slice(0, 10)}</p>
            <p>
              {a.patientName}
              {a.isSample && <span className='ml-2 text-xs text-gray-400'>(sample)</span>}
            </p>
            <p>{a.admissionReason}</p>
            <p>{a.region}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdmissionsPage
