import { ThemedButton, ThemedText, ThemedView } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api.service';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/toast';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Account Created!',
          message: 'Welcome to Study AI Vault!',
          duration: 3000,
        });
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        showToast({
          type: 'error',
          title: 'Signup Failed',
          message: result.message || 'Failed to create account',
          duration: 4000,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to server. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^\w\s]/.test(password)) strength++;
    
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 1) return theme.colors.error;
    if (strength <= 2) return theme.colors.warning;
    if (strength <= 3) return theme.colors.info;
    return theme.colors.success;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated Background */}
      <ThemedView style={styles.gradientBackground}>
        <LinearGradient
          colors={[
            theme.colors.primary + '10',
            theme.colors.accent + '05',
            theme.colors.background,
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </ThemedView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Animated Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <ThemedView style={styles.logoContainer}>
              <ThemedView style={styles.logoWrapper}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  style={styles.logoBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText variant="h3" style={styles.logoText}>
                    AI
                  </ThemedText>
                </LinearGradient>
                <ThemedView style={[
                  styles.logoGlow,
                  { backgroundColor: theme.colors.primary + '30' }
                ]} />
              </ThemedView>
            </ThemedView>
            <ThemedText variant="h1" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText variant="body" center color="secondary" style={styles.subtitle}>
              Start your learning journey with Study Vault
            </ThemedText>
          </Animated.View>

          {/* Professional Form Card */}
          <Animated.View 
            style={[
              styles.formCard, 
              { backgroundColor: theme.colors.surface },
              {
                opacity: fadeAnim,
                transform: [{ translateY: Animated.add(slideAnim, 20) }]
              }
            ]}
          >
            {/* Full Name Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText variant="caption" color="secondary" style={styles.label}>
                Full Name
              </ThemedText>
              <ThemedView
                style={[
                  styles.inputContainer,
                  errors.fullName && styles.inputError,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <IconSymbol
                  name="person.fill"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.fullName}
                  onChangeText={(text: string) => updateFormData('fullName', text)}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                />
              </ThemedView>
              {errors.fullName && (
                <ThemedText variant="caption" color="error" style={styles.errorText}>
                  {errors.fullName}
                </ThemedText>
              )}
            </ThemedView>

            {/* Email Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText variant="caption" color="secondary" style={styles.label}>
                Email Address
              </ThemedText>
              <ThemedView
                style={[
                  styles.inputContainer,
                  errors.email && styles.inputError,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <IconSymbol
                  name="envelope.fill"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter your email address"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.email}
                  onChangeText={(text: string) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </ThemedView>
              {errors.email && (
                <ThemedText variant="caption" color="error" style={styles.errorText}>
                  {errors.email}
                </ThemedText>
              )}
            </ThemedView>

            {/* Password Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText variant="caption" color="secondary" style={styles.label}>
                Password
              </ThemedText>
              <ThemedView
                style={[
                  styles.inputContainer,
                  errors.password && styles.inputError,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <IconSymbol
                  name="lock.fill"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text, flex: 1 }]}
                  placeholder="Create a strong password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.password}
                  onChangeText={(text: string) => updateFormData('password', text)}
                  secureTextEntry={securePassword}
                  autoComplete="new-password"
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setSecurePassword(!securePassword)}
                  style={styles.eyeButton}
                >
                  <IconSymbol
                    name={securePassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </ThemedView>
              {formData.password.length > 0 && (
                <ThemedView style={styles.passwordStrengthContainer}>
                  <ThemedView
                    style={[
                      styles.passwordStrengthBar,
                      {
                        backgroundColor: getPasswordStrengthColor(),
                        width: `${(getPasswordStrength() / 5) * 100}%`,
                      },
                    ]}
                  />
                  <ThemedText variant="caption" color="secondary">
                    Password strength: {getPasswordStrength() <= 1 ? 'Weak' : getPasswordStrength() <= 2 ? 'Fair' : getPasswordStrength() <= 3 ? 'Good' : 'Strong'}
                  </ThemedText>
                </ThemedView>
              )}
              {errors.password && (
                <ThemedText variant="caption" color="error" style={styles.errorText}>
                  {errors.password}
                </ThemedText>
              )}
            </ThemedView>

            {/* Confirm Password Input */}
            <ThemedView style={styles.inputGroup}>
              <ThemedText variant="caption" color="secondary" style={styles.label}>
                Confirm Password
              </ThemedText>
              <ThemedView
                style={[
                  styles.inputContainer,
                  errors.confirmPassword && styles.inputError,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <IconSymbol
                  name="lock.fill"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text, flex: 1 }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.confirmPassword}
                  onChangeText={(text: string) => updateFormData('confirmPassword', text)}
                  secureTextEntry={secureConfirmPassword}
                  autoComplete="new-password"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <IconSymbol
                    name={secureConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </ThemedView>
              {errors.confirmPassword && (
                <ThemedText variant="caption" color="error" style={styles.errorText}>
                  {errors.confirmPassword}
                </ThemedText>
              )}
            </ThemedView>

            {/* Professional Sign Up Button */}
            <ThemedView style={styles.buttonGradientWrapper}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <ThemedButton
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  onPress={handleSignup}
                  style={styles.signupButton}
                >
                  <ThemedText style={styles.buttonText}>
                    Create Account
                  </ThemedText>
                </ThemedButton>
              </LinearGradient>
            </ThemedView>

            {/* Terms and Sign In Link */}
            <ThemedView style={styles.termsContainer}>
              <ThemedText variant="caption" center color="secondary" style={styles.termsText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.signinContainer}>
              <ThemedText variant="body" color="secondary">
                Already have an account?{' '}
              </ThemedText>
              <ThemedButton
                variant="ghost"
                size="sm"
                onPress={() => router.push('/signin')}
              >
                Sign In
              </ThemedButton>
            </ThemedView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 24,
    opacity: 0.3,
    zIndex: -1,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: 1,
  },
  title: {
    marginBottom: 8,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    maxWidth: 280,
    lineHeight: 22,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    marginLeft: 4,
  },
  passwordStrengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  buttonGradientWrapper: {
    marginTop: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  signupButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termsContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.7,
  },
  signinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});