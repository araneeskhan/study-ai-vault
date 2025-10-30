import { ThemedButton, ThemedText, ThemedView } from '@/components/ui';
import { useThemeUtils } from '@/hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;

export default function LandingPage() {
  const { theme } = useThemeUtils();
  const router = useRouter();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  // Typewriter effect
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Share Knowledge, Learn Together';
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      // Reset after a pause
      const resetTimeout = setTimeout(() => {
        setDisplayText('');
        setCurrentIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex]);
  
  const handleGetStarted = () => {
    router.push('/signup');
  };
  
  const responsiveStyles = {
    heroSection: {
      paddingHorizontal: isSmallDevice ? 20 : isMediumDevice ? 32 : 48,
      paddingVertical: isSmallDevice ? 40 : isMediumDevice ? 60 : 80,
    },
    logoSize: isSmallDevice ? 48 : isMediumDevice ? 64 : 72,
    mainTitleSize: isSmallDevice ? 32 : isMediumDevice ? 42 : 48,
    subTitleSize: isSmallDevice ? 32 : isMediumDevice ? 42 : 48,
    descriptionSize: isSmallDevice ? 15 : 16,
    maxDescriptionWidth: isSmallDevice ? 280 : isMediumDevice ? 360 : 440,
  };

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.5],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        
        {/* Animated Background Gradient */}
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

        {/* Decorative Elements */}
        <ThemedView style={styles.decorativeContainer}>
          {/* AI Sparkles */}
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.sparkle,
                {
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 18}%`,
                  transform: [{ scale: sparkleScale }],
                  opacity: sparkleOpacity,
                }
              ]}
            >
              <ThemedText style={styles.sparkleText}>✨</ThemedText>
            </Animated.View>
          ))}
          
          {/* Grid Pattern */}
          <ThemedView style={styles.gridPattern}>
            {[...Array(6)].map((_, i) => (
              <ThemedView 
                key={i} 
                style={[
                  styles.gridLine, 
                  { backgroundColor: theme.colors.border + '30' }
                ]} 
              />
            ))}
          </ThemedView>
        </ThemedView>
        
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection, 
            responsiveStyles.heroSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          
          {/* Logo with Glow Effect */}
          <ThemedView style={styles.logoContainer}>
            <ThemedView style={styles.logoWrapper}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                style={[
                  styles.logoBackground,
                  { 
                    width: responsiveStyles.logoSize, 
                    height: responsiveStyles.logoSize 
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText 
                  variant="h3" 
                  style={[
                    styles.logoText,
                    { fontSize: responsiveStyles.logoSize * 0.42 }
                  ]}
                >
                  AI
                </ThemedText>
              </LinearGradient>
              <ThemedView style={[
                styles.logoGlow,
                { 
                  width: responsiveStyles.logoSize + 8, 
                  height: responsiveStyles.logoSize + 8,
                  backgroundColor: theme.colors.primary + '30'
                }
              ]} />
            </ThemedView>
            <ThemedText 
              variant="h2" 
              style={[
                styles.appName,
                { fontSize: responsiveStyles.logoSize * 0.58 }
              ]}
            >
              Study Vault
            </ThemedText>
          </ThemedView>
          
          {/* Main Headline with Gradient */}
          <ThemedView style={styles.headlineContainer}>
            <ThemedText 
              variant="h1" 
              center 
              style={[
                styles.mainTitle,
                { fontSize: responsiveStyles.subTitleSize }
              ]}
            >
              Personal Space
            </ThemedText>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTextWrapper}
            >
         
            </LinearGradient>
          </ThemedView>

          {/* Typewriter Text */}
          <ThemedView style={styles.typewriterContainer}>
            <ThemedText 
              center 
              style={[
                styles.typewriterText,
                { color: theme.colors.accent }
              ]}
            >
              {displayText}
              <ThemedText style={styles.cursor}>|</ThemedText>
            </ThemedText>
          </ThemedView>
          
          {/* Description */}
          <ThemedText 
            variant="body" 
            center 
            color="secondary" 
            style={[
              styles.description,
              { 
                fontSize: responsiveStyles.descriptionSize,
                maxWidth: responsiveStyles.maxDescriptionWidth
              }
            ]}
          >
          
          </ThemedText>
          
          {/* Feature Tags */}
          <ThemedView style={styles.featureTags}>
            {[
              { icon: '📚', text: 'Library' },
              { icon: '🤝', text: 'Community' },
            ].map((tag) => (
              <ThemedView 
                key={tag.text}
                style={[
                  styles.tag,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }
                ]}
              >
                <ThemedText style={styles.tagIcon}>{tag.icon}</ThemedText>
                <ThemedText 
                  variant="caption" 
                  style={styles.tagText}
                >
                  {tag.text}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
          
       
          
        </Animated.View>
        
      </ScrollView>
      
      {/* CTA Button at Bottom */}
      <ThemedView style={styles.bottomCtaContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomButtonGradient}
        >
          <ThemedButton 
            variant="primary" 
            size="lg" 
            onPress={handleGetStarted}
            style={styles.bottomGetStartedButton}
          >
            <ThemedText style={styles.buttonText}>
              Start Learning Together →
            </ThemedText>
          </ThemedButton>
        </LinearGradient>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
  },
  gradient: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  // Logo Styles
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 120,
    gap: 16,
  },
  logoWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBackground: {
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
    borderRadius: 24,
    opacity: 0.3,
    zIndex: -1,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
  appName: {
    fontWeight: '800',
    letterSpacing: 0.5,
    
  },
  
  // Headline Styles
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    marginBottom: 8,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gradientTextWrapper: {
    borderRadius: 8,
  },
  subTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Typewriter Effect
  typewriterContainer: {
    minHeight: 36,
    marginBottom: 24,
    justifyContent: 'center',
  },
  typewriterText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cursor: {
    opacity: 0.7,
  },
  
  // Description
  description: {
    marginBottom: 32,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  
  // Feature Tags
  featureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    gap: 8,
  },
  tagIcon: {
    fontSize: 18,
  },
  tagText: {
    fontWeight: '600',
    fontSize: 13,
  },
  
  // Trust Indicators
  trustIndicators: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  trustItem: {
    alignItems: 'center',
    gap: 6,
  },
  trustIcon: {
    fontSize: 24,
  },
  trustText: {
    fontSize: 12,
    textAlign: 'center',
  },
  
  // Decorative Elements
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 20,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.03,
  },
  gridLine: {
    width: 1,
    height: '100%',
  },
  
  // Bottom CTA Styles
  bottomCtaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  bottomButtonGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomGetStartedButton: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});