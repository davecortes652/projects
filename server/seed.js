require('dotenv').config();
const { connectDB } = require('./config/database');
const User = require('./models/User');
const DoctorProfile = require('./models/DoctorProfile');

const demoUsers = [
  { name: 'Admin User',   email: 'admin@clinic.com',   password: 'password123', role: 'admin'   },
  { name: 'Dr. Demo',     email: 'doctor@clinic.com',  password: 'password123', role: 'doctor'  },
  { name: 'Staff Demo',   email: 'staff@clinic.com',   password: 'password123', role: 'staff'   },
  { name: 'Patient Demo', email: 'patient@clinic.com', password: 'password123', role: 'patient' },
];

const seed = async () => {
  await connectDB();

  for (const u of demoUsers) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (existing) {
      console.log(`⏭  ${u.email} already exists, skipping.`);
      continue;
    }
    const created = await User.create(u);
    console.log(`✅ Created ${u.role}: ${u.email}`);

    if (u.role === 'doctor') {
      await DoctorProfile.create({
        user_id: created.id,
        specialization: 'General Medicine',
        department: 'Outpatient',
        phone: '+63 900 000 0000',
      });
      console.log('   ↳ Added demo doctor profile');
    }
  }

  console.log('\nDone seeding demo accounts.');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});