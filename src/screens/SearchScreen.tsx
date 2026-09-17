import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Search } from "../api/search";
import { Manga } from "../api/manga";
import { MangaResource } from "../api/types";
import { MangaCard } from "../components/MangaCard";
import { colors, radius, spacing, typography } from "../theme/colors";
import { DEFAULT_CONTENT_RATINGS } from "../utils/mangadex";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

const DISCOVER_COUNT = 6;
const SEARCH_DEBOUNCE_MS = 400;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MangaResource[] | null>(null);
  const [discover, setDiscover] = useState<MangaResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDiscover = useCallback(async () => {
    setDiscoverLoading(true);
    try {
      const picks = await Promise.all(
        Array.from({ length: DISCOVER_COUNT }).map(() =>
          Manga.random({
            includes: ["cover_art"],
            contentRating: DEFAULT_CONTENT_RATINGS,
          })
        )
      );
      setDiscover(picks.map((p) => p.data).filter(Boolean));
    } catch {
      // Discovery is a nicety, not core functionality - fail silently.
    } finally {
      setDiscoverLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscover();
  }, [loadDiscover]);

  const runSearch = useCallback(async (title: string) => {
    if (!title.trim()) {
      setResults(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await Search.search({
        title,
        limit: 20,
        includes: ["cover_art"],
        contentRating: DEFAULT_CONTENT_RATINGS,
      });
      setResults(data?.data ?? []);
    } catch (e) {
      setError("Couldn't reach MangaDex. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onChangeQuery = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), SEARCH_DEBOUNCE_MS);
  };

  const openSeries = (manga: MangaResource) => {
    navigation.navigate("Series", { mangaId: manga.id, title: manga.attributes.title.en });
  };

  const showingResults = results !== null;

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        onSubmitEditing={() => runSearch(query)}
        placeholder="Search manga by title\u2026"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
      />

      {showingResults ? (
        <FlatList
          data={results ?? []}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? undefined : (
              <Text style={styles.emptyText}>
                {error ?? "No results. Try a different title."}
              </Text>
            )
          }
          renderItem={({ item }) => <MangaCard manga={item} onPress={openSeries} />}
        />
      ) : (
        <FlatList
          data={discover}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Discover</Text>}
          ListEmptyComponent={
            discoverLoading ? undefined : (
              <Text style={styles.emptyText}>Nothing to show right now.</Text>
            )
          }
          renderItem={({ item }) => <MangaCard manga={item} onPress={openSeries} />}
        />
      )}

      {(loading || discoverLoading) && (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
  },
  input: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 16,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  loader: {
    position: "absolute",
    top: spacing.md + 20,
    alignSelf: "center",
  },
});
