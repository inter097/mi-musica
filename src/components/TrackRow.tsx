import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
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
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  downloaded?: boolean;
  downloadProgress?: number;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function TrackRow({
  index,
  title,
  subtitle,
  coverUrl,
  duration,
  active,
  onPress,
  isFavorite,
  onToggleFavorite,
  downloaded,
  downloadProgress,
  onDownload,
  onDelete,
}: TrackRowProps) {
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
      {onToggleFavorite ? (
        <Pressable
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? colors.primary : colors.textMuted}
          />
        </Pressable>
      ) : null}
      {onDownload ? (
        <Pressable
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            if (!downloaded && downloadProgress === undefined) onDownload();
          }}
          hitSlop={8}
        >
          {downloadProgress !== undefined ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <Ionicons
              name={downloaded ? 'checkmark-circle' : 'download-outline'}
              size={18}
              color={downloaded ? colors.primary : colors.textMuted}
            />
          )}
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      ) : null}
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
  iconButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});
