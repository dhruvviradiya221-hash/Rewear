# ReWear — Community Clothing Exchange

Full-stack web platform for swapping unused clothing via direct swap requests or a point-based redemption system.

## Stack

- **Frontend:** React (Create React App), React Router
- **Backend:** Node.js, Express, JSON file store (no native build tools required on Windows)
- **Auth:** JWT + bcrypt
- **Images:** Multer uploads served from `/uploads` (plus seeded high-res catalog photos)

## Run locally

### 1. Backend API (port 5000)

```bash
cd backend
npm install
npm start
```

### 2. Frontend (port 3000)

```bash
npm install
npm start
```

The CRA dev server proxies API requests to `http://localhost:5000`.

## Demo accounts (seeded on first API start)

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@rewear.com   | admin123  |
| User  | demo@rewear.com    | demo1234  |

## Features

- Email/password signup and login
- Landing page with CTAs and featured carousel
- Browse catalog with search and category filters
- Item detail with image gallery, uploader info, swap/redeem actions
- List items with multi-image upload (pending admin approval)
- User dashboard: profile, points, listings, ongoing/completed swaps
- Admin panel: approve/reject listings, remove items

## Production notes

Set `JWT_SECRET` in the backend environment. For production, point `REACT_APP_API_URL` at your deployed API host.
