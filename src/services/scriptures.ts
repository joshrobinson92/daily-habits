export interface BookMetadata {
  name: string;
  slug: string;
  chapters: number;
}

export interface VolumeMetadata {
  name: string;
  slug: string; // 'ot', 'nt', 'bofm', 'dc-testament', 'pgp'
  books: BookMetadata[];
}

export const SCRIPTURE_VOLUMES: VolumeMetadata[] = [
  {
    name: "Book of Mormon",
    slug: "bofm",
    books: [
      { name: "1 Nephi", slug: "1-ne", chapters: 22 },
      { name: "2 Nephi", slug: "2-ne", chapters: 33 },
      { name: "Jacob", slug: "jacob", chapters: 7 },
      { name: "Enos", slug: "enos", chapters: 1 },
      { name: "Jarom", slug: "jarom", chapters: 1 },
      { name: "Omni", slug: "omni", chapters: 1 },
      { name: "Words of Mormon", slug: "w-of-m", chapters: 1 },
      { name: "Mosiah", slug: "mosiah", chapters: 29 },
      { name: "Alma", slug: "alma", chapters: 63 },
      { name: "Helaman", slug: "helaman", chapters: 16 },
      { name: "3 Nephi", slug: "3-ne", chapters: 30 },
      { name: "4 Nephi", slug: "4-ne", chapters: 1 },
      { name: "Mormon", slug: "mormon", chapters: 9 },
      { name: "Ether", slug: "ether", chapters: 15 },
      { name: "Moroni", slug: "moroni", chapters: 10 }
    ]
  },
  {
    name: "New Testament",
    slug: "nt",
    books: [
      { name: "Matthew", slug: "matt", chapters: 28 },
      { name: "Mark", slug: "mark", chapters: 16 },
      { name: "Luke", slug: "luke", chapters: 24 },
      { name: "John", slug: "john", chapters: 21 },
      { name: "Acts", slug: "acts", chapters: 28 },
      { name: "Romans", slug: "rom", chapters: 16 },
      { name: "1 Corinthians", slug: "1-cor", chapters: 16 },
      { name: "2 Corinthians", slug: "2-cor", chapters: 13 },
      { name: "Galatians", slug: "gal", chapters: 6 },
      { name: "Ephesians", slug: "eph", chapters: 6 },
      { name: "Philippians", slug: "phil", chapters: 4 },
      { name: "Colossians", slug: "col", chapters: 4 },
      { name: "1 Thessalonians", slug: "1-thes", chapters: 5 },
      { name: "2 Thessalonians", slug: "2-thes", chapters: 3 },
      { name: "1 Timothy", slug: "1-tim", chapters: 6 },
      { name: "2 Timothy", slug: "2-tim", chapters: 4 },
      { name: "Titus", slug: "titus", chapters: 3 },
      { name: "Philemon", slug: "philem", chapters: 1 },
      { name: "Hebrews", slug: "heb", chapters: 13 },
      { name: "James", slug: "james", chapters: 5 },
      { name: "1 Peter", slug: "1-pet", chapters: 5 },
      { name: "2 Peter", slug: "2-pet", chapters: 3 },
      { name: "1 John", slug: "1-jn", chapters: 5 },
      { name: "2 John", slug: "2-jn", chapters: 1 },
      { name: "3 John", slug: "3-jn", chapters: 1 },
      { name: "Jude", slug: "jude", chapters: 1 },
      { name: "Revelation", slug: "rev", chapters: 22 }
    ]
  },
  {
    name: "Old Testament",
    slug: "ot",
    books: [
      { name: "Genesis", slug: "gen", chapters: 50 },
      { name: "Exodus", slug: "ex", chapters: 40 },
      { name: "Leviticus", slug: "lev", chapters: 27 },
      { name: "Numbers", slug: "num", chapters: 36 },
      { name: "Deuteronomy", slug: "deut", chapters: 34 },
      { name: "Joshua", slug: "josh", chapters: 24 },
      { name: "Judges", slug: "judg", chapters: 21 },
      { name: "Ruth", slug: "ruth", chapters: 4 },
      { name: "1 Samuel", slug: "1-sam", chapters: 31 },
      { name: "2 Samuel", slug: "2-sam", chapters: 24 },
      { name: "1 Kings", slug: "1-kgs", chapters: 22 },
      { name: "2 Kings", slug: "2-kgs", chapters: 25 },
      { name: "1 Chronicles", slug: "1-chr", chapters: 29 },
      { name: "2 Chronicles", slug: "2-chr", chapters: 36 },
      { name: "Ezra", slug: "ezra", chapters: 10 },
      { name: "Nehemiah", slug: "neh", chapters: 13 },
      { name: "Esther", slug: "esth", chapters: 10 },
      { name: "Job", slug: "job", chapters: 42 },
      { name: "Psalms", slug: "ps", chapters: 150 },
      { name: "Proverbs", slug: "prov", chapters: 31 },
      { name: "Ecclesiastes", slug: "eccl", chapters: 12 },
      { name: "Song of Solomon", slug: "song", chapters: 8 },
      { name: "Isaiah", slug: "isa", chapters: 66 },
      { name: "Jeremiah", slug: "jer", chapters: 52 },
      { name: "Lamentations", slug: "lam", chapters: 5 },
      { name: "Ezekiel", slug: "ezek", chapters: 48 },
      { name: "Daniel", slug: "dan", chapters: 12 },
      { name: "Hosea", slug: "hosea", chapters: 14 },
      { name: "Joel", slug: "joel", chapters: 3 },
      { name: "Amos", slug: "amos", chapters: 9 },
      { name: "Obadiah", slug: "obad", chapters: 1 },
      { name: "Jonah", slug: "jonah", chapters: 4 },
      { name: "Micah", slug: "micah", chapters: 7 },
      { name: "Nahum", slug: "nahum", chapters: 3 },
      { name: "Habakkuk", slug: "hab", chapters: 3 },
      { name: "Zephaniah", slug: "zeph", chapters: 3 },
      { name: "Haggai", slug: "hag", chapters: 2 },
      { name: "Zechariah", slug: "zech", chapters: 14 },
      { name: "Malachi", slug: "mal", chapters: 4 }
    ]
  },
  {
    name: "Doctrine and Covenants",
    slug: "dc-testament",
    books: [
      { name: "Doctrine and Covenants", slug: "dc", chapters: 138 },
      { name: "Official Declaration 1", slug: "od-1", chapters: 1 },
      { name: "Official Declaration 2", slug: "od-2", chapters: 1 }
    ]
  },
  {
    name: "Pearl of Great Price",
    slug: "pgp",
    books: [
      { name: "Moses", slug: "moses", chapters: 8 },
      { name: "Abraham", slug: "abr", chapters: 5 },
      { name: "Joseph Smith—Matthew", slug: "js-m", chapters: 1 },
      { name: "Joseph Smith—History", slug: "js-h", chapters: 1 },
      { name: "Articles of Faith", slug: "a-of-f", chapters: 1 }
    ]
  }
];

