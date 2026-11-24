# City-Wide Epidemic Prediction & Hospital Bed Management System

A full-stack healthcare application containing a patient-facing frontend, an administration dashboard, and a Node.js/Express backend. The project includes hospital/doctor/appointment workflows and an LSTM-based admission/epidemic analysis feature with alerts.

## Project structure

- `frontend/` – patient-facing React application (Vite)
- `admin/` – admin dashboard React application (Vite)
- `backend/` – Express API, MongoDB models, authentication, and ML/LSTM functionality
- `APPLY.md`, `CHANGES.md` – implementation notes included with the source

## Requirements

- Node.js and npm
- MongoDB connection string
- Cloudinary credentials for image uploads
- Payment provider credentials if payment features are used

## Setup

Create environment files from the examples and fill in your own credentials. Never commit real `.env` files.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

### Patient frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Admin dashboard

```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed. Update `VITE_BACKEND_URL` to match the backend URL/port configured in your environment.

## Security note

Real environment files and installed `node_modules` directories are intentionally excluded from this repository package. Add your own credentials locally using the `.env.example` templates.
