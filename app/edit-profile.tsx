import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemeUtils } from '@/hooks/use-theme';
import { ThemedText, ThemedView, ThemedButton, ThemedCard } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api.service';

export default function EditProfileScreen() {
  const { theme } = useThemeUtils();
  const router = useRouter();
  const { user, token, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    birthDate: '',
    favoriteGenres: [],
    favoriteBooks: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    birthDate: '',
    favoriteGenres: [],
    favoriteBooks: [],
  });

  useEffect(() => {
    if (user) {
      const userFormData = {
        fullName: user.fullName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        favoriteGenres: user.favoriteGenres || [],
        favoriteBooks: user.favoriteBooks || [],
      };
      setFormData(userFormData);
      setOriginalData(userFormData);
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      router.back();
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare update data
      const updateData: any = {};
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]) {
          updateData[key] = formData[key as keyof typeof formData];
        }
      });

      // Call API to update profile
      const result = await apiService.updateProfile(updateData);
      
      if (result.success) {
        // Update local user data
        const updatedUserData = { ...user, ...updateData };
        await updateUser(updatedUserData);
        
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Unable to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.gradientBackground}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <IconSymbol name="arrow.left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <ThemedText variant="h2" style={styles.title}>
            Edit Profile
          </ThemedText>
          
          <View style={styles.placeholder} />
        </ThemedView>

        <ThemedCard style={styles.formCard}>
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Full Name</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.secondary}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Bio</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.colors.secondary}
              multiline
              numberOfLines={4}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Location</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              placeholder="City, Country"
              placeholderTextColor={theme.colors.secondary}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Website</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={formData.website}
              onChangeText={(text) => handleInputChange('website', text)}
              placeholder="https://yourwebsite.com"
              placeholderTextColor={theme.colors.secondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Birth Date</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={formData.birthDate}
              onChangeText={(text) => handleInputChange('birthDate', text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.secondary}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Favorite Genres</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              placeholder="e.g., Fiction, Mystery, Romance (comma separated)"
              value={formData.favoriteGenres.join(', ')}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                favoriteGenres: text.split(',').map(genre => genre.trim()).filter(Boolean)
              }))}
              placeholderTextColor={theme.colors.secondary}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Favorite Books</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              placeholder="e.g., The Great Gatsby, 1984 (comma separated)"
              value={formData.favoriteBooks.join(', ')}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                favoriteBooks: text.split(',').map(book => book.trim()).filter(Boolean)
              }))}
              placeholderTextColor={theme.colors.secondary}
            />
          </ThemedView>
        </ThemedCard>

        <ThemedView style={styles.buttonContainer}>
          <ThemedButton
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </ThemedButton>
          
          <ThemedButton
            onPress={handleSave}
            style={styles.saveButton}
            disabled={isLoading || !hasChanges()}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </ThemedButton>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
  },
});