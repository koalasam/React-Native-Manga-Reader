export interface ReadingModeProps {
  /** Ordered, ready-to-render page image URLs for the current chapter. */
  pageUrls: string[];
  /** Called with the (0-based) page index whenever the reader's best guess
   * at "the page currently being read" changes. Optional for modes that
   * don't track this. */
  onPageChange?: (index: number) => void;
  /** Called when the reader taps/advances past the final page. Modes that
   * have a natural "end" (e.g. a pager) can use this to trigger a
   * next-chapter prompt; scroll-style modes can leave it unused. */
  onReachEnd?: () => void;
}

export type ReadingModeKey = "scroll";

export interface ReadingModeDefinition {
  key: ReadingModeKey;
  label: string;
  description: string;
  Component: React.ComponentType<ReadingModeProps>;
}
