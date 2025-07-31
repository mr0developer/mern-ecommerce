const mongoose = require('mongoose');
const User = require('./models/user');
const { ROLES } = require('./constants');
require('dotenv').config();

const promoteUserToAdmin = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB Connected!');

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }

    // Check if user is already admin
    if (user.role === ROLES.Admin) {
      console.log(`⚠️  User ${email} is already an admin.`);
      process.exit(0);
    }

    // Update user role to admin
    await User.findByIdAndUpdate(user._id, { role: ROLES.Admin });
    
    console.log(`✅ User ${email} has been promoted to admin successfully!`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`🔑 Role: ${ROLES.Admin}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('✓ Database connection closed!');
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address.');
  console.log('Usage: node promote-admin.js user@example.com');
  process.exit(1);
}

promoteUserToAdmin(email);
