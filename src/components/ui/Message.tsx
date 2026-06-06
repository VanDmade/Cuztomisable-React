// src/components/ui/Message.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, ViewStyle } from 'react-native';
import { useMessage } from '../../contexts/MessageContext';

const colors = {
  success: '#388E3C',
  danger: '#D32F2F',
  warning: '#FBC02D',
  info: '#1976D2',
} as const;

export function Message() {
  const { banner, clearMessage } = useMessage();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const visible = !!banner?.text;
  const message = banner?.text ?? '';
  const type = banner?.type ?? 'info';
  // Auto-dismiss timing
  const autoDuration = React.useMemo(() => {
    if (!message) return 0;
    const words = message.split(/\s+/).length;
    return Math.max(words * 250, 2500);
  }, [message]);
  useEffect(() => {
    if (visible) {
      // Slide down from top
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          clearMessage();
        });
      }, autoDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDuration, clearMessage, slideAnim]);
  if (!visible) {
    return null;
  }
  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateY: slideAnim }], backgroundColor: colors[type] }
    ]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  } as ViewStyle,
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
});