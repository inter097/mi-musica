import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { formatDuration } from '../utils/format';
import { CoverImage } from './CoverImage';

interface TrackRowProps {
  index?: number;
  title: string;
  subtitle?: string;
  coverUrl?: string;
  duration?: number;
  active?: boolean;
  onPress: () => void;
}

export function TrackRow({ index, title, subtitle, coverUrl, duration, active, onPress }: TrackRowProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {index !== undefined ? (
        <Text style={[styles.index, active && styles.activeText]}>{index}</Text>
      ) : (
        <CoverImage uri={coverUrl} size={44} />
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.title, active && styles.activeText]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={styles.duration}>{formatDuration(duration)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  index: {
    width: 44,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  duration: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  activeText: {
    color: colors.primary,
  },
});
