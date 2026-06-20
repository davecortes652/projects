# 🏥 MediCare — Hospital/Clinic Management System

Full-stack capstone: React + Node/Express + MySQL with JWT role-based auth.

---

## Project structure

```
hospital-system/
├── client/          ← React front-end (Vite)
│   └── src/
│       ├── context/AuthContext.jsx    ← global auth state
│       ├── components/ProtectedRoute.jsx
│       ├── pages/LoginPage.jsx
│       ├── pages/RegisterPage.jsx
│       ├── pages/admin/ManageUsers.jsx       ← admin: view/add/edit/delete any user
│       ├── pages/admin/DoctorManagement.jsx  ← admin: doctor profiles (specialization, dept, phone)
│       ├── utils/api.js               ← Axios + JWT interceptor
│       └── App.jsx                    ← routes
└── server/          ← Express back-end
    ├── config/database.js             ← Sequelize + MySQL
    ├── models/User.js
    ├── models/DoctorProfile.js         ← 1:1 with User (role=doctor)
    ├── controllers/authController.js
    ├── controllers/adminController.js  ← users CRUD, role, status
    ├── controllers/doctorController.js ← doctor profiles CRUD
    ├── routes/auth.js
    ├── routes/admin.js                 ← /api/admin/users + /api/admin/doctors
    ├── middleware/auth.js              ← JWT protect + authorize
    └── index.js
```

---

## Quick start

### 1. Set up the database
```sql
CREATE DATABASE hospital_db;
```

### 2. Back-end
```bash
cd server
cp .env.example .env      # fill in DB credentials & JWT_SECRET
npm install
npm run dev               # runs on http://localhost:5000
```

### 3. Front-end
```bash
cd client
npm install
npm run dev               # runs on http://localhost:5173
```

---

## Auth API endpoints

| Method | Route                        | Access   | Description           |
|--------|------------------------------|----------|-----------------------|
| POST   | /api/auth/register           | Public   | Register (role=patient)|
| POST   | /api/auth/login              | Public   | Login → JWT token     |
| GET    | /api/auth/me                 | Protected| Get current user      |
| PUT    | /api/auth/change-password    | Protected| Change password       |

---

## Admin API endpoints

| Method | Route                       | Access | Description                                  |
|--------|-----------------------------|--------|-----------------------------------------------|
| GET    | /api/admin/stats            | Admin  | Dashboard stats                                |
| GET    | /api/admin/users            | Admin  | List/search/filter all users                   |
| POST   | /api/admin/users            | Admin  | Create a user (any role)                       |
| PUT    | /api/admin/users/:id        | Admin  | Edit any user — name, email, reset password    |
| PUT    | /api/admin/users/:id/role   | Admin  | Change a user's role                           |
| PUT    | /api/admin/users/:id/toggle | Admin  | Activate / deactivate a user                   |
| DELETE | /api/admin/users/:id        | Admin  | Delete a user                                  |
| GET    | /api/admin/doctors          | Admin  | List doctors with profiles                     |
| POST   | /api/admin/doctors          | Admin  | Create a doctor (user + profile)               |
| PUT    | /api/admin/doctors/:id      | Admin  | Edit doctor (profile + name/email/password)    |
| DELETE | /api/admin/doctors/:id      | Admin  | Remove a doctor                                |

---

## Roles & dashboards

| Role    | Dashboard route         |
|---------|------------------------|
| admin   | /dashboard/admin       |
| doctor  | /dashboard/doctor      |
| staff   | /dashboard/staff       |
| patient | /dashboard/patient     |

---

## Next modules to build
- [ ] Patient registration module
- [ ] Appointment scheduling
- [x] Doctor management — admins can add/edit/remove doctors (specialization, department, phone)
- [x] Admin can edit any user's name, email, and reset their password
- [ ] Medical records
- [ ] Billing & invoices
- [ ] Admin dashboard with charts
