import { ScrollReader } from "./ScrollReader";
import { ReadingModeDefinition, ReadingModeKey } from "./types";

/**
 * Single source of truth for which reading modes exist. To add a new mode
 * (e.g. a horizontal pager, or a "webtoon" gapless strip):
 *   1. Build a component implementing ReadingModeProps (see ./types.ts).
 *   2. Add one entry below with a unique key.
 * The reader screen, the mode-picker UI, and persistence all read from
 * this object, so nothing else needs to change.
 */
export const READING_MODES: Record<ReadingModeKey, ReadingModeDefinition> = {
  scroll: {
    key: "scroll",
    label: "Scroll",
    description: "Continuous vertical strip, top to bottom.",
    Component: ScrollReader,
  },
};

export const DEFAULT_READING_MODE: ReadingModeKey = "scroll";

export * from "./types";
