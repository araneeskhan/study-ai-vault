import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determine the correct API URL based on platform
// Allows override via EXPO_PUBLIC_API_URL (e.g., http://<your-ip>:3001 or http://localhost:3001)
const getApiBaseUrl = () => {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (raw) {
    const base = raw.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }

  // Default to platform-specific URLs
  return Platform.select({
    android: 'http://10.0.2.2:3001/api', // Android emulator
    ios: 'http://localhost:3001/api',
    web: 'http://localhost:3001/api',
    default: 'http://localhost:3001/api',
  });
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging
console.log(`🔌 API Service initialized with URL: ${API_BASE_URL}`);
console.log(`📱 Platform: ${Platform.OS}`);

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: any;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

interface SigninData {
  email: string;
  password: string;
}

class ApiService {
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid response from server');
      }
      throw error;
    }
  }

  async signup(data: SignupData): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse(response);
      
      // Store token if provided
      if (result.token) {
        await this.storeToken(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account. Please try again.';

      if ((error as any).message === 'Request timeout') {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if ((error as any).message?.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please make sure the server is running.';
      } else if ((error as any).message === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async signin(data: SigninData): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse(response);
      
      // Store token if provided
      if (result.token) {
        await this.storeToken(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Signin error:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (error.message === 'Request timeout') {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please make sure the server is running.';
      } else if (error.message === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async getProfile(): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch profile',
      };
    }
  }

  // PDF Methods
  async uploadPdf(pdfData: FormData): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: pdfData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Upload PDF error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload PDF',
      };
    }
  }

  async getPdfs(params: any = {}): Promise<ApiResponse> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get PDFs error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch PDFs',
      };
    }
  }

  async getPdfById(id: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get PDF by ID error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch PDF',
      };
    }
  }

  async getUserPdfs(userId: string, params: any = {}): Promise<ApiResponse> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/user/${userId}?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user PDFs error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user PDFs',
      };
    }
  }

  async getMyPdfs(params: any = {}): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/my-pdfs?${queryString}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get my PDFs error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch my PDFs',
      };
    }
  }

  async incrementViewCount(id: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/${id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Increment view count error:', error);
      return {
        success: false,
        message: error.message || 'Failed to increment view count',
      };
    }
  }

  async downloadPdf(id: string): Promise<Response> {
    try {
      return await fetch(`${API_BASE_URL}/pdfs/${id}/download`);
    } catch (error) {
      console.error('Download PDF error:', error);
      throw error;
    }
  }

  async toggleLike(id: string): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/${id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Toggle like error:', error);
      return {
        success: false,
        message: error.message || 'Failed to toggle like',
      };
    }
  }

  async addRating(id: string, rating: number, review?: string): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/${id}/rating`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, review }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Add rating error:', error);
      return {
        success: false,
        message: error.message || 'Failed to add rating',
      };
    }
  }

  async addComment(id: string, content: string): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/${id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Add comment error:', error);
      return {
        success: false,
        message: error.message || 'Failed to add comment',
      };
    }
  }

  async deletePdf(id: string): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete PDF error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete PDF',
      };
    }
  }

  async getGenres(): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/genres/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get genres error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch genres',
      };
    }
  }

  async getPdfStatistics(): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pdfs/statistics/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get PDF statistics error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch PDF statistics',
      };
    }
  }

  async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Store token error:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Remove token error:', error);
    }
  }

  async updateProfile(data: any): Promise<ApiResponse> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await this.fetchWithTimeout(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/health`, {
        method: 'GET',
      });

      const result = await this.handleResponse(response);
      return result.success !== false;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;