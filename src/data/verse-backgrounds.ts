// Photographs behind the verse of the day (from The Word, in public/verse). The same verse always
// gets the same photo, on the page and in its share image. `dark` photos need a lighter veil.
export const verseBackgrounds = [
  { file: 'cross-black.jpg', dark: true },
  { file: 'man-reading-bible-black.jpg', dark: true },
  { file: 'flowers-color.jpg', dark: false },
  { file: 'flowers-1-color.jpg', dark: false },
  { file: 'lamb-color.jpg', dark: false },
  { file: 'mountains-color.jpg', dark: false },
  { file: 'roman-structure-color.jpg', dark: false },
  { file: 'sunset-color.jpg', dark: false },
  { file: 'sunset-1-color.jpg', dark: false },
  { file: 'valley-color.jpg', dark: false },
] as const;

export type VerseBackground = (typeof verseBackgrounds)[number];

/** A stable photo for a verse reference (the same rule The Word uses). */
export function backgroundFor(reference: string): VerseBackground {
  let total = 0;
  for (let index = 0; index < reference.length; index += 1) total += reference.charCodeAt(index) * (index + 1);
  return verseBackgrounds[total % verseBackgrounds.length];
}
