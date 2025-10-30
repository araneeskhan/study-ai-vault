import mongoose from 'mongoose';

const PdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'PDF title is required'],
    trim: true,
    minlength: [1, 'PDF title must be at least 1 character long'],
    maxlength: [200, 'PDF title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'PDF description cannot exceed 1000 characters'],
    default: '',
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative'],
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    default: 'application/pdf',
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: [
      'Academic',
      'Technology',
      'Business',
      'Science',
      'Mathematics',
      'History',
      'Literature',
      'Art & Design',
      'Engineering',
      'Medicine',
      'Law',
      'Philosophy',
      'Psychology',
      'Economics',
      'Programming',
      'Data Science',
      'Machine Learning',
      'Mobile Development',
      'Web Development',
      'DevOps',
      'Other'
    ],
  },
  subGenre: {
    type: String,
    trim: true,
    maxlength: [50, 'Sub-genre cannot exceed 50 characters'],
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader information is required'],
  },
  uploaderName: {
    type: String,
    required: [true, 'Uploader name is required'],
    trim: true,
  },
  uploaderAvatar: {
    type: String,
    default: '',
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative'],
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative'],
  },
  likeCount: {
    type: Number,
    default: 0,
    min: [0, 'Like count cannot be negative'],
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  language: {
    type: String,
    default: 'English',
    trim: true,
  },
  pageCount: {
    type: Number,
    min: [0, 'Page count cannot be negative'],
    default: null,
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters'],
    default: '',
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher cannot exceed 100 characters'],
    default: '',
  },
  publicationYear: {
    type: Number,
    min: [1000, 'Publication year must be valid'],
    max: [new Date().getFullYear(), 'Publication year cannot be in the future'],
    default: null,
  },
  isbn: {
    type: String,
    trim: true,
    match: [/^(?:\d{9}[\dXx]|\d{13})$/, 'Please enter a valid ISBN'],
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative'],
    },
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    review: {
      type: String,
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  metadata: {
    originalName: {
      type: String,
      required: true,
    },
    encoding: {
      type: String,
      default: '',
    },
    mimetype: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      default: 'pdf',
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted', 'pending'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Add compound indexes for better query performance
PdfSchema.index({ genre: 1, createdAt: -1 });
PdfSchema.index({ uploadedBy: 1, createdAt: -1 });
PdfSchema.index({ title: 'text', description: 'text', tags: 'text' });
PdfSchema.index({ isPublic: 1, isApproved: 1, status: 1 });
PdfSchema.index({ genre: 1, subGenre: 1, isPublic: 1, isApproved: 1 });
PdfSchema.index({ 'rating.average': -1, viewCount: -1 });

// Method to hide sensitive data
PdfSchema.methods.toJSON = function() {
  const pdfObject = this.toObject();
  // Remove file path for security
  delete pdfObject.filePath;
  return pdfObject;
};

// Method to increment view count
PdfSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment download count
PdfSchema.methods.incrementDownloadCount = async function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to add rating
PdfSchema.methods.addRating = async function(userId: string, rating: number, review?: string) {
  const existingRating = this.ratings.find((r: any) => r.user.toString() === userId);
  
  if (existingRating) {
    existingRating.rating = rating;
    if (review) existingRating.review = review;
    existingRating.createdAt = new Date();
  } else {
    this.ratings.push({
      user: userId,
      rating,
      review: review || '',
      createdAt: new Date(),
    });
  }

  // Recalculate average rating
  const totalRating = this.ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
  this.rating.average = totalRating / this.ratings.length;
  this.rating.count = this.ratings.length;

  return this.save();
};

// Method to toggle like
PdfSchema.methods.toggleLike = async function(userId: string) {
  const likeIndex = this.likedBy.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likedBy.splice(likeIndex, 1);
    this.likeCount -= 1;
  } else {
    this.likedBy.push(userId);
    this.likeCount += 1;
  }

  return this.save();
};

// Method to add comment
PdfSchema.methods.addComment = async function(userId: string, userName: string, userAvatar: string, content: string) {
  this.comments.push({
    user: userId,
    userName,
    userAvatar,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return this.save();
};

export default mongoose.models.Pdf || mongoose.model('Pdf', PdfSchema);