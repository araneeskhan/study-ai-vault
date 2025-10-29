# Study AI Vault - Authentication Setup Guide

## 🚀 Complete Authentication System with MongoDB

This guide will help you set up and run the complete authentication system including MongoDB connection.

## 📋 Prerequisites

1. **MongoDB Installation**: Make sure MongoDB is installed and running
2. **MongoDB Compass**: For database management (optional but recommended)
3. **Node.js**: Version 16 or higher
4. **Expo CLI**: For running the React Native app

## 🔧 MongoDB Setup

### Option 1: Local MongoDB
1. **Install MongoDB**:
   - Download from [MongoDB official website](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Start MongoDB**:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh --eval "db.runCommand({ping: 1})"
   ```

### Option 2: MongoDB Atlas (Cloud)
1. **Create account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a cluster** and get your connection string
3. **Update the connection string** in `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study-ai-vault?retryWrites=true&w=majority
   ```

## 🏃‍♂️ Running the Application

### 1. Start the Backend Server
```bash
# Start the Express server
npm run server

# Or run both server and frontend simultaneously
npm run dev
```

The server will start on port 3001 with these endpoints:
- `POST http://localhost:3001/api/auth/signup`
- `POST http://localhost:3001/api/auth/signin`
- `GET http://localhost:3001/api/auth/profile`
- `GET http://localhost:3001/api/health`

### 2. Start the Frontend (in a new terminal)
```bash
# Start the Expo app
npm start
```

## 🔐 Authentication Features

### ✅ Signup Page
- Beautiful UI with gradient backgrounds
- Form validation for full name, email, and password
- Password strength indicator
- Secure password requirements
- Real-time validation feedback
- Navigation to main app on success

### ✅ Signin Page
- Matching beautiful UI design
- Email and password validation
- "Remember me" functionality
- Social login placeholders (Google, Apple)
- Forgot password link
- Navigation to main app on success

### ✅ Backend API
- MongoDB integration with Mongoose
- User model with comprehensive schema
- Password hashing with bcryptjs
- JWT token authentication
- Account security features (locking after failed attempts)
- CORS enabled for cross-origin requests
- Comprehensive error handling

### ✅ Security Features
- Password hashing (bcryptjs with salt rounds: 12)
- JWT token authentication
- Account locking after 5 failed login attempts
- Email validation and sanitization
- Input validation on both frontend and backend
- CORS protection

## 📱 Mobile App Integration

### API Service
- Centralized API service for all authentication requests
- Automatic token storage and retrieval
- Platform-specific API URLs (iOS/Android/Web)
- Request timeout handling
- Error handling and user-friendly messages

### Navigation Flow
1. Landing Page → Get Started → Signup
2. Signup → Success → Main App (Tabs)
3. Signin → Success → Main App (Tabs)
4. Signup ↔ Signin (Navigation between pages)

## 🛠️ Configuration

### Environment Variables (.env.local)
```
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/study-ai-vault

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*
```

### Important Security Notes
- **Change JWT_SECRET** to a secure random string in production
- **Use HTTPS** in production
- **Implement rate limiting** for production
- **Use secure token storage** (AsyncStorage with encryption)
- **Add email verification** for production
- **Implement password reset** functionality

## 🧪 Testing the Authentication Flow

### Test Signup
1. Click "Get Started" on landing page
2. Fill in signup form with valid data
3. Submit and verify account creation
4. Check MongoDB for new user document

### Test Signin
1. Navigate to signin page
2. Use credentials from signup
3. Submit and verify login
4. Check JWT token is stored

### Test Error Handling
1. Try invalid email formats
2. Test short passwords
3. Test duplicate email signup
4. Test wrong password signin

## 🔍 MongoDB Compass Setup

1. **Open MongoDB Compass**
2. **Connection string**:
   - Local: `mongodb://localhost:27017`
   - Atlas: Your Atlas connection string
3. **Database**: `study-ai-vault`
4. **Collection**: `users`

You can now view and manage your user data through Compass!

## 🚨 Common Issues and Solutions

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check port 27017 is available
- Verify connection string in `.env.local`

### Server Issues
- Check if port 3001 is available
- Verify all dependencies are installed
- Check console for error messages

### Mobile App Connection Issues
- For Android emulator: Use `http://10.0.2.2:3001`
- For iOS simulator: Use `http://localhost:3001`
- Ensure server is running before starting app

## 🎯 Next Steps

1. **Add email verification** system
2. **Implement password reset** functionality
3. **Add social login** (Google, Apple, Facebook)
4. **Implement user profile** management
5. **Add rate limiting** and security headers
6. **Set up HTTPS** for production
7. **Add logging** and monitoring
8. **Implement refresh tokens**

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify MongoDB is running
3. Ensure all environment variables are set
4. Check network connectivity between app and server

---

**🎉 Congratulations!** You now have a complete authentication system with MongoDB integration. The system is ready for development and testing.