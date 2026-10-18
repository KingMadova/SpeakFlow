import type { SubtitleItem, WordTiming } from '../types/index.ts';

/**
 * Formats seconds into mm:ss (e.g. 84s -> "01:24")
 */
export function formatTimestamp(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Finds the currently active subtitle item for a given playback time.
 * If playback falls slightly in a small pause between consecutive items (<0.8s),
 * keeps the last active item so the reader doesn't flicker violently.
 */
export function findActiveSubtitle(
  subtitles: SubtitleItem[],
  currentTime: number
): SubtitleItem | null {
  if (!subtitles || subtitles.length === 0) return null;

  // Exact match first
  for (let i = 0; i < subtitles.length; i++) {
    const item = subtitles[i];
    if (currentTime >= item.startTime && currentTime <= item.endTime) {
      return item;
    }
  }

  // Grace period match: if within 0.8s after a subtitle and before the next one
  for (let i = 0; i < subtitles.length; i++) {
    const item = subtitles[i];
    const nextItem = subtitles[i + 1];
    if (currentTime > item.endTime && currentTime <= item.endTime + 0.8) {
      if (!nextItem || currentTime < nextItem.startTime) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Finds the index of the active subtitle or the nearest one
 */
export function findActiveSubtitleIndex(
  subtitles: SubtitleItem[],
  currentTime: number
): number {
  const active = findActiveSubtitle(subtitles, currentTime);
  if (!active) {
    // If not strictly active, find the closest preceding subtitle
    for (let i = subtitles.length - 1; i >= 0; i--) {
      if (currentTime >= subtitles[i].startTime) {
        return i;
      }
    }
    return 0;
  }
  return subtitles.findIndex((s) => s.id === active.id);
}

/**
 * Finds the active word timing inside a subtitle if word timings exist.
 */
export function findActiveWord(
  subtitle: SubtitleItem | null,
  currentTime: number
): WordTiming | null {
  if (!subtitle || !subtitle.words || subtitle.words.length === 0) {
    return null;
  }

  for (let i = 0; i < subtitle.words.length; i++) {
    const word = subtitle.words[i];
    if (currentTime >= word.startTime && currentTime <= word.endTime) {
      return word;
    }
  }

  // If between words, match current interval
  for (let i = 0; i < subtitle.words.length - 1; i++) {
    const cur = subtitle.words[i];
    const next = subtitle.words[i + 1];
    if (currentTime >= cur.endTime && currentTime < next.startTime) {
      return cur;
    }
  }

  return null;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(currentIdx: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.min(100, Math.round(((currentIdx + 1) / totalCount) * 100));
}
