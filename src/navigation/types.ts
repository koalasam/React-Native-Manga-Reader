export type ChapterNavEntry = {
  id: string;
  label: string;
};

export type RootStackParamList = {
  Search: undefined;
  Series: {
    mangaId: string;
    title?: string;
  };
  Reader: {
    mangaId: string;
    /** All English chapters for the series, in reading order, so the
     * reader screen can offer next/previous chapter without refetching. */
    chapters: ChapterNavEntry[];
    currentIndex: number;
  };
};
