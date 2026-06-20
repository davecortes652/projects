const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../models/User');

// ─── @GET /api/admin/stats ───────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    // Count by role
    const roleCounts = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['role'],
      raw: true,
    });

    const counts = { admin: 0, doctor: 0, staff: 0, patient: 0 };
    roleCounts.forEach(r => { counts[r.role] = parseInt(r.count); });

    // New users last 7 days
    const newUsersWeek = await User.count({
      where: {
        created_at: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Registrations per day last 7 days
    const daily = await sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      { type: QueryTypes.SELECT }
    );

    // Users by role for pie chart
    const roleChart = Object.entries(counts).map(([role, count]) => ({ role, count }));

    return res.json({
      success: true,
      data: {
        totalUsers:    Object.values(counts).reduce((a, b) => a + b, 0),
        totalPatients: counts.patient,
        totalDoctors:  counts.doctor,
        totalStaff:    counts.staff,
        newUsersWeek,
        dailyRegistrations: daily,
        roleChart,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

// ─── @GET /api/admin/users ───────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const where = {};
    const { Op } = require('sequelize');

    if (role && role !== 'all') where.role = role;
    if (search) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: {
        users: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// ─── @PUT /api/admin/users/:id ───────────────────────────────────────────────
// Admin can edit any user's name, email, and (optionally) reset their password.
const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { Op } = require('sequelize');

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      }
      user.name = name.trim();
    }

    if (email !== undefined && email !== user.email) {
      const emailTaken = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (emailTaken) {
        return res.status(409).json({ success: false, message: 'Email already in use by another user.' });
      }
      user.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      user.password = password; // hashed by the beforeUpdate hook
    }

    await user.save();

    return res.json({ success: true, message: 'User updated.', user: user.toSafeObject() });
  } catch (error) {
    console.error('Update user error:', error);
    const message = error.name === 'SequelizeValidationError'
      ? error.errors?.[0]?.message
      : 'Failed to update user.';
    return res.status(400).json({ success: false, message: message || 'Failed to update user.' });
  }
};

// ─── @PUT /api/admin/users/:id/role ─────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'doctor', 'staff', 'patient'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    // If this user is no longer a doctor, drop the now-orphaned doctor profile.
    if (previousRole === 'doctor' && role !== 'doctor') {
      const DoctorProfile = require('../models/DoctorProfile');
      await DoctorProfile.destroy({ where: { user_id: user.id } });
    }

    return res.json({ success: true, message: 'Role updated.', user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update role.' });
  }
};

// ─── @PUT /api/admin/users/:id/toggle ───────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate yourself.' });
    }

    user.is_active = !user.is_active;
    await user.save();

    return res.json({
      success: true,
      message: `User ${user.is_active ? 'activated' : 'deactivated'}.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle status.' });
  }
};

// ─── @DELETE /api/admin/users/:id ───────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
    }
    await user.destroy();
    return res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

// ─── @POST /api/admin/users ──────────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role });
    return res.status(201).json({ success: true, message: 'User created.', user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

module.exports = { getStats, getUsers, updateUser, updateUserRole, toggleUserStatus, deleteUser, createUser };