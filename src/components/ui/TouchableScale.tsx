import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, StyleProp } from 'react-native';

interface TouchableScaleProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  activeScale?: number;
  disabled?: boolean;
}

export const TouchableScale: React.FC<TouchableScaleProps> = ({
  onPress,
  style,
  children,
  activeScale = 0.96,
  disabled = false,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleValue, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
