import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    avatar: String,
    phone: String,
    isBlocked: Boolean,
    isVerified: Boolean,
  },
  { timestamps: true },
);

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', UserSchema);

    const targetEmail = 'us8187934@gmail.com';

    // Find existing user by email
    const existingUser = await User.findOne({ email: targetEmail });
    if (!existingUser) {
      console.error(`❌ User with email "${targetEmail}" not found in database.`);
      console.error('   Please register this account first via the signup page, then run this seed again.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if already admin
    if (existingUser.role === 'admin') {
      console.log(`ℹ️  User "${targetEmail}" is already an admin.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update role to admin
    existingUser.role = 'admin';
    existingUser.isVerified = true;
    existingUser.isBlocked = false;
    await existingUser.save();

    console.log('✅ User promoted to admin successfully');
    console.log(`   Email: ${targetEmail}`);
    console.log(`   Role: admin`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
