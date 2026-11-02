import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export interface BadgeProps {
  children?: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'teal' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'outline';
  size?: 'sm' | 'md';
  style?: any;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children,
  label,
  variant = 'neutral', 
  size = 'md',
  style
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: Colors.primaryLight, text: Colors.primary };
      case 'teal':
        return { bg: Colors.tealLight, text: Colors.tealAccent };
      case 'success':
        return { bg: Colors.successLight, text: Colors.success };
      case 'warning':
        return { bg: Colors.warningLight, text: Colors.warning };
      case 'danger':
        return { bg: Colors.dangerLight, text: Colors.danger };
      case 'info':
        return { bg: Colors.infoLight, text: Colors.info };
      case 'outline':
        return { bg: 'transparent', text: Colors.subText, border: Colors.appBorder };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View style={[
      styles.container, 
      { backgroundColor: c.bg, borderColor: c.border || 'transparent', borderWidth: c.border ? 1 : 0 },
      isSm ? styles.containerSm : styles.containerMd,
      style
    ]}>
      <Text style={[
        styles.text, 
        { color: c.text },
        isSm ? styles.textSm : styles.textMd
      ]}>
        {label || children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  containerMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: {
    fontWeight: '700',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
});
