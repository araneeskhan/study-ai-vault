import express from 'express';
import { PdfService, upload } from '../services/pdf.service';
import { AuthService } from '../services/auth.service';

const router = express.Router();

/**
 * Middleware to authenticate requests
 */
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

/**
 * @route   POST /api/pdfs/upload
 * @desc    Upload a new PDF
 * @access  Private
 */
router.post('/upload', authenticate, upload.single('pdf'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided',
      });
    }

    const pdfData = {
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      subGenre: req.body.subGenre,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      author: req.body.author,
      publisher: req.body.publisher,
      publicationYear: req.body.publicationYear ? parseInt(req.body.publicationYear) : null,
      isbn: req.body.isbn,
      language: req.body.language,
      pageCount: req.body.pageCount ? parseInt(req.body.pageCount) : null,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic === 'true' : true,
    };

    // Validate required fields
    if (!pdfData.title || !pdfData.genre) {
      // Clean up uploaded file
      if (req.file && req.file.path) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err: any) => {
          if (err) console.error('Error deleting file:', err);
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Title and genre are required',
      });
    }

    const result = await PdfService.uploadPdf(req.file, pdfData, req.user._id);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('PDF upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload PDF',
    });
  }
});

/**
 * @route   GET /api/pdfs
 * @desc    Get all public PDFs with filtering and pagination
 * @access  Public
 */
router.get('/', async (req: any, res: any) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      genre: req.query.genre,
      subGenre: req.query.subGenre,
      search: req.query.search,
      language: req.query.language,
      minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
      maxRating: req.query.maxRating ? parseFloat(req.query.maxRating) : undefined,
    };

    const result = await PdfService.getPdfs({}, options);
    res.json(result);
  } catch (error: any) {
    console.error('Get PDFs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch PDFs',
    });
  }
});

/**
 * @route   GET /api/pdfs/user/:userId
 * @desc    Get PDFs uploaded by a specific user
 * @access  Public
 */
router.get('/user/:userId', async (req: any, res: any) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await PdfService.getUserPdfs(req.params.userId, options);
    res.json(result);
  } catch (error: any) {
    console.error('Get user PDFs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user PDFs',
    });
  }
});

/**
 * @route   GET /api/pdfs/my-pdfs
 * @desc    Get current user's uploaded PDFs
 * @access  Private
 */
router.get('/my-pdfs', authenticate, async (req: any, res: any) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await PdfService.getUserPdfs(req.user._id, options);
    res.json(result);
  } catch (error: any) {
    console.error('Get my PDFs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user PDFs',
    });
  }
});

/**
 * @route   GET /api/pdfs/:id
 * @desc    Get PDF by ID
 * @access  Public
 */
router.get('/:id', async (req: any, res: any) => {
  try {
    const pdf = await PdfService.getPdfById(req.params.id, req.user?._id);
    res.json({
      success: true,
      pdf,
    });
  } catch (error: any) {
    console.error('Get PDF error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'PDF not found',
    });
  }
});

/**
 * @route   POST /api/pdfs/:id/view
 * @desc    Increment view count for a PDF
 * @access  Public
 */
router.post('/:id/view', async (req: any, res: any) => {
  try {
    const result = await PdfService.incrementViewCount(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error('Increment view error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'PDF not found',
    });
  }
});

/**
 * @route   GET /api/pdfs/:id/download
 * @desc    Download a PDF file
 * @access  Public
 */
router.get('/:id/download', async (req: any, res: any) => {
  try {
    const result = await PdfService.downloadPdf(req.params.id);
    
    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${result.originalName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Send file
    res.sendFile(result.filePath, (err: any) => {
      if (err) {
        console.error('File download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file',
        });
      }
    });
  } catch (error: any) {
    console.error('Download PDF error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'PDF not found',
    });
  }
});

/**
 * @route   POST /api/pdfs/:id/like
 * @desc    Toggle like on a PDF
 * @access  Private
 */
router.post('/:id/like', authenticate, async (req: any, res: any) => {
  try {
    const result = await PdfService.toggleLike(req.params.id, req.user._id);
    res.json(result);
  } catch (error: any) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle like',
    });
  }
});

/**
 * @route   POST /api/pdfs/:id/rating
 * @desc    Add rating to a PDF
 * @access  Private
 */
router.post('/:id/rating', authenticate, async (req: any, res: any) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const result = await PdfService.addRating(req.params.id, req.user._id, rating, review);
    res.json(result);
  } catch (error: any) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add rating',
    });
  }
});

/**
 * @route   POST /api/pdfs/:id/comments
 * @desc    Add comment to a PDF
 * @access  Private
 */
router.post('/:id/comments', authenticate, async (req: any, res: any) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const result = await PdfService.addComment(req.params.id, req.user._id, content.trim());
    res.json(result);
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add comment',
    });
  }
});

/**
 * @route   DELETE /api/pdfs/:id
 * @desc    Delete a PDF (soft delete)
 * @access  Private
 */
router.delete('/:id', authenticate, async (req: any, res: any) => {
  try {
    const result = await PdfService.deletePdf(req.params.id, req.user._id);
    res.json(result);
  } catch (error: any) {
    console.error('Delete PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete PDF',
    });
  }
});

/**
 * @route   GET /api/pdfs/genres/list
 * @desc    Get available genres
 * @access  Public
 */
router.get('/genres/list', (req: any, res: any) => {
  try {
    const genres = PdfService.getGenres();
    res.json({
      success: true,
      genres,
    });
  } catch (error: any) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genres',
    });
  }
});

/**
 * @route   GET /api/pdfs/statistics/overview
 * @desc    Get PDF statistics
 * @access  Public
 */
router.get('/statistics/overview', async (req: any, res: any) => {
  try {
    const result = await PdfService.getStatistics();
    res.json(result);
  } catch (error: any) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

export default router;