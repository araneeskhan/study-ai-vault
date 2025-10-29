import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../db/mongoose';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = 12;

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

export class AuthService {
  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      await connectToDatabase();

      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: data.email.toLowerCase(),
        isActive: true 
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email address',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

      // Create new user
      const user = new User({
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      return {
        success: true,
        message: 'Account created successfully!',
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Failed to create account. Please try again.',
      };
    }
  }

  static async signin(data: SigninData): Promise<AuthResponse> {
    try {
      await connectToDatabase();

      // Find user
      const user = await User.findOne({ 
        email: data.email.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Check if account is locked
      if (user.isLocked) {
        return {
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts',
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        // Increment login attempts
        user.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        }
        
        await user.save();
        
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Reset login attempts and update last login
      user.loginAttempts = 0;
      user.lockUntil = null;
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      return {
        success: true,
        message: 'Welcome back!',
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        message: 'Failed to sign in. Please try again.',
      };
    }
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      await connectToDatabase();
      
      const user = await User.findOne({ 
        _id: decoded.userId,
        isActive: true 
      });
      
      return user ? user.toJSON() : null;
    } catch (error) {
      return null;
    }
  }

  static async getUserById(userId: string): Promise<any> {
    try {
      await connectToDatabase();
      const user = await User.findById(userId);
      return user ? user.toJSON() : null;
    } catch (error) {
      return null;
    }
  }
}