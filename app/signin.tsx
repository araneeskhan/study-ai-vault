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
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const { width, height } = Dimensions.get('window');

export default function SigninScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.signin({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Welcome Back!',
          message: 'Successfully signed in',
          duration: 3000,
        });
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        showToast({
          type: 'error',
          title: 'Signin Failed',
          message: result.message || 'Failed to sign in',
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

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
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
              Welcome Back
            </ThemedText>
            <ThemedText variant="body" center color="secondary" style={styles.subtitle}>
              Sign in to continue your learning journey
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
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.password}
                  onChangeText={(text: string) => updateFormData('password', text)}
                  secureTextEntry={securePassword}
                  autoComplete="current-password"
                  returnKeyType="done"
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
              {errors.password && (
                <ThemedText variant="caption" color="error" style={styles.errorText}>
                  {errors.password}
                </ThemedText>
              )}
            </ThemedView>

            {/* Options Row */}
            <ThemedView style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <ThemedView
                  style={[
                    styles.checkbox,
                    rememberMe && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                    { borderColor: theme.colors.border },
                  ]}
                >
                  {rememberMe && (
                    <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </ThemedView>
                <ThemedText variant="caption" color="secondary">
                  Remember me
                </ThemedText>
              </TouchableOpacity>
              <ThemedButton
                variant="ghost"
                size="sm"
                onPress={handleForgotPassword}
              >
                Forgot password?
              </ThemedButton>
            </ThemedView>

            {/* Sign In Button */}
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
                  onPress={handleSignin}
                  style={styles.signinButton}
                >
                  <ThemedText style={styles.buttonText}>
                    Sign In
                  </ThemedText>
                </ThemedButton>
              </LinearGradient>
            </ThemedView>

            {/* Social Login Divider */}
            <ThemedView style={styles.dividerContainer}>
              <ThemedView style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <ThemedText variant="caption" color="secondary" style={styles.dividerText}>
                or continue with
              </ThemedText>
              <ThemedView style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </ThemedView>

            {/* Social Login Buttons */}
            <ThemedView style={styles.socialContainer}>
              <ThemedButton
                variant="outline"
                size="md"
                onPress={() => Alert.alert('Google Sign In', 'Google sign in will be implemented soon.')}
                style={styles.socialButton}
              >
                <IconSymbol name="g.circle.fill" size={20} color={theme.colors.text} />
                <ThemedText variant="body" style={styles.socialButtonText}>
                  Google
                </ThemedText>
              </ThemedButton>
              <ThemedButton
                variant="outline"
                size="md"
                onPress={() => Alert.alert('Apple Sign In', 'Apple sign in will be implemented soon.')}
                style={styles.socialButton}
              >
                <IconSymbol name="applelogo" size={20} color={theme.colors.text} />
                <ThemedText variant="body" style={styles.socialButtonText}>
                  Apple
                </ThemedText>
              </ThemedButton>
            </ThemedView>

            {/* Sign Up Link */}
            <ThemedView style={styles.signupContainer}>
              <ThemedText variant="body" color="secondary">
                Don't have an account?{' '}
              </ThemedText>
              <ThemedButton
                variant="ghost"
                size="sm"
                onPress={() => router.push('/signup')}
              >
                Sign Up
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
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGradientWrapper: {
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
  signinButton: {
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});