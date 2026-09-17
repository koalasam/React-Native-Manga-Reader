import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { colors, radius, spacing, typography } from "../theme/colors";
import { MangaResource } from "../api/types";
import { coverImageUrl, mangaTitle } from "../utils/mangadex";

interface Props {
  manga: MangaResource;
  onPress: (manga: MangaResource) => void;
}

export function MangaCard({ manga, onPress }: Props) {
  const cover = coverImageUrl(manga, 256);
  const title = mangaTitle(manga);
  const { status, year } = manga.attributes;

  return (
    <Pressable
      onPress={() => onPress(manga)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.coverWrap}>
        {cover ? (
          <ExpoImage source={{ uri: cover }} style={styles.cover} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Text style={styles.coverFallbackText}>{title.slice(0, 1)}</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      <Text numberOfLines={1} style={styles.meta}>
        {[status, year].filter(Boolean).join(" \u00b7 ")}
      </Text>
    </Pressable>
  );
}

const CARD_WIDTH = 128;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
  },
  cardPressed: {
    opacity: 0.7,
  },
  coverWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  cover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.45,
  },
  coverFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  coverFallbackText: {
    color: colors.textMuted,
    fontSize: 32,
    fontWeight: "700",
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "capitalize",
  },
});
