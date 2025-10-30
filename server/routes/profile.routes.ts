import express, { Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import User from '../models/User';

const router = express.Router();

// Get user profile
router.get('/users/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Check if the user is requesting their own profile or if it's public
    if (req.user.id !== userId) {
      const targetUser = await User.findById(userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
      
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check privacy settings
      if (targetUser.privacy.profileVisibility === 'private') {
        return res.status(403).json({ message: 'This profile is private' });
      }
      
      // Return limited data for non-private profiles
      const publicData = {
        _id: targetUser._id,
        fullName: targetUser.fullName,
        avatar: targetUser.avatar,
        bio: targetUser.bio,
        location: targetUser.location,
        favoriteGenres: targetUser.favoriteGenres,
        readingStats: targetUser.privacy.showReadingStats ? targetUser.readingStats : undefined,
        favoriteBooks: targetUser.privacy.showFavoriteBooks ? targetUser.favoriteBooks : undefined,
        profileCompletion: targetUser.profileCompletion,
        createdAt: targetUser.createdAt,
      };
      
      return res.json(publicData);
    }
    
    // User is requesting their own profile - return full data
    const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate profile completion
    user.calculateProfileCompletion();
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/users/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.email;
    delete updates.password;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.isEmailVerified;
    delete updates.verificationToken;
    delete updates.role;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update allowed fields
    const allowedFields = [
      'fullName', 'bio', 'location', 'website', 'birthDate',
      'favoriteGenres', 'favoriteBooks', 'privacy'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });
    
    // Calculate profile completion
    user.calculateProfileCompletion();
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload avatar
router.post('/users/avatar', authenticateToken, uploadMiddleware.single('avatar'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real app, you'd upload to a cloud service like AWS S3 or Cloudinary
    // For now, we'll store the file path
    user.avatar = req.file.path;
    
    // Calculate profile completion
    user.calculateProfileCompletion();
    
    await user.save();
    
    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: user.avatar
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Follow/Unfollow user
router.post('/users/:id/follow', authenticateToken, async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);
    
    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id: string) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id: string) => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }
    
    await currentUser.save();
    await targetUser.save();
    
    res.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's followers
router.get('/users/:id/followers', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .populate('followers', 'fullName avatar bio')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get users that the user is following
router.get('/users/:id/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .populate('following', 'fullName avatar bio')
      .select('following');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update reading statistics
router.put('/users/reading-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { booksRead, pagesRead, readingStreak } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update reading stats
    if (booksRead !== undefined) user.readingStats.booksRead = booksRead;
    if (pagesRead !== undefined) user.readingStats.pagesRead = pagesRead;
    if (readingStreak !== undefined) user.readingStats.readingStreak = readingStreak;
    
    user.readingStats.lastReadDate = new Date();
    
    await user.save();
    
    res.json({
      message: 'Reading statistics updated successfully',
      readingStats: user.readingStats
    });
  } catch (error) {
    console.error('Error updating reading stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;