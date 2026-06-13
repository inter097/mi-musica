import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { CoverImage } from './CoverImage';

const CARD_WIDTH = 140;

interface AlbumCardProps {
  title: string;
  subtitle?: string;
  coverUrl?: string;
  onPress: () => void;
}

export function AlbumCard({ title, subtitle, coverUrl, onPress }: AlbumCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <CoverImage uri={coverUrl} size={CARD_WIDTH} />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  textContainer: {
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});

export { CARD_WIDTH };
