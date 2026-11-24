# Locoheth repair patch 1 - what changed and why

Copy the files in this folder over the same paths in your project (backend\, frontend\, admin\).
Do NOT delete node_modules. Then make the two one-line .env edits listed at the bottom.

## Files changed
| File | Change | Why |
|---|---|---|
| backend/controllers/adminController.js | `jwt.sign(email + password, ...)` -> `jwt.sign({ email, role: 'admin' }, ...)` | The token was a plain string, but authAdmin.js reads `decoded.email`. Every admin API call returned 403. |
| backend/server.js | CORS now allows ports 5173 AND 5174 (localhost + 127.0.0.1); default port 5174 -> 4000; added `/api/lstm` (same router as `/api/ml`) and `/api/alerts` | Admin panel (localhost:5174) was blocked by CORS; the admin ML page calls /api/lstm/*; alerts routes were missing. |
| backend/routes/alertRoute.js (NEW) | `GET /api/alerts` returns documents from your existing `Alert` model | Admin Alerts page and patient navbar counter called a route that did not exist. No alert-generation logic was invented. |
| backend/models/LSTMModel.js | Model folder is now always `backend/lstm-model`; a training failure is re-thrown | The old path depended on the folder node was started from; failures were reported as "trained successfully". Architecture, loss, epochs untouched. |
| frontend/src/context/AppContext.jsx | fallback URL 5174 -> 4000 | 5174 is the admin panel, not the API. |
| frontend/src/components/Navbar.jsx | uses env URL (was hard-coded 5174); calls `/api/alerts` | Same reason; also it sent a patient token to an admin-only URL. |
| frontend/src/pages/AlertsPage.jsx | env URL; shows `diagnosis` or `disease` | Patient model field is `disease`. |
| admin/src/pages/Admin/AlertsPage.jsx | absolute backend URL; shows `condition` or `admissionReason` | Relative URL hit the Vite dev server; schema field is `admissionReason`. |

## Two manual .env edits (not shipped, to avoid overwriting your secrets)
1. frontend\.env      ->  VITE_BACKEND_URL='http://localhost:4000'      (was 5174)
2. backend\.env       ->  MONGODB_URI = "mongodb+srv://USER:PASSWORD@YOURNEWCLUSTER.mongodb.net"   (new Atlas cluster; no path, no ?options)

## After applying
Admin tokens saved in the browser before this fix are invalid: log out / clear localStorage in the admin panel and log in again.

## Patch 1.1 (follow-up fixes)
| File | Change | Why |
|---|---|---|
| verify-backend.ps1 | empty `[]` responses now report 0 | PowerShell unrolls `[]` to `$null`, and `@($null).Count` is 1, so "0 alerts" showed as "1 alert(s)". |
| backend/controllers/adminController.js | `addDoctor` returns "Image is required" when no file is sent | Previously threw a TypeError on `imageFile.path`. |
| frontend/src/components/Navbar.jsx | Alerts link added to mobile menu | It only existed in the desktop menu. |
