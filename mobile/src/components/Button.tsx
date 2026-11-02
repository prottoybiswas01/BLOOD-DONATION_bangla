import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { Colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: '#F1F5F9',
          border: 'transparent',
          text: Colors.mainText,
          spinner: Colors.mainText
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: Colors.appBorder,
          text: Colors.mainText,
          spinner: Colors.primary
        };
      case 'danger':
        return {
          bg: Colors.danger,
          border: 'transparent',
          text: '#FFFFFF',
          spinner: '#FFFFFF'
        };
      case 'teal':
        return {
          bg: Colors.tealAccent,
          border: 'transparent',
          text: '#FFFFFF',
          spinner: '#FFFFFF'
        };
      default:
        return {
          bg: Colors.primary,
          border: 'transparent',
          text: '#FFFFFF',
          spinner: '#FFFFFF'
        };
    }
  };

  const v = getVariantStyles();

  const getHeight = () => {
    if (size === 'sm') return 36;
    if (size === 'lg') return 52;
    return 46;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#E2E8F0' : v.bg,
          borderColor: v.border,
          height: getHeight(),
          borderWidth: variant === 'outline' ? 1.2 : 0,
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[
            styles.text,
            { color: disabled ? '#94A3B8' : v.text },
            size === 'sm' && styles.textSm,
            size === 'lg' && styles.textLg,
            icon ? { marginLeft: 8 } : {},
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 12,
  },
  textLg: {
    fontSize: 16,
  },
});
