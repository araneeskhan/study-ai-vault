import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToastConfig, ToastType } from './Toast.types';
import { useThemeUtils } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

interface ToastProps {
  config: ToastConfig;
  onHide: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ config, onHide }) => {
  const { theme } = useThemeUtils();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideToast();
    }, config.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(config.id);
    });
  };

  const getIconName = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          background: '#10B981',
          icon: '#ffffff',
          text: '#ffffff',
        };
      case 'error':
        return {
          background: '#EF4444',
          icon: '#ffffff',
          text: '#ffffff',
        };
      case 'warning':
        return {
          background: '#F59E0B',
          icon: '#ffffff',
          text: '#ffffff',
        };
      case 'info':
        return {
          background: '#3B82F6',
          icon: '#ffffff',
          text: '#ffffff',
        };
      default:
        return {
          background: theme.colors.primary,
          icon: '#ffffff',
          text: '#ffffff',
        };
    }
  };

  const colors = getColors(config.type);
  const position = config.position || 'top';

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: 50 };
      case 'bottom':
        return { bottom: 50 };
      case 'center':
        return { top: '50%', marginTop: -30 };
      default:
        return { top: 50 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          transform: [{ translateY }],
          opacity: fadeAnim,
        },
        getPositionStyle(),
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={getIconName(config.type) as any}
          size={24}
          color={colors.icon}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {config.title}
          </Text>
          {config.message && (
            <Text style={[styles.message, { color: colors.text }]}>
              {config.message}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
      {config.action && (
        <TouchableOpacity
          onPress={() => {
            config.action?.onPress();
            hideToast();
          }}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>
            {config.action.text}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});