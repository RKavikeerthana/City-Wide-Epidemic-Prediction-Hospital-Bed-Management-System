# ML feature: admissions form -> LSTM forecast -> alerts

Copy these folders over the same paths in your project (replace when asked). No new npm packages.

NEW files
- backend/middleware/authStaff.js
- backend/controllers/admissionController.js
- backend/controllers/analysisController.js
- backend/routes/admissionRoute.js
- admin/src/pages/Admin/AdmissionsPage.jsx

REPLACED files
- backend/server.js              (mounts /api/admissions)
- backend/routes/lstmRoutes.js   (adds POST /api/lstm/analyze)
- backend/routes/alertRoute.js   (active alerts by default, ?all=true for admin)
- backend/models/LSTMModel.js    (epochs option, batch predict)
- backend/models/Admission.js, backend/models/alerts.js
- admin/src/App.jsx, admin/src/components/Sidebar.jsx
- admin/src/pages/Doctor/MLPage.jsx, admin/src/pages/Admin/AlertsPage.jsx

Then restart the backend (Ctrl+C, npm start). The admin app reloads by itself.

Demo: Admissions -> "Load sample data" -> ML Page -> "Run analysis & generate alerts" -> Alerts page.
