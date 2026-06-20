const express = require('express');
const { adminOnly } = require('../middleware/auth');
const {
  getStats, getUsers, updateUser, updateUserRole,
  toggleUserStatus, deleteUser, createUser,
} = require('../controllers/adminController');
const {
  getDoctors, createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/doctorController');

const router = express.Router();

// All routes require admin role
router.use(adminOnly);

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', getStats);

// ─── Users (generic — any role) ──────────────────────────────────────────────
router.get('/users',            getUsers);
router.post('/users',           createUser);
router.put('/users/:id',        updateUser);
router.put('/users/:id/role',   updateUserRole);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id',     deleteUser);

// ─── Doctors (role=doctor + profile fields) ──────────────────────────────────
router.get('/doctors',        getDoctors);
router.post('/doctors',       createDoctor);
router.put('/doctors/:id',    updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

module.exports = router;
