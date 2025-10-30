// Simple script to test login and get user data
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testLogin() {
  try {
    console.log('Testing login with test user...');
    
    // Test login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('Token:', loginResponse.data.token);
    console.log('User data:', loginResponse.data.user);
    
    // Test profile endpoint with token
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('\nProfile data fetched successfully:');
    console.log('Full Name:', profileResponse.data.user.fullName);
    console.log('Email:', profileResponse.data.user.email);
    console.log('Avatar:', profileResponse.data.user.avatar);
    console.log('Bio:', profileResponse.data.user.bio);
    console.log('Location:', profileResponse.data.user.location);
    console.log('Reading Stats:', profileResponse.data.user.readingStats);
    console.log('Favorite Genres:', profileResponse.data.user.favoriteGenres);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLogin();