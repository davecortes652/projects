const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// ─── @GET /api/admin/doctors ─────────────────────────────────────────────────
const getDoctors = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const where = { role: 'doctor' };

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
      include: [{ model: DoctorProfile, as: 'doctorProfile' }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: {
        doctors: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch doctors.' });
  }
};

// ─── @POST /api/admin/doctors ────────────────────────────────────────────────
const createDoctor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, specialization, department, phone } = req.body;

    if (!name || !email || !password || !specialization || !department) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, specialization, and department are required.',
      });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      await t.rollback();
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create(
      { name, email, password, role: 'doctor' },
      { transaction: t }
    );
    const profile = await DoctorProfile.create(
      { user_id: user.id, specialization, department, phone: phone || null },
      { transaction: t }
    );

    await t.commit();

    const doctor = user.toSafeObject();
    doctor.doctorProfile = profile;
    return res.status(201).json({ success: true, message: 'Doctor created.', doctor });
  } catch (error) {
    await t.rollback();
    console.error('Create doctor error:', error);
    const message = error.name === 'SequelizeValidationError'
      ? error.errors?.[0]?.message
      : 'Failed to create doctor.';
    return res.status(400).json({ success: false, message: message || 'Failed to create doctor.' });
  }
};

// ─── @PUT /api/admin/doctors/:id ─────────────────────────────────────────────
const updateDoctor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, specialization, department, phone } = req.body;

    const user = await User.findOne({
      where: { id: req.params.id, role: 'doctor' },
      transaction: t,
    });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    if (email !== undefined && email !== user.email) {
      const emailTaken = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (emailTaken) {
        await t.rollback();
        return res.status(409).json({ success: false, message: 'Email already in use by another user.' });
      }
      user.email = email;
    }
    if (name !== undefined) {
      if (!name.trim()) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      }
      user.name = name.trim();
    }
    if (password) {
      if (password.length < 6) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      user.password = password; // hashed by the beforeUpdate hook
    }
    await user.save({ transaction: t });

    let profile = await DoctorProfile.findOne({ where: { user_id: user.id }, transaction: t });
    if (!profile) {
      if (!specialization || !department) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'This doctor has no profile yet — specialization and department are required.',
        });
      }
      profile = await DoctorProfile.create(
        { user_id: user.id, specialization, department, phone: phone || null },
        { transaction: t }
      );
    } else {
      if (specialization !== undefined) profile.specialization = specialization;
      if (department !== undefined) profile.department = department;
      if (phone !== undefined) profile.phone = phone;
      await profile.save({ transaction: t });
    }

    await t.commit();

    const doctor = user.toSafeObject();
    doctor.doctorProfile = profile;
    return res.json({ success: true, message: 'Doctor updated.', doctor });
  } catch (error) {
    await t.rollback();
    console.error('Update doctor error:', error);
    const message = error.name === 'SequelizeValidationError'
      ? error.errors?.[0]?.message
      : 'Failed to update doctor.';
    return res.status(400).json({ success: false, message: message || 'Failed to update doctor.' });
  }
};

// ─── @DELETE /api/admin/doctors/:id ──────────────────────────────────────────
const deleteDoctor = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'doctor' } });
    if (!user) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
    }

    await DoctorProfile.destroy({ where: { user_id: user.id } });
    await user.destroy();

    return res.json({ success: true, message: 'Doctor deleted.' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete doctor.' });
  }
};

module.exports = { getDoctors, createDoctor, updateDoctor, deleteDoctor };
