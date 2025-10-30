import { ThemedText, ThemedView } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeUtils } from '@/hooks/use-theme';
import { apiService } from '@/services/api.service';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { theme } = useThemeUtils();
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const isDark = theme.isDark;

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!token) {
      router.replace('/signin');
      return;
    }
    
    loadUserData();
  }, [token, authLoading]);

  const loadUserData = async () => {
    try {
      const result = await apiService.getProfile();
      
      if (result.success) {
        const userData = result.user || result.data;
        if (userData) {
          setUserData(userData);
        } else {
          console.error('No user data in response');
        }
      } else {
        console.error('Failed to load profile:', result.message);
        if (result.message === 'No authentication token found') {
          router.replace('/signin');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
    
    try {
      console.log('Logout initiated');
      router.replace('/signin');
      console.log('Navigation to signin initiated');
      await logout();
      console.log('Logout completed');
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
      <View style={[styles.glassCard, { 
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
        borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(10, 126, 164, 0.12)',
      }]}>
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <LinearGradient
            colors={isComplete 
              ? isDark 
                ? ['rgba(52, 211, 153, 0.15)', 'transparent']
                : ['rgba(16, 185, 129, 0.08)', 'transparent']
              : isDark
                ? ['rgba(56, 189, 248, 0.15)', 'transparent']
                : ['rgba(10, 126, 164, 0.08)', 'transparent']
            }
            style={styles.cardGradient}
          >
            <View style={styles.completionHeader}>
              <View style={styles.completionTitleContainer}>
                <View style={[styles.iconWrapper, { 
                  backgroundColor: isComplete 
                    ? (isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.12)')
                    : (isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(10, 126, 164, 0.12)')
                }]}>
                  <IconSymbol 
                    name={isComplete ? "checkmark.circle.fill" : "chart.bar.fill"} 
                    size={22} 
                    color={isComplete ? theme.colors.success : theme.colors.primary} 
                  />
                </View>
                <ThemedText variant="h3" style={styles.completionTitle}>
                  Profile Strength
                </ThemedText>
              </View>
              <View style={[styles.percentageBadge, { 
                backgroundColor: isComplete ? theme.colors.success : theme.colors.primary,
              }]}>
                <ThemedText style={styles.percentageText}>{completion}%</ThemedText>
              </View>
            </View>
            
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBarContainer, { 
                backgroundColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.2)' 
              }]}>
                <LinearGradient
                  colors={isComplete 
                    ? [theme.colors.success, theme.colors.success + 'dd']
                    : [theme.colors.primary, theme.colors.accent]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBar, { width: `${completion}%` }]}
                />
              </View>
              <View style={styles.progressLabels}>
                <ThemedText variant="caption" color="secondary" style={styles.progressLabel}>Beginner</ThemedText>
                <ThemedText variant="caption" color="secondary" style={styles.progressLabel}>Expert</ThemedText>
              </View>
            </View>
            
            {!isComplete && (
              <View style={[styles.completionHint, { 
                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(245, 158, 11, 0.08)' 
              }]}>
                <IconSymbol name="lightbulb.fill" size={16} color={theme.colors.warning} />
                <ThemedText variant="caption" color="secondary" style={styles.hintText}>
                  Complete your profile to unlock personalized features
                </ThemedText>
              </View>
            )}
          </LinearGradient>
        </BlurView>
      </View>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { icon: 'pencil', label: 'Edit', color: theme.colors.primary, onPress: handleEditProfile },
      { icon: 'gear', label: 'Settings', color: theme.colors.accent, onPress: () => {} },
      { icon: 'bell.fill', label: 'Alerts', color: theme.colors.warning, onPress: () => {} },
      { icon: 'shield.fill', label: 'Privacy', color: theme.colors.success, onPress: () => {} },
    ];

    return (
      <View style={styles.quickActionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.actionButton, { 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.8)',
            }]}
            onPress={action.onPress}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
              <IconSymbol name={action.icon} size={22} color={action.color} />
            </View>
            <ThemedText variant="caption" style={styles.actionLabel}>{action.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderUserInfo = () => {
    if (!userData) return null;
    
    return (
      <View style={[styles.glassCard, { 
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
        borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(10, 126, 164, 0.12)',
      }]}>
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={[styles.iconWrapper, { 
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(10, 126, 164, 0.12)' 
                }]}>
                  <IconSymbol name="person.text.rectangle.fill" size={20} color={theme.colors.primary} />
                </View>
                <ThemedText variant="h3" style={styles.cardTitle}>About Me</ThemedText>
              </View>
            </View>
            
            {userData.bio ? (
              <ThemedText style={styles.bioText}>{userData.bio}</ThemedText>
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol name="text.bubble" size={40} color={theme.colors.textTertiary} />
                <ThemedText color="secondary" style={styles.emptyText}>
                  Share something about yourself
                </ThemedText>
              </View>
            )}
            
            {(userData.location || userData.website || userData.birthDate) && (
              <View style={styles.infoGrid}>
                {userData.location && (
                  <View style={[styles.infoChip, { 
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(10, 126, 164, 0.08)',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(10, 126, 164, 0.15)',
                  }]}>
                    <IconSymbol name="location.fill" size={16} color={theme.colors.primary} />
                    <ThemedText style={styles.infoChipText}>{userData.location}</ThemedText>
                  </View>
                )}
                
                {userData.website && (
                  <View style={[styles.infoChip, { 
                    backgroundColor: isDark ? 'rgba(34, 211, 238, 0.1)' : 'rgba(6, 182, 212, 0.08)',
                    borderColor: isDark ? 'rgba(34, 211, 238, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                  }]}>
                    <IconSymbol name="link" size={16} color={theme.colors.accent} />
                    <ThemedText style={styles.infoChipText}>{userData.website}</ThemedText>
                  </View>
                )}
                
                {userData.birthDate && (
                  <View style={[styles.infoChip, { 
                    backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    borderColor: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  }]}>
                    <IconSymbol name="calendar" size={16} color={theme.colors.success} />
                    <ThemedText style={styles.infoChipText}>
                      {new Date(userData.birthDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </BlurView>
      </View>
    );
  };

  const renderReadingStats = () => {
    if (!userData?.readingStats) return null;
    
    const { booksRead, pagesRead, readingStreak } = userData.readingStats;
    
    const stats = [
      { icon: 'book.fill', value: booksRead, label: 'Books', color: theme.colors.primary, gradient: isDark ? ['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.05)'] : ['rgba(10, 126, 164, 0.12)', 'rgba(10, 126, 164, 0.02)'] },
      { icon: 'doc.text.fill', value: pagesRead.toLocaleString(), label: 'Pages', color: theme.colors.accent, gradient: isDark ? ['rgba(34, 211, 238, 0.2)', 'rgba(34, 211, 238, 0.05)'] : ['rgba(6, 182, 212, 0.12)', 'rgba(6, 182, 212, 0.02)'] },
      { icon: 'flame.fill', value: readingStreak, label: 'Streak', color: theme.colors.success, gradient: isDark ? ['rgba(52, 211, 153, 0.2)', 'rgba(52, 211, 153, 0.05)'] : ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.02)'] },
    ];
    
    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View 
            key={index}
            style={[styles.statCard, { 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.8)',
            }]}
          >
            <BlurView
              intensity={isDark ? 20 : 40}
              tint={isDark ? 'dark' : 'light'}
              style={styles.blurContainer}
            >
              <LinearGradient
                colors={stat.gradient}
                style={styles.statGradient}
              >
                <View style={[styles.statIconWrapper, { backgroundColor: stat.color + '20' }]}>
                  <IconSymbol name={stat.icon} size={26} color={stat.color} />
                </View>
                <ThemedText style={[styles.statNumber, { color: stat.color }]}>
                  {stat.value}
                </ThemedText>
                <ThemedText variant="caption" color="secondary" style={styles.statLabel}>
                  {stat.label}
                </ThemedText>
              </LinearGradient>
            </BlurView>
          </View>
        ))}
      </View>
    );
  };

  const renderFavoriteGenres = () => {
    if (!userData?.favoriteGenres?.length) return null;
    
    return (
      <View style={[styles.glassCard, { 
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
        borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(10, 126, 164, 0.12)',
      }]}>
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={[styles.iconWrapper, { 
                  backgroundColor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.12)' 
                }]}>
                  <IconSymbol name="star.fill" size={20} color={theme.colors.warning} />
                </View>
                <ThemedText variant="h3" style={styles.cardTitle}>Favorite Genres</ThemedText>
              </View>
            </View>
            
            <View style={styles.genresContainer}>
              {userData.favoriteGenres.map((genre: string, index: number) => (
                <View 
                  key={index} 
                  style={[styles.genreTag, { 
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(10, 126, 164, 0.08)',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(10, 126, 164, 0.2)',
                  }]}
                >
                  <ThemedText style={[styles.genreText, { color: theme.colors.primary }]}>
                    {genre}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderAccountInfo = () => {
    if (!userData) return null;
    
    return (
      <View style={[styles.glassCard, { 
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
        borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(10, 126, 164, 0.12)',
      }]}>
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={[styles.iconWrapper, { 
                  backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.12)' 
                }]}>
                  <IconSymbol name="info.circle.fill" size={20} color={theme.colors.info} />
                </View>
                <ThemedText variant="h3" style={styles.cardTitle}>Account Details</ThemedText>
              </View>
            </View>
            
            <View style={styles.accountList}>
              <View style={styles.accountRow}>
                <View style={styles.accountLabel}>
                  <IconSymbol name="envelope.fill" size={18} color={theme.colors.textSecondary} />
                  <ThemedText color="secondary">Email</ThemedText>
                </View>
                <ThemedText style={styles.accountValue}>{userData.email}</ThemedText>
              </View>
              
              <View style={[styles.accountRow, styles.accountRowBorder, { 
                borderTopColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(226, 232, 240, 0.6)' 
              }]}>
                <View style={styles.accountLabel}>
                  <IconSymbol name="calendar.badge.clock" size={18} color={theme.colors.textSecondary} />
                  <ThemedText color="secondary">Member Since</ThemedText>
                </View>
                <ThemedText style={styles.accountValue}>
                  {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </ThemedText>
              </View>
              
              <View style={[styles.accountRow, styles.accountRowBorder, { 
                borderTopColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(226, 232, 240, 0.6)' 
              }]}>
                <View style={styles.accountLabel}>
                  <IconSymbol name="checkmark.shield.fill" size={18} color={theme.colors.textSecondary} />
                  <ThemedText color="secondary">Verification</ThemedText>
                </View>
                <View style={[styles.verificationBadge, { 
                  backgroundColor: userData.isEmailVerified 
                    ? (isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.12)')
                    : (isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.12)')
                }]}>
                  <IconSymbol 
                    name={userData.isEmailVerified ? "checkmark.circle.fill" : "xmark.circle.fill"} 
                    size={14} 
                    color={userData.isEmailVerified ? theme.colors.success : theme.colors.error} 
                  />
                  <ThemedText 
                    style={[styles.verificationText, { 
                      color: userData.isEmailVerified ? theme.colors.success : theme.colors.error 
                    }]}
                  >
                    {userData.isEmailVerified ? 'Verified' : 'Pending'}
                  </ThemedText>
                </View>
              </View>
              
              {userData.lastLogin && (
                <View style={[styles.accountRow, styles.accountRowBorder, { 
                  borderTopColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(226, 232, 240, 0.6)' 
                }]}>
                  <View style={styles.accountLabel}>
                    <IconSymbol name="clock.fill" size={18} color={theme.colors.textSecondary} />
                    <ThemedText color="secondary">Last Active</ThemedText>
                  </View>
                  <ThemedText style={styles.accountValue}>
                    {new Date(userData.lastLogin).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  if (authLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

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
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Header with Glassmorphism */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={isDark 
            ? [theme.colors.primary, theme.colors.accent]
            : [theme.colors.primary, theme.colors.accent]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarBorder, {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              }]}>
                {userData?.avatar ? (
                  <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                ) : (
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)']}
                    style={styles.avatarPlaceholder}
                  >
                    <ThemedText variant="h1" style={styles.avatarText}>
                      {userData?.fullName?.charAt(0).toUpperCase()}
                    </ThemedText>
                  </LinearGradient>
                )}
              </View>
              <TouchableOpacity style={[styles.avatarEditButton, {
                backgroundColor: isDark ? theme.colors.primary : '#fff',
              }]}>
                <IconSymbol name="camera.fill" size={16} color={isDark ? '#fff' : theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <ThemedText variant="h2" style={styles.userName}>
              {userData?.fullName}
            </ThemedText>
            
            <View style={styles.userBadge}>
              <IconSymbol name="checkmark.seal.fill" size={16} color="#fbbf24" />
              <ThemedText style={styles.badgeText}>Premium Member</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {renderQuickActions()}
        {renderProfileCompletion()}
        {renderReadingStats()}
        {renderUserInfo()}
        {renderFavoriteGenres()}
        {renderAccountInfo()}
        
        {/* Logout Button with Glass Effect */}
        <TouchableOpacity 
          style={[styles.logoutButton, { 
            backgroundColor: isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.08)',
            borderColor: isDark ? 'rgba(248, 113, 113, 0.3)' : 'rgba(239, 68, 68, 0.2)',
          }]}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square.fill" size={20} color={theme.colors.error} />
          <ThemedText style={[styles.logoutText, { color: theme.colors.error }]}>
            Sign Out
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 50,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarBorder: {
    padding: 5,
    borderRadius: 65,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '800',
    fontSize: 28,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 14,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  glassCard: {
    marginBottom: 20,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 28,
  },
  cardGradient: {
    padding: 24,
  },
  cardContent: {
    padding: 24,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  percentageBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
  },
  percentageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarWrapper: {
    gap: 10,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  completionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginTop: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 14,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  infoChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  statGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  statIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genreTag: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  accountList: {
    gap: 0,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  accountRowBorder: {
    borderTopWidth: 1,
  },
  accountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  verificationText: {
    fontSize: 13,
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '800',
  },
  bottomSpacing: {
    height: 120,
  },
});