export interface ScripturePosition {
  volumeSlug: string;
  bookSlug: string;
  chapter: number;
}

/**
 * Returns the full name of a book and its volume given their slugs
 */
export function getScriptureNames(volumeSlug: string, bookSlug: string): { volumeName: string; bookName: string } {
  const volume = SCRIPTURE_VOLUMES.find(v => v.slug === volumeSlug);
  const book = volume?.books.find(b => b.slug === bookSlug);
  return {
    volumeName: volume?.name || volumeSlug,
    bookName: book?.name || bookSlug
  };
}

/**
 * Steps to the next chapter in the Standard Works
 */
export function getNextChapter(pos: ScripturePosition): ScripturePosition | null {
  const volume = SCRIPTURE_VOLUMES.find(v => v.slug === pos.volumeSlug);
  if (!volume) return null;

  const bookIndex = volume.books.findIndex(b => b.slug === pos.bookSlug);
  if (bookIndex === -1) return null;

  const currentBook = volume.books[bookIndex];

  // Case 1: Within the current book
  if (pos.chapter < currentBook.chapters) {
    return {
      volumeSlug: pos.volumeSlug,
      bookSlug: pos.bookSlug,
      chapter: pos.chapter + 1
    };
  }

  // Case 2: Move to the next book in the volume
  if (bookIndex < volume.books.length - 1) {
    const nextBook = volume.books[bookIndex + 1];
    return {
      volumeSlug: pos.volumeSlug,
      bookSlug: nextBook.slug,
      chapter: 1
    };
  }

  // Case 3: Completed the entire volume
  return null;
}

/**
 * Steps to the previous chapter in the Standard Works
 */
export function getPreviousChapter(pos: ScripturePosition): ScripturePosition | null {
  const volume = SCRIPTURE_VOLUMES.find(v => v.slug === pos.volumeSlug);
  if (!volume) return null;

  const bookIndex = volume.books.findIndex(b => b.slug === pos.bookSlug);
  if (bookIndex === -1) return null;

  // Case 1: Within the current book
  if (pos.chapter > 1) {
    return {
      volumeSlug: pos.volumeSlug,
      bookSlug: pos.bookSlug,
      chapter: pos.chapter - 1
    };
  }

  // Case 2: Move to the previous book in the volume
  if (bookIndex > 0) {
    const prevBook = volume.books[bookIndex - 1];
    return {
      volumeSlug: pos.volumeSlug,
      bookSlug: prevBook.slug,
      chapter: prevBook.chapters
    };
  }

  // Case 3: At the beginning of the volume
  return null;
}

/**
 * Generates the official reading URL for a scripture position
 */
export function getReadingUrl(pos: ScripturePosition): string {
  const base = "https://www.churchofjesuschrist.org/study/scriptures";
  
  if (pos.volumeSlug === "dc-testament") {
    if (pos.bookSlug === "od-1") {
      return `${base}/dc-testament/od/1?lang=eng`;
    }
    if (pos.bookSlug === "od-2") {
      return `${base}/dc-testament/od/2?lang=eng`;
    }
    return `${base}/dc-testament/dc/${pos.chapter}?lang=eng`;
  }
  
  return `${base}/${pos.volumeSlug}/${pos.bookSlug}/${pos.chapter}?lang=eng`;
}
