import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Manga } from "../api/manga";
import { ChapterResource, MangaResource } from "../api/types";
import { ChapterRow } from "../components/ChapterRow";
import { colors, radius, spacing, typography } from "../theme/colors";
import {
  DEFAULT_CONTENT_RATINGS,
  coverImageUrl,
  mangaDescription,
  mangaTitle,
  relationshipNames,
  sortChaptersAscending,
  chapterLabel,
} from "../utils/mangadex";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Series">;

const FEED_PAGE_SIZE = 500;

/** Fetches every English-translated chapter for a series, following
 * MangaDex's offset pagination until it has them all. */
async function fetchAllEnglishChapters(mangaId: string): Promise<ChapterResource[]> {
  const chapters: ChapterResource[] = [];
  let offset = 0;
  // MangaDex reports `total` in the first response; loop until we've
  // fetched that many (or the API stops returning anything).
  let total = Infinity;

  while (offset < total) {
    const page = await Manga.feed(mangaId, {
      translatedLanguage: ["en"],
      contentRating: DEFAULT_CONTENT_RATINGS,
      order: { chapter: "asc" },
      includes: ["scanlation_group"],
      limit: FEED_PAGE_SIZE,
      offset,
    });
    const data: ChapterResource[] = page?.data ?? [];
    chapters.push(...data);
    total = typeof page?.total === "number" ? page.total : chapters.length;
    if (data.length === 0) break;
    offset += FEED_PAGE_SIZE;
  }

  return sortChaptersAscending(chapters);
}

export function SeriesScreen({ route, navigation }: Props) {
  const { mangaId } = route.params;
  const [manga, setManga] = useState<MangaResource | null>(null);
  const [chapters, setChapters] = useState<ChapterResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mangaResponse, chapterList] = await Promise.all([
        Manga.get(mangaId, ["cover_art", "author", "artist"]),
        fetchAllEnglishChapters(mangaId),
      ]);
      setManga(mangaResponse?.data ?? null);
      setChapters(chapterList);
    } catch (e) {
      setError("Couldn't load this series. Pull down to try again.");
    } finally {
      setLoading(false);
    }
  }, [mangaId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (manga) {
      navigation.setOptions({ title: mangaTitle(manga) });
    }
  }, [manga, navigation]);

  const openChapter = (chapter: ChapterResource) => {
    const index = chapters.findIndex((c) => c.id === chapter.id);
    navigation.navigate("Reader", {
      mangaId,
      currentIndex: index === -1 ? 0 : index,
      chapters: chapters.map((c) => ({ id: c.id, label: chapterLabel(c) })),
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (error || !manga) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Series not found."}</Text>
      </View>
    );
  }

  const cover = coverImageUrl(manga, 512);
  const authors = relationshipNames(manga.relationships, "author");
  const description = mangaDescription(manga);

  return (
    <FlatList
      data={chapters}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {cover && (
              <ExpoImage source={{ uri: cover }} style={styles.cover} contentFit="cover" />
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{mangaTitle(manga)}</Text>
              {authors.length > 0 && (
                <Text style={styles.authors} numberOfLines={2}>
                  {authors.join(", ")}
                </Text>
              )}
              <View style={styles.badgeRow}>
                {manga.attributes.status && (
                  <Text style={styles.badge}>{manga.attributes.status}</Text>
                )}
                {manga.attributes.year && (
                  <Text style={styles.badge}>{manga.attributes.year}</Text>
                )}
              </View>
            </View>
          </View>
          {description && (
            <Text style={styles.description} numberOfLines={6}>
              {description}
            </Text>
          )}
          <Text style={styles.chaptersHeading}>
            {`Chapters (${chapters.length}) \u00b7 English`}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No English chapters available yet.</Text>
      }
      renderItem={({ item }) => <ChapterRow chapter={item} onPress={openChapter} />}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  listContent: {
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  cover: {
    width: 110,
    height: 158,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "center",
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  authors: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  badge: {
    ...typography.caption,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    textTransform: "capitalize",
    overflow: "hidden",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  chaptersHeading: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
