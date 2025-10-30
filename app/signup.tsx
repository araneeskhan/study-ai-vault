import { useToast } from '@/components/toast/ToastProvider';
import { ThemedText, ThemedView } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeUtils } from '@/hooks/use-theme';
import { apiService } from '@/services/api.service';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;

export default function SignupScreen() {
  const { theme } = useThemeUtils();
  const router = useRouter();
  const { showToast } = useToast();
  const { login } = useAuth();

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
    decorativeContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    },
    sparkle: {
      position: 'absolute',
    },
    sparkleText: {
      fontSize: 14,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 40,
    },
    content: {
      width: '100%',
      maxWidth: 500,
      alignSelf: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    logoGradient: {
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    logoText: {
      color: '#FFFFFF',
      fontWeight: '900',
      letterSpacing: 1,
    },
    title: {
      fontWeight: '800',
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
    },
    formCard: {
      borderRadius: 24,
      borderColor: theme.colors.border,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    inputGroup: {
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
    },
    label: {
      fontWeight: '600',
      marginBottom: 8,
      fontSize: 13,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 52,
      borderWidth: 1,
      gap: 12,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },
    errorText: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '500',
    },
    strengthContainer: {
      marginTop: 8,
    },
    strengthBarBg: {
      height: 3,
      borderRadius: 2,
      overflow: 'hidden',
    },
    strengthBar: {
      height: '100%',
      borderRadius: 2,
    },
    buttonGradient: {
      borderRadius: 12,
      marginTop: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    signupButton: {
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    terms: {
      fontSize: 12,
      lineHeight: 18,
      opacity: 0.7,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    signinLink: {
      fontWeight: '700',
      fontSize: 16,
    },
  });
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
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Too short';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.password) {
      newErrors.password = 'Required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Min 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Does not match';
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

      console.log('Signup result:', result); // Debug log

      if (result.success) {
        // Store authentication data in AuthContext
        if (result.token && result.user) {
          await login(result.token, result.user);
        } else {
          console.error('Missing user or token in signup response:', result);
        }
        
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Account created successfully',
          duration: 3000,
        });
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: result.message,
          duration: 4000,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Unable to connect to server',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const responsiveStyles = {
    containerPadding: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
    logoSize: isSmallDevice ? 64 : isMediumDevice ? 72 : 80,
    titleSize: isSmallDevice ? 28 : isMediumDevice ? 32 : 36,
    cardPadding: isSmallDevice ? 20 : isMediumDevice ? 24 : 28,
  };

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.6, 0.2],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[
          theme.colors.primary + '08',
          theme.colors.background,
          theme.colors.background,
        ]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Subtle Sparkles Only */}
      <ThemedView style={styles.decorativeContainer}>
        {[...Array(4)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              {
                top: `${20 + i * 25}%`,
                right: `${10 + i * 20}%`,
                opacity: sparkleOpacity,
              }
            ]}
          >
            <ThemedText style={styles.sparkleText}>✨</ThemedText>
          </Animated.View>
        ))}
      </ThemedView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: responsiveStyles.containerPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header */}
            <ThemedView style={styles.header}>
              <ThemedView style={styles.logoContainer}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  style={[styles.logoGradient, { width: responsiveStyles.logoSize, height: responsiveStyles.logoSize }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={[styles.logoText, { fontSize: responsiveStyles.logoSize * 0.35 }]}>
                    AI
                  </ThemedText>
                </LinearGradient>
              </ThemedView>
              <ThemedText variant="h1" center style={[styles.title, { fontSize: responsiveStyles.titleSize }]}>
                Create Account
              </ThemedText>
              <ThemedText variant="body" center color="secondary" style={styles.subtitle}>
                Join the learning community
              </ThemedText>
            </ThemedView>

            {/* Form Card */}
            <ThemedView style={[
              styles.formCard, 
              { 
                backgroundColor: theme.colors.surface,
                padding: responsiveStyles.cardPadding,
              }
            ]}>
              {/* Full Name */}
              <ThemedView style={styles.inputGroup}>
                <ThemedText variant="caption" style={[styles.label, { backgroundColor: theme.colors.surface }]}>
                  Full Name
                </ThemedText>
                <ThemedView style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.fullName ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <IconSymbol
                    name="person.fill"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholder="John Doe"
                    placeholderTextColor={theme.colors.textTertiary + '80'}
                    value={formData.fullName}
                    onChangeText={(text) => updateFormData('fullName', text)}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </ThemedView>
                {errors.fullName && (
                  <ThemedText variant="caption" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.fullName}
                  </ThemedText>
                )}
              </ThemedView>

              {/* Email */}
              <ThemedView style={styles.inputGroup}>
                <ThemedText variant="caption" style={styles.label}>
                  Email
                </ThemedText>
                <ThemedView style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.email ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <IconSymbol
                    name="envelope.fill"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.textTertiary + '80'}
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </ThemedView>
                {errors.email && (
                  <ThemedText variant="caption" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.email}
                  </ThemedText>
                )}
              </ThemedView>

              {/* Password */}
              <ThemedView style={styles.inputGroup}>
                <ThemedText variant="caption" style={styles.label}>
                  Password
                </ThemedText>
                <ThemedView style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.password ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <IconSymbol
                    name="lock.fill"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text, flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textTertiary + '80'}
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    secureTextEntry={securePassword}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
                    <IconSymbol
                      name={securePassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </ThemedView>
                {formData.password.length > 0 && (
                  <ThemedView style={styles.strengthContainer}>
                    <ThemedView style={[styles.strengthBarBg, { backgroundColor: theme.colors.border }]}>
                      <ThemedView
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor: getPasswordStrengthColor(),
                            width: `${(getPasswordStrength() / 5) * 100}%`,
                          },
                        ]}
                      />
                    </ThemedView>
                  </ThemedView>
                )}
                {errors.password && (
                  <ThemedText variant="caption" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.password}
                  </ThemedText>
                )}
              </ThemedView>

              {/* Confirm Password */}
              <ThemedView style={styles.inputGroup}>
                <ThemedText variant="caption" style={styles.label}>
                  Confirm Password
                </ThemedText>
                <ThemedView style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border,
                  }
                ]}>
                  <IconSymbol
                    name="lock.fill"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text, flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textTertiary + '80'}
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    secureTextEntry={secureConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSignup}
                  />
                  <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}>
                    <IconSymbol
                      name={secureConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </ThemedView>
                {errors.confirmPassword && (
                  <ThemedText variant="caption" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.confirmPassword}
                  </ThemedText>
                )}
              </ThemedView>
              {/* Sign Up Button */}
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.buttonText}>
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </ThemedText>
                </TouchableOpacity>
              </LinearGradient>

              {/* Terms */}
              <ThemedText variant="caption" center color="secondary" style={styles.terms}>
                By signing up, you agree to our Terms and Privacy Policy
              </ThemedText>
            </ThemedView>

            {/* Sign In Link */}
            <ThemedView style={styles.footer}>
              <ThemedText color="secondary">Already have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.push('/signin')}>
                <ThemedText style={[styles.signinLink, { color: theme.colors.primary }]}>
                  Sign In
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
