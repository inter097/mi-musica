import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { CoverImage } from '../src/components/CoverImage';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import { useSubsonicQuery } from '../src/hooks/useSubsonicQuery';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function ArtistsScreen() {
  const { client } = useAuth();
  const router = useRouter();
  const artists = useSubsonicQuery((c) => c.getArtists());

  if (artists.loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionList
        contentContainerStyle={styles.content}
        sections={(artists.data ?? []).map((group) => ({ title: group.name, data: group.artist }))}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/artist/${item.id}`)}>
            <CoverImage uri={client?.getCoverArtUrl(item.coverArt)} size={48} rounded />
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              {item.albumCount !== undefined && (
                <Text style={styles.subtitle}>{item.albumCount} álbumes</Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing.xl * 2,
  },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
