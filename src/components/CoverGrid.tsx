import React from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { CoverImage } from './CoverImage';

const screenWidth = Dimensions.get('window').width;
const COLUMNS = 2;
const GAP = spacing.md;
const ITEM_WIDTH = (screenWidth - spacing.md * (COLUMNS + 1)) / COLUMNS;

export interface CoverGridItem {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
}

interface CoverGridProps {
  data: CoverGridItem[];
  onPressItem: (item: CoverGridItem) => void;
  rounded?: boolean;
}

export function CoverGrid({ data, onPressItem, rounded }: CoverGridProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Pressable style={styles.item} onPress={() => onPressItem(item)}>
          <CoverImage uri={item.coverUrl} size={ITEM_WIDTH} rounded={rounded} />
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  row: {
    gap: GAP,
    marginBottom: spacing.md,
  },
  item: {
    width: ITEM_WIDTH,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
