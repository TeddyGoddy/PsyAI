const { sequelize } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
  try {
    console.log('🔄 Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create tables
    await sequelize.sync({ force: true }); // force: true will drop existing tables
    console.log('✅ Database tables created');
    
    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const demoUser = await User.create({
      email: 'demo@psyai.com',
      password_hash: hashedPassword,
      first_name: 'Demo',
      last_name: 'User',
      user_type: 'psychologist',
      license_number: 'PSY-DEMO-123',
      specializations: ['Anxiety Disorders', 'CBT'],
      years_experience: 5
    });
    
    console.log('✅ Demo user created:', demoUser.email);
    
    // Create demo patient
    const demoPatient = await User.create({
      email: 'paziente@demo.com',
      password_hash: hashedPassword,
      first_name: 'Anna',
      last_name: 'Bianchi',
      user_type: 'patient'
    });
    
    console.log('✅ Demo patient created:', demoPatient.email);
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📝 Login credentials:');
    console.log('   Psychologist: demo@psyai.com / password123');
    console.log('   Patient: paziente@demo.com / password123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await sequelize.close();
  }
};

setupDatabase();
