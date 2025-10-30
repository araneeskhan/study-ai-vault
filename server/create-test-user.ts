import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study-ai-vault';

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', {
        id: existingUser._id,
        email: existingUser.email,
        fullName: existingUser.fullName
      });
      return;
    }

    // Create test user with complete profile data
    const testUser = new User({
      fullName: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://via.placeholder.com/150',
      bio: 'This is a test user for development. I love reading books and exploring new genres!',
      location: 'Test City, TC',
      website: 'https://testuser.example.com',
      birthDate: new Date('1990-01-01'),
      isEmailVerified: true,
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true
        }
      },
      // Add additional profile fields that the frontend expects
      readingStats: {
        booksRead: 15,
        pagesRead: 3200,
        readingStreak: 7
      },
      favoriteGenres: ['Fiction', 'Science Fiction', 'Mystery', 'Fantasy'],
      favoriteBooks: [
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '978-0-7432-7356-5'
        },
        {
          title: '1984',
          author: 'George Orwell',
          isbn: '978-0-452-28423-4'
        }
      ],
      privacy: {
        profileVisible: true,
        showReadingStats: true,
        showFavoriteBooks: true
      },
      profileCompletion: 85
    });

    // Save user
    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Login credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('User ID:', testUser._id);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createTestUser();
}

export default createTestUser;