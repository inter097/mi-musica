import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/theme';

interface CoverImageProps {
  uri?: string;
  size: number;
  rounded?: boolean;
}

export function CoverImage({ uri, size, rounded }: CoverImageProps) {
  const borderRadius = rounded ? size / 2 : radius.sm;
  const dimensionStyle = { width: size, height: size, borderRadius };

  if (!uri) {
    return (
      <View style={[styles.placeholder, dimensionStyle]}>
        <Ionicons name="musical-notes" size={size * 0.4} color={colors.textSubtle} />
      </View>
    );
  }

  return <Image source={{ uri }} style={dimensionStyle} contentFit="cover" transition={150} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
