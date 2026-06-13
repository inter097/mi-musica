import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  onPressSeeAll?: () => void;
}

export function SectionHeader({ title, onPressSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onPressSeeAll ? (
        <Pressable onPress={onPressSeeAll}>
          <Text style={styles.seeAll}>Ver todo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  seeAll: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
