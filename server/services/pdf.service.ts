import Pdf from '../models/Pdf';
import User from '../models/User';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Types } from 'mongoose';

interface PDFDocument {
  _id: Types.ObjectId;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  genre: string;
  subGenre?: string;
  tags: string[];
  uploadedBy: Types.ObjectId;
  uploaderName: string;
  uploaderAvatar: string;
  downloadCount: number;
  viewCount: number;
  likeCount: number;
  likedBy: Types.ObjectId[];
  isPublic: boolean;
  isApproved: boolean;
  language: string;
  pageCount?: number;
  author?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  coverImage: string;
  rating: {
    average: number;
    count: number;
  };
  ratings: Array<{
    user: Types.ObjectId;
    rating: number;
    review?: string;
    createdAt: Date;
  }>;
  comments: Array<{
    user: Types.ObjectId;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  metadata: {
    originalName: string;
    encoding?: string;
    mimetype: string;
    extension: string;
  };
  status: 'active' | 'inactive' | 'deleted' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter to only allow PDFs
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export class PdfService {
  /**
   * Upload a new PDF
   */
  static async uploadPdf(file: Express.Multer.File, pdfData: any, userId: string) {
    try {
      // Get user information
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create PDF document
      const pdf = new Pdf({
        title: pdfData.title,
        description: pdfData.description || '',
        fileName: file.filename,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        genre: pdfData.genre,
        subGenre: pdfData.subGenre || '',
        tags: pdfData.tags || [],
        uploadedBy: userId,
        uploaderName: user.fullName,
        uploaderAvatar: user.avatar || '',
        author: pdfData.author || '',
        publisher: pdfData.publisher || '',
        publicationYear: pdfData.publicationYear || null,
        isbn: pdfData.isbn || '',
        language: pdfData.language || 'English',
        pageCount: pdfData.pageCount || null,
        isPublic: pdfData.isPublic !== undefined ? pdfData.isPublic : true,
        metadata: {
          originalName: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          extension: path.extname(file.originalname).slice(1),
        },
      });

      await pdf.save();

      return {
        success: true,
        message: 'PDF uploaded successfully',
        pdf: await this.getPdfById(pdf._id.toString()),
      };
    } catch (error) {
      // Clean up uploaded file if document creation fails
      if (file && file.path) {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      throw error;
    }
  }

  /**
   * Get all PDFs with filtering and pagination
   */
  static async getPdfs(filters: any = {}, options: any = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      genre,
      subGenre,
      search,
      uploader,
      language,
      minRating,
      maxRating,
    } = options;

    // Build query
    const query: any = {
      isPublic: true,
      isApproved: true,
      status: 'active',
    };

    // Apply filters
    if (genre) query.genre = genre;
    if (subGenre) query.subGenre = new RegExp(subGenre, 'i');
    if (language) query.language = language;
    if (uploader) query.uploadedBy = uploader;

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    // Rating filter
    if (minRating || maxRating) {
      query['rating.average'] = {};
      if (minRating) query['rating.average'].$gte = minRating;
      if (maxRating) query['rating.average'].$lte = maxRating;
    }

    // Sort configuration
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [pdfs, total] = await Promise.all([
      Pdf.find(query)
        .populate('uploadedBy', 'fullName avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Pdf.countDocuments(query),
    ]);

    return {
      success: true,
      pdfs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get PDF by ID
   */
  static async getPdfById(pdfId: string, userId?: string) {
    const pdf = await Pdf.findById(pdfId)
      .populate('uploadedBy', 'fullName avatar')
      .populate('ratings.user', 'fullName avatar')
      .populate('comments.user', 'fullName avatar')
      .lean() as PDFDocument;

    if (!pdf) {
      throw new Error('PDF not found');
    }

    // Check if user has liked this PDF
    const isLiked = userId && pdf.likedBy ? pdf.likedBy.includes(userId as any) : false;

    return {
      ...pdf,
      isLiked,
    };
  }

  /**
   * Get PDFs uploaded by a specific user
   */
  static async getUserPdfs(userId: string, options: any = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const query = { uploadedBy: userId };
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [pdfs, total] = await Promise.all([
      Pdf.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'fullName avatar')
        .lean() as Promise<PDFDocument[]>,
      Pdf.countDocuments(query),
    ]);

    return {
      success: true,
      pdfs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(pdfId: string) {
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    pdf.viewCount += 1;
    await pdf.save();

    return { success: true, viewCount: pdf.viewCount };
  }

  /**
   * Download PDF (returns file path and increments download count)
   */
  static async downloadPdf(pdfId: string) {
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    if (!fs.existsSync(pdf.filePath)) {
      throw new Error('PDF file not found on disk');
    }

    // Increment download count
    pdf.downloadCount += 1;
    await pdf.save();

    return {
      success: true,
      filePath: pdf.filePath,
      fileName: pdf.fileName,
      originalName: pdf.metadata.originalName,
      downloadCount: pdf.downloadCount,
    };
  }

  /**
   * Toggle like on PDF
   */
  static async toggleLike(pdfId: string, userId: string) {
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    const likeIndex = pdf.likedBy ? pdf.likedBy.indexOf(userId as any) : -1;
    let isLiked;

    if (likeIndex > -1) {
      pdf.likedBy.splice(likeIndex, 1);
      pdf.likeCount -= 1;
      isLiked = false;
    } else {
      if (!pdf.likedBy) {
        pdf.likedBy = [];
      }
      pdf.likedBy.push(userId as any);
      pdf.likeCount += 1;
      isLiked = true;
    }

    await pdf.save();

    return {
      success: true,
      isLiked,
      likeCount: pdf.likeCount,
    };
  }

  /**
   * Add rating to PDF
   */
  static async addRating(pdfId: string, userId: string, rating: number, review?: string) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    await pdf.addRating(userId, rating, review);

    return {
      success: true,
      message: 'Rating added successfully',
      rating: pdf.rating,
    };
  }

  /**
   * Add comment to PDF
   */
  static async addComment(pdfId: string, userId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await pdf.addComment(userId, user.fullName, user.avatar || '', content.trim());

    return {
      success: true,
      message: 'Comment added successfully',
      comment: pdf.comments[pdf.comments.length - 1],
    };
  }

  /**
   * Delete PDF (soft delete)
   */
  static async deletePdf(pdfId: string, userId: string) {
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      throw new Error('PDF not found');
    }

    // Check if user is the uploader or admin
    if (pdf.uploadedBy.toString() !== userId) {
      const user = await User.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized to delete this PDF');
      }
    }

    // Soft delete
    pdf.status = 'deleted';
    await pdf.save();

    return {
      success: true,
      message: 'PDF deleted successfully',
    };
  }

  /**
   * Get available genres
   */
  static getGenres() {
    return [
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
    ];
  }

  /**
   * Get PDF statistics
   */
  static async getStatistics() {
    const stats = await Pdf.aggregate([
      {
        $match: {
          isPublic: true,
          isApproved: true,
          status: 'active',
        },
      },
      {
        $group: {
          _id: null,
          totalPdfs: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          totalDownloads: { $sum: '$downloadCount' },
          totalLikes: { $sum: '$likeCount' },
          averageRating: { $avg: '$rating.average' },
        },
      },
    ]);

    const genreStats = await Pdf.aggregate([
      {
        $match: {
          isPublic: true,
          isApproved: true,
          status: 'active',
        },
      },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return {
      success: true,
      statistics: stats[0] || {
        totalPdfs: 0,
        totalViews: 0,
        totalDownloads: 0,
        totalLikes: 0,
        averageRating: 0,
      },
      genreDistribution: genreStats,
    };
  }
}