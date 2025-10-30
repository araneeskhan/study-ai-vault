import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [50, 'Full name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  avatar: {
    type: String,
    default: '',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: '',
  },
  resetPasswordToken: {
    type: String,
    default: '',
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
  },
  // Profile fields
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  location: {
    type: String,
    default: '',
    maxlength: [100, 'Location cannot exceed 100 characters'],
  },
  website: {
    type: String,
    default: '',
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL'],
  },
  birthDate: {
    type: Date,
    default: null,
  },
  readingStats: {
    booksRead: {
      type: Number,
      default: 0,
      min: [0, 'Books read cannot be negative'],
    },
    pagesRead: {
      type: Number,
      default: 0,
      min: [0, 'Pages read cannot be negative'],
    },
    readingStreak: {
      type: Number,
      default: 0,
      min: [0, 'Reading streak cannot be negative'],
    },
  },
  favoriteGenres: [{
    type: String,
    trim: true,
  }],
  favoriteBooks: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
  }],
  privacy: {
    profileVisible: {
      type: Boolean,
      default: true,
    },
    showReadingStats: {
      type: Boolean,
      default: true,
    },
    showFavoriteBooks: {
      type: Boolean,
      default: true,
    },
  },
  profileCompletion: {
    type: Number,
    default: 0,
    min: [0, 'Profile completion cannot be negative'],
    max: [100, 'Profile completion cannot exceed 100'],
  },
}, {
  timestamps: true,
});

// Add compound index for email and isActive
UserSchema.index({ email: 1, isActive: 1 });

// Add text index for full name search
UserSchema.index({ fullName: 'text' });

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Method to hide sensitive data
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);