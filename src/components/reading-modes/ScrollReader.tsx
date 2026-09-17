import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image as RNImage,
  ListViewToken,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { colors } from "../../theme/colors";
import { ReadingModeProps } from "./types";

/** Typical manga page ratio, used before the real size is known so pages
 * don't visually jump once measured. */
const FALLBACK_ASPECT_RATIO = 0.7;
/** On wide (web/tablet) viewports a full-width page reads uncomfortably
 * large, so the strip is capped and centered instead of stretching edge
 * to edge. */
const MAX_PAGE_WIDTH = 720;

function PageImage({ uri, width }: { uri: string; width: number }) {
  const [aspectRatio, setAspectRatio] = useState(FALLBACK_ASPECT_RATIO);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    RNImage.getSize(
      uri,
      (width, height) => {
        if (!cancelled && width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        // Leave the fallback ratio in place; the image will still load,
        // just with a generic-shaped placeholder until it does.
      }
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return (
    <View style={[styles.page, { width, aspectRatio }]}>
      <ExpoImage
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        transition={150}
        onLoadEnd={() => setLoaded(true)}
      />
      {!loaded && (
        <ActivityIndicator
          style={StyleSheet.absoluteFill}
          color={colors.textSecondary}
        />
      )}
    </View>
  );
}

/**
 * Continuous vertical scroll, one page after another - the classic
 * "long strip" reading mode. Other modes (paged/horizontal, webtoon with
 * no gaps, right-to-left, etc.) can implement the same ReadingModeProps
 * contract and register alongside this one in ./index.ts without the
 * reader screen needing to change.
 */
export function ScrollReader({ pageUrls, onPageChange, onReachEnd }: ReadingModeProps) {
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = Math.min(windowWidth, MAX_PAGE_WIDTH);
  const lastReportedIndex = useRef<number>(-1);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ListViewToken[] }) => {
      if (viewableItems.length === 0) return;
      const topMost = viewableItems[0].index ?? 0;
      if (topMost !== lastReportedIndex.current) {
        lastReportedIndex.current = topMost;
        onPageChange?.(topMost);
        if (topMost === pageUrls.length - 1) {
          onReachEnd?.();
        }
      }
    },
    [onPageChange, onReachEnd, pageUrls.length]
  );

  return (
    <FlatList
      data={pageUrls}
      keyExtractor={(url, index) => `${index}-${url}`}
      renderItem={({ item }) => <PageImage uri={item} width={pageWidth} />}
      showsVerticalScrollIndicator={false}
      initialNumToRender={3}
      maxToRenderPerBatch={2}
      windowSize={5}
      removeClippedSubviews
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    alignItems: "center",
  },
  page: {
    backgroundColor: colors.surface,
  },
});
