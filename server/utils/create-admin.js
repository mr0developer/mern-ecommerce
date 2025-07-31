const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const setupDB = require('./db');
const { ROLES } = require('../constants');
const User = require('../models/user');

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const firstName = args[2] || 'Admin';
const lastName = args[3] || 'User';

const createAdminUser = async () => {
  try {
    console.log(`${chalk.blue('✓')} ${chalk.blue('Creating admin user...')}`);

    if (!email || !password) {
      throw new Error('Missing email or password arguments');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === ROLES.Admin) {
        console.log(`${chalk.yellow('!')} ${chalk.yellow('Admin user already exists with this email.')}`);
        return;
      } else {
        // Promote existing user to admin
        await User.findByIdAndUpdate(existingUser._id, { role: ROLES.Admin });
        console.log(`${chalk.green('✓')} ${chalk.green('Existing user promoted to admin.')}`);
        return;
      }
    }

    // Create new admin user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: ROLES.Admin
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    
    await user.save();
    
    console.log(`${chalk.green('✓')} ${chalk.green('Admin user created successfully!')}`);
    console.log(`${chalk.cyan('📧 Email:')} ${email}`);
    console.log(`${chalk.cyan('👤 Name:')} ${firstName} ${lastName}`);
    console.log(`${chalk.cyan('🔑 Role:')} ${ROLES.Admin}`);
    
  } catch (error) {
    console.error(`${chalk.red('❌ Error:')} ${error.message}`);
  }
};

setupDB()
  .then(() => createAdminUser())
  .then(() => {
    console.log(`${chalk.green('✓')} ${chalk.green('Database connection closed!')}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${chalk.red('❌ Database connection failed:')} ${error.message}`);
    process.exit(1);
  });
