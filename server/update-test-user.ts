import mongoose from 'mongoose';
import User from './models/User';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study-ai-vault';

async function updateTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and update the test user
    const updatedUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        $set: {
          avatar: 'https://via.placeholder.com/150',
          bio: 'This is a test user for development. I love reading books and exploring new genres!',
          location: 'Test City, TC',
          website: 'https://testuser.example.com',
          birthDate: new Date('1990-01-01'),
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
        }
      },
      { new: true } // Return the updated document
    );

    if (updatedUser) {
      console.log('Test user updated successfully!');
      console.log('Updated user data:', {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        readingStats: updatedUser.readingStats,
        favoriteGenres: updatedUser.favoriteGenres,
        profileCompletion: updatedUser.profileCompletion
      });
    } else {
      console.log('Test user not found');
    }

  } catch (error) {
    console.error('Error updating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  updateTestUser();
}

export default updateTestUser;