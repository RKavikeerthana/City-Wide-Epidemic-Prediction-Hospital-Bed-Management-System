import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import { DoctorContext } from '../../context/DoctorContext'

const MLPage = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  const headers = aToken ? { Authorization: `Bearer ${aToken}` } : { dtoken: dToken }

  // ----- Run analysis on real admission data -----
  const [threshold, setThreshold] = useState(5)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const runAnalysis = async () => {
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/lstm/analyze`,
        { threshold: Number(threshold) },
        { headers }
      )
      if (data.success) {
        setAnalysis(data)
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setAnalyzing(false)
    }
  }

  // ----- Developer tools (original demo) -----
  const [trainingStatus, setTrainingStatus] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrainModel = async () => {
    if (!window.confirm('This replaces the saved model with a tiny 2-sample demo model. Run the analysis again afterwards to retrain on real data. Continue?')) return
    setLoading(true)
    try {
      const response = await axios.post(`${backendUrl}/api/lstm/train`, {
        inputs: [
          [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
        ],
        outputs: [1, 0],
      })
      setTrainingStatus(response.data.message)
    } catch (error) {
      console.error('Error training model:', error)
      setTrainingStatus('Error training model')
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    setLoading(true)
    try {
      const inputArray = input.split(',').map(Number)
      if (inputArray.length !== 10 || inputArray.some(isNaN)) {
        alert('Please enter exactly 10 valid numbers, separated by commas.')
        setLoading(false)
        return
      }
      const response = await axios.post(`${backendUrl}/api/lstm/predict`, { input: inputArray })
      setPrediction(JSON.stringify(response.data.prediction))
    } catch (error) {
      console.error('Error making prediction:', error)
      setPrediction('Error making prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='m-5 w-full max-w-5xl text-sm text-[#5E5E5E]'>
      <h1 className='text-lg font-medium mb-1'>Machine Learning Analysis</h1>
      <p className='mb-4 text-gray-600'>
        Reads the admissions you recorded, learns each region and condition's daily pattern with an LSTM,
        forecasts tomorrow's admissions, and raises an alert when the forecast (or the last 3 days) reaches the
        threshold. Needs at least 12 days of history.
      </p>

      <div className='bg-white border rounded p-5'>
        <div className='flex flex-wrap items-end gap-4'>
          <div>
            <p>Alert threshold (admissions per day)</p>
            <input
              type='number'
              min='1'
              step='1'
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className='border border-[#DADADA] rounded p-2 mt-1 w-40'
            />
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className='bg-primary text-white px-8 py-2 rounded-full disabled:opacity-60'
          >
            {analyzing ? 'Training and analysing... (can take up to a minute)' : 'Run analysis & generate alerts'}
          </button>
        </div>

        {analysis && (
          <div className='mt-5'>
            <p className='text-gray-600 mb-3'>
              {analysis.summary.admissionsAnalyzed} admissions over {analysis.summary.daysOfHistory} days,{' '}
              {analysis.summary.groups} region/condition group(s), {analysis.summary.trainingSamples} training
              windows, {analysis.summary.epochs} epochs. Threshold: {analysis.summary.threshold}/day.
            </p>
            <div className='border rounded overflow-x-auto'>
              <div className='grid grid-cols-[1.4fr_1.4fr_1fr_1.2fr_1.3fr] gap-2 py-3 px-5 border-b font-medium min-w-[640px]'>
                <p>Region</p>
                <p>Condition</p>
                <p>7-day avg</p>
                <p>Forecast (next day)</p>
                <p>Status</p>
              </div>
              {analysis.results.map((r) => (
                <div key={`${r.region}-${r.condition}`} className='grid grid-cols-[1.4fr_1.4fr_1fr_1.2fr_1.3fr] gap-2 items-center py-3 px-5 border-b min-w-[640px]'>
                  <p>{r.region}</p>
                  <p>{r.condition}</p>
                  <p>{r.recentAverage}</p>
                  <p>{r.predicted}</p>
                  <p className={r.alert ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {r.alert ? `ALERT (${r.trigger})` : 'Normal'}
                  </p>
                </div>
              ))}
            </div>
            <p className='mt-3 text-gray-500'>
              Alerts were saved. See them on the Alerts page (admin panel) and in the patient site's navbar.
            </p>
          </div>
        )}
      </div>

      <details className='mt-6 bg-white border rounded p-5'>
        <summary className='cursor-pointer font-medium'>Developer tools (demo model)</summary>
        <div className='my-4'>
          <button onClick={handleTrainModel} className='bg-primary text-white p-2 rounded' disabled={loading}>
            {loading ? 'Working...' : 'Train demo model'}
          </button>
          {trainingStatus && <h3 className='mt-2'>Status: {trainingStatus}</h3>}
        </div>
        <div className='my-4'>
          <h2 className='mb-2'>Predict from 10 comma-separated values (0 to 1)</h2>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0'
            className='p-2 border rounded w-full max-w-md'
          />
          <button onClick={handlePredict} className='bg-secondary text-white p-2 rounded ml-2' disabled={loading}>
            Predict
          </button>
          {prediction !== null && <h3 className='mt-3'>Prediction result: {prediction}</h3>}
        </div>
      </details>
    </div>
  )
}

export default MLPage
