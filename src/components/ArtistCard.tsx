import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { CoverImage } from './CoverImage';

const CARD_SIZE = 120;

interface ArtistCardProps {
  name: string;
  coverUrl?: string;
  onPress: () => void;
}

export function ArtistCard({ name, coverUrl, onPress }: ArtistCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <CoverImage uri={coverUrl} size={CARD_SIZE} rounded />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  name: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export { CARD_SIZE };
