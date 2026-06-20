const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const DoctorProfile = sequelize.define('DoctorProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Specialization is required' },
    },
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Department is required' },
    },
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
}, {
  tableName: 'doctor_profiles',
  timestamps: true,
  underscored: true,
});

// ─── Associations ────────────────────────────────────────────────────────────
User.hasOne(DoctorProfile, { foreignKey: 'user_id', as: 'doctorProfile', onDelete: 'CASCADE' });
DoctorProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = DoctorProfile;
