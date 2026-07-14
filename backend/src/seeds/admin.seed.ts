import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
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

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@docapp.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@docapp.com',
      password: hashedPassword,
      role: 'admin',
      isBlocked: false,
      isVerified: true,
    });

    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@docapp.com');
    console.log('   Password: Admin123!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
