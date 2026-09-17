import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/colors";
import { ChapterResource } from "../api/types";
import { chapterGroupNames, chapterLabel } from "../utils/mangadex";

interface Props {
  chapter: ChapterResource;
  onPress: (chapter: ChapterResource) => void;
}

export function ChapterRow({ chapter, onPress }: Props) {
  const groups = chapterGroupNames(chapter);
  const date = chapter.attributes.publishAt
    ? new Date(chapter.attributes.publishAt).toLocaleDateString()
    : undefined;

  return (
    <Pressable
      onPress={() => onPress(chapter)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.textCol}>
        <Text style={styles.label} numberOfLines={1}>
          {chapterLabel(chapter)}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[groups.join(", "), date].filter(Boolean).join(" \u00b7 ")}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  rowPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  textCol: {
    gap: 2,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
