import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import TrackPlayer, { State, usePlaybackState, useActiveTrack } from 'react-native-track-player';
import { colors, fontSize, spacing } from '../constants/theme';
import { CoverImage } from './CoverImage';

export function MiniPlayer() {
  const router = useRouter();
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  if (!activeTrack) {
    return null;
  }

  const isPlaying = playbackState.state === State.Playing;

  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <Pressable style={styles.container} onPress={() => router.push('/player')}>
      <CoverImage uri={activeTrack.artwork} size={40} />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {activeTrack.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {activeTrack.artist}
        </Text>
      </View>
      <Pressable style={styles.button} onPress={togglePlay} hitSlop={8}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={colors.text} />
      </Pressable>
      <Pressable
        style={styles.button}
        hitSlop={8}
        onPress={async () => {
          try {
            await TrackPlayer.skipToNext();
          } catch {
            // No hay siguiente pista
          }
        }}
      >
        <Ionicons name="play-skip-forward" size={22} color={colors.text} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 8,
    padding: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  artist: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  button: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
