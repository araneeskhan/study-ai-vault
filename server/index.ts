import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AuthService } from './services/auth.service';
import pdfRoutes from './routes/pdf.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate full name
    if (fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long',
      });
    }

    const result = await AuthService.signup({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Signup API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Signin endpoint
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    const result = await AuthService.signin({
      email: email.toLowerCase().trim(),
      password,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('Signin API error:', error);
    return res.status(500).json({
      success: false,
        message: 'Internal server error',
    });
  }
});

// Get user profile endpoint
app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await AuthService.verifyToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PDF routes
app.use('/api/pdfs', pdfRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/signin`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/profile`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - POST http://localhost:${PORT}/api/pdfs/upload`);
  console.log(`   - GET  http://localhost:${PORT}/api/pdfs`);
  console.log(`   - GET  http://localhost:${PORT}/api/pdfs/:id`);
  console.log(`   - GET  http://localhost:${PORT}/api/pdfs/:id/download`);
});