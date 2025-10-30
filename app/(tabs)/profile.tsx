import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemeUtils } from '@/hooks/use-theme';
import { ThemedText, ThemedView, ThemedButton, ThemedCard } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api.service';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { theme } = useThemeUtils();
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Don't do anything while authentication is loading
    if (authLoading) {
      return;
    }
    
    // Check if user is authenticated, if not redirect to signin
    if (!token) {
      router.replace('/signin');
      return;
    }
    
    loadUserData();
  }, [token, authLoading]);

  const loadUserData = async () => {
    try {
      // Use the apiService which already has correct URL configuration
      const result = await apiService.getProfile();
      
      if (result.success) {
        // Try both result.user and result.data for compatibility
        const userData = result.user || result.data;
        if (userData) {
          setUserData(userData);
        } else {
          console.error('No user data in response');
        }
      } else {
        console.error('Failed to load profile:', result.message);
        // If authentication failed, redirect to signin
        if (result.message === 'No authentication token found') {
          router.replace('/signin');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Handle network or other errors
      if (error.message.includes('authentication')) {
        router.replace('/signin');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleLogout = async () => {
    console.log('Logout button pressed');
    
    // Temporarily bypass Alert to test if the button works
    try {
      console.log('Logout initiated');
      // First navigate away from profile
      router.replace('/signin');
      console.log('Navigation to signin initiated');
      // Then perform logout to clear auth state
      await logout();
      console.log('Logout completed');
      // Clear local data
      setUserData(null);
      console.log('Local data cleared');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const renderProfileCompletion = () => {
    if (!userData) return null;
    
    const completion = userData.profileCompletion || 0;
    const isComplete = completion === 100;
    
    return (
      <ThemedCard style={styles.completionCard}>
        <ThemedView style={styles.completionHeader}>
          <ThemedText variant="h3" style={styles.completionTitle}>
            Profile Completion
          </ThemedText>
          <ThemedText style={[styles.completionPercentage, { color: isComplete ? theme.colors.success : theme.colors.primary }]}>
            {completion}%
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.progressBarContainer}>
          <ThemedView style={[styles.progressBar, { width: `${completion}%`, backgroundColor: isComplete ? theme.colors.success : theme.colors.primary }]} />
        </ThemedView>
        
        {!isComplete && (
          <ThemedText variant="caption" color="secondary" style={styles.completionText}>
            Complete your profile to get personalized recommendations
          </ThemedText>
        )}
      </ThemedCard>
    );
  };

  const renderUserInfo = () => {
    if (!userData) return null;
    
    return (
      <ThemedCard style={styles.infoCard}>
        <ThemedView style={styles.infoHeader}>
          <ThemedText variant="h3" style={styles.infoTitle}>
            About Me
          </ThemedText>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <IconSymbol name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </ThemedView>
        
        {userData.bio ? (
          <ThemedText style={styles.bioText}>{userData.bio}</ThemedText>
        ) : (
          <ThemedText color="secondary" style={styles.emptyBio}>
            No bio added yet. Tap edit to add one.
          </ThemedText>
        )}
        
        <ThemedView style={styles.infoGrid}>
          {userData.location && (
            <ThemedView style={styles.infoItem}>
              <IconSymbol name="location.fill" size={16} color={theme.colors.secondary} />
              <ThemedText style={styles.infoText}>{userData.location}</ThemedText>
            </ThemedView>
          )}
          
          {userData.website && (
            <ThemedView style={styles.infoItem}>
              <IconSymbol name="link" size={16} color={theme.colors.secondary} />
              <ThemedText style={styles.infoText}>{userData.website}</ThemedText>
            </ThemedView>
          )}
          
          {userData.birthDate && (
            <ThemedView style={styles.infoItem}>
              <IconSymbol name="calendar" size={16} color={theme.colors.secondary} />
              <ThemedText style={styles.infoText}>
                {new Date(userData.birthDate).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedCard>
    );
  };

  const renderReadingStats = () => {
    if (!userData?.readingStats) return null;
    
    const { booksRead, pagesRead, readingStreak } = userData.readingStats;
    
    return (
      <ThemedCard style={styles.statsCard}>
        <ThemedText variant="h3" style={styles.statsTitle}>
          Reading Statistics
        </ThemedText>
        
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: theme.colors.primary }]}>
              {booksRead}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Books Read
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: theme.colors.accent }]}>
              {pagesRead.toLocaleString()}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Pages Read
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: theme.colors.success }]}>
              {readingStreak}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Day Streak
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedCard>
    );
  };

  const renderFavoriteGenres = () => {
    if (!userData?.favoriteGenres?.length) return null;
    
    return (
      <ThemedCard style={styles.genresCard}>
        <ThemedText variant="h3" style={styles.genresTitle}>
          Favorite Genres
        </ThemedText>
        
        <ThemedView style={styles.genresContainer}>
          {userData.favoriteGenres.map((genre: string, index: number) => (
            <ThemedView key={index} style={[styles.genreTag, { backgroundColor: theme.colors.surface }]}>
              <ThemedText variant="caption" style={styles.genreText}>
                {genre}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedCard>
    );
  };

  const renderAccountInfo = () => {
    if (!userData) return null;
    
    return (
      <ThemedCard style={styles.accountCard}>
        <ThemedText variant="h3" style={styles.accountTitle}>
          Account Information
        </ThemedText>
        
        <ThemedView style={styles.accountItem}>
          <ThemedText color="secondary">Email:</ThemedText>
          <ThemedText style={styles.accountText}>{userData.email}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.accountItem}>
          <ThemedText color="secondary">Member since:</ThemedText>
          <ThemedText style={styles.accountText}>
            {new Date(userData.createdAt).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.accountItem}>
          <ThemedText color="secondary">Email verified:</ThemedText>
          <ThemedView style={styles.verificationStatus}>
            <IconSymbol 
              name={userData.isEmailVerified ? "checkmark.circle.fill" : "xmark.circle.fill"} 
              size={16} 
              color={userData.isEmailVerified ? theme.colors.success : theme.colors.error} 
            />
            <ThemedText style={styles.accountText}>
              {userData.isEmailVerified ? 'Verified' : 'Not verified'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        {userData.lastLogin && (
          <ThemedView style={styles.accountItem}>
            <ThemedText color="secondary">Last login:</ThemedText>
            <ThemedText style={styles.accountText}>
              {new Date(userData.lastLogin).toLocaleDateString()}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedCard>
    );
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // Show loading profile only after authentication is confirmed
  if (!userData) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={[theme.colors.primary + '20', theme.colors.accent + '10']}
        style={styles.headerGradient}
      >
        <ThemedView style={styles.headerContent}>
          <ThemedView style={styles.avatarContainer}>
            {userData?.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            ) : (
              <ThemedView style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.surface }]}>
                <ThemedText variant="h1" style={styles.avatarText}>
                  {userData?.fullName?.charAt(0).toUpperCase()}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          
          <ThemedText variant="h2" style={styles.userName}>
            {userData?.fullName}
          </ThemedText>
          
          <ThemedText variant="body" color="secondary" style={styles.userEmail}>
            {userData?.email}
          </ThemedText>
        </ThemedView>
      </LinearGradient>

      {/* Content Section */}
      <ThemedView style={styles.contentContainer}>
        {renderProfileCompletion()}
        {renderUserInfo()}
        {renderReadingStats()}
        {renderFavoriteGenres()}
        {renderAccountInfo()}
        
        {/* Action Buttons */}
        <ThemedView style={styles.actionContainer}>
          <ThemedButton
            variant="secondary"
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            Edit Profile
          </ThemedButton>
          
          <ThemedButton
            variant="outline"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            textStyle={{ color: theme.colors.error }}
          >
            Logout
          </ThemedButton>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    textAlign: 'center',
    opacity: 0.8,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  completionCard: {
    marginBottom: 20,
    padding: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  completionPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  completionText: {
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 20,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    padding: 4,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyBio: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  statsCard: {
    marginBottom: 20,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  genresCard: {
    marginBottom: 20,
    padding: 16,
  },
  genresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  accountCard: {
    marginBottom: 20,
    padding: 16,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountText: {
    fontSize: 14,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionContainer: {
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    marginBottom: 8,
  },
  logoutButton: {
    borderColor: '#DC2626',
  },
});