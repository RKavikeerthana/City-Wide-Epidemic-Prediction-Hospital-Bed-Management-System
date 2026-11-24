import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([])
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/alerts?all=true`)
        const data = response.data

        if (Array.isArray(data)) {
          setAlerts(data)
          const active = data.filter((a) => a.active).length
          if (active > 0) {
            toast.info(`${active} active alert(s)`)
          }
        } else {
          console.error('Expected an array of alerts')
        }
      } catch (error) {
        console.error('Error fetching alert data:', error)
      }
    }

    fetchAlerts()
  }, [backendUrl])

  return (
    <div className='m-5 w-full max-w-5xl'>
      <p className='mb-3 text-lg font-medium'>Alerts</p>
      <p className='text-sm text-gray-600 mb-4'>
        Alerts are created by the ML Page analysis from recorded patient admissions.
      </p>
      {alerts.length > 0 ? (
        alerts.map((alert) => (
          <div key={alert._id} className='border bg-white p-4 my-2 rounded shadow-sm text-sm'>
            <p><strong>Region:</strong> {alert.region}</p>
            <p><strong>Condition:</strong> {alert.condition || alert.admissionReason}</p>
            <p><strong>Predicted admissions (next day):</strong> {alert.count}</p>
            {alert.recentAverage !== undefined && (
              <p><strong>7-day average:</strong> {alert.recentAverage} per day</p>
            )}
            <p>
              <strong>Status:</strong>{' '}
              <span className={alert.active ? 'text-red-600 font-medium' : 'text-gray-500'}>
                {alert.active ? 'Active' : 'Inactive'}
              </span>
            </p>
            {alert.updatedAt && (
              <p className='text-gray-500'>Updated {new Date(alert.updatedAt).toLocaleString()}</p>
            )}
          </div>
        ))
      ) : (
        <p>No alerts currently. Add admissions, then run the analysis on the ML Page.</p>
      )}
    </div>
  )
}

export default AlertsPage
