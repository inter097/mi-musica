import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '../constants/theme';
import { MiniPlayer } from './MiniPlayer';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
}

/** Full-height container that keeps the mini player pinned to the bottom of the screen. */
export function Screen({ children, style, ...rest }: ScreenProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.content}>{children}</View>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
