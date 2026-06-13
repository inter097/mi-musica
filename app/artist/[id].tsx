import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CoverImage } from '../../src/components/CoverImage';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { useSubsonicQuery } from '../../src/hooks/useSubsonicQuery';
import { colors, fontSize, spacing } from '../../src/constants/theme';

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  const artist = useSubsonicQuery((c) => c.getArtist(id), [id]);

  useEffect(() => {
    if (artist.data?.name) {
      navigation.setOptions({ title: artist.data.name });
    }
  }, [artist.data?.name, navigation]);

  if (artist.loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={artist.data?.album ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <LinearGradient colors={[colors.surfaceHighlight, colors.background]} style={styles.header}>
            <CoverImage uri={client?.getCoverArtUrl(artist.data?.coverArt)} size={140} rounded />
            <Text style={styles.name}>{artist.data?.name}</Text>
            <Text style={styles.subtitle}>{artist.data?.albumCount ?? 0} álbumes</Text>
          </LinearGradient>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.albumRow} onPress={() => router.push(`/album/${item.id}`)}>
            <CoverImage uri={client?.getCoverArtUrl(item.coverArt)} size={56} />
            <View style={styles.albumText}>
              <Text style={styles.albumName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.albumSubtitle}>
                {item.year ?? ''} {item.songCount ? `· ${item.songCount} canciones` : ''}
              </Text>
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
  header: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  albumText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  albumName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  albumSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
