import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimestamp,
  findActiveSubtitle,
  findActiveSubtitleIndex,
  findActiveWord,
  calculateProgress,
} from './subtitleSync.ts';
import type { SubtitleItem } from '../types/index.ts';

const mockSubtitles: SubtitleItem[] = [
  {
    id: 's1',
    startTime: 1.0,
    endTime: 3.5,
    englishText: "Honestly, I don't know, Dad.",
    frenchText: "Honnêtement, je ne sais pas, papa.",
    words: [
      { text: 'Honestly,', startTime: 1.0, endTime: 1.8 },
      { text: 'I', startTime: 1.8, endTime: 2.1 },
      { text: "don't", startTime: 2.1, endTime: 2.5 },
      { text: 'know,', startTime: 2.5, endTime: 3.0 },
      { text: 'Dad.', startTime: 3.0, endTime: 3.5 },
    ],
  },
  {
    id: 's2',
    startTime: 4.5,
    endTime: 7.0,
    englishText: "I just feel like I'm not good enough.",
    frenchText: "J'ai juste l'impression de ne pas être assez bien.",
  },
];

test('formatTimestamp correctly formats seconds to mm:ss', () => {
  assert.equal(formatTimestamp(0), '00:00');
  assert.equal(formatTimestamp(84), '01:24');
  assert.equal(formatTimestamp(225), '03:45');
  assert.equal(formatTimestamp(-5), '00:00');
  assert.equal(formatTimestamp(NaN), '00:00');
});

test('findActiveSubtitle finds active item during speech', () => {
  const active = findActiveSubtitle(mockSubtitles, 2.0);
  assert.ok(active);
  assert.equal(active?.id, 's1');
});

test('findActiveSubtitle returns null before first item', () => {
  const active = findActiveSubtitle(mockSubtitles, 0.5);
  assert.equal(active, null);
});

test('findActiveSubtitle finds second item', () => {
  const active = findActiveSubtitle(mockSubtitles, 5.0);
  assert.ok(active);
  assert.equal(active?.id, 's2');
});

test('findActiveWord returns specific word when timestamp is within range', () => {
  const word = findActiveWord(mockSubtitles[0], 1.2);
  assert.ok(word);
  assert.equal(word?.text, 'Honestly,');

  const word2 = findActiveWord(mockSubtitles[0], 2.2);
  assert.ok(word2);
  assert.equal(word2?.text, "don't");
});

test('findActiveWord returns null if subtitle has no words timing', () => {
  const word = findActiveWord(mockSubtitles[1], 5.0);
  assert.equal(word, null);
});

test('calculateProgress calculates correct percentages', () => {
  assert.equal(calculateProgress(0, 12), 8);
  assert.equal(calculateProgress(2, 12), 25);
  assert.equal(calculateProgress(11, 12), 100);
});
