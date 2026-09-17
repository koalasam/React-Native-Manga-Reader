import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Chapter } from "../api/chapter";
import { colors, radius, spacing, typography } from "../theme/colors";
import { DEFAULT_READING_MODE, READING_MODES } from "../components/reading-modes";
import { ReadingModeKey } from "../components/reading-modes/types";
import { ReadingModeSheet } from "../components/ReadingModeSheet";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Reader">;

export function ReaderScreen({ route, navigation }: Props) {
  const { chapters, currentIndex, mangaId } = route.params;
  const insets = useSafeAreaInsets();
  const current = chapters[currentIndex];

  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ReadingModeKey>(DEFAULT_READING_MODE);
  const [visiblePage, setVisiblePage] = useState(0);
  const [modePickerVisible, setModePickerVisible] = useState(false);
  const requestId = useRef(0);

  const loadChapter = useCallback(async (chapterId: string) => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    setVisiblePage(0);
    try {
      const atHome = await Chapter.atHomeServer(chapterId);
      const urls = Chapter.pageUrls(atHome, false);
      if (requestId.current === thisRequest) {
        setPageUrls(urls);
      }
    } catch (e) {
      if (requestId.current === thisRequest) {
        setError("Couldn't load this chapter's pages.");
      }
    } finally {
      if (requestId.current === thisRequest) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (current) loadChapter(current.id);
  }, [current, loadChapter]);

  const goToChapter = useCallback(
    (index: number) => {
      if (index < 0 || index >= chapters.length) return;
      navigation.setParams({ currentIndex: index });
    },
    [chapters.length, navigation]
  );

  const ActiveReader = READING_MODES[mode].Component;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>{"\u2039"} Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {current?.label ?? "Chapter"}
          </Text>
          {pageUrls.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {`Page ${Math.min(visiblePage + 1, pageUrls.length)} / ${pageUrls.length}`}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => setModePickerVisible(true)}
          hitSlop={12}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>{READING_MODES[mode].label}</Text>
        </Pressable>
      </View>

      <ReadingModeSheet
        visible={modePickerVisible}
        currentMode={mode}
        onSelect={setMode}
        onClose={() => setModePickerVisible(false)}
      />

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => current && loadChapter(current.id)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && pageUrls.length > 0 && (
        <ActiveReader
          pageUrls={pageUrls}
          onPageChange={setVisiblePage}
          onReachEnd={() => {
            if (currentIndex < chapters.length - 1) {
              goToChapter(currentIndex + 1);
            }
          }}
        />
      )}

      {!loading && !error && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Pressable
            disabled={currentIndex === 0}
            onPress={() => goToChapter(currentIndex - 1)}
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </Pressable>
          <Pressable
            disabled={currentIndex === chapters.length - 1}
            onPress={() => goToChapter(currentIndex + 1)}
            style={[
              styles.navButton,
              currentIndex === chapters.length - 1 && styles.navButtonDisabled,
            ]}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  headerButtonText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "600",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    maxWidth: 220,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
