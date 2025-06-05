import { normalizeText } from '../index.js';

describe('normalizeText', () => {
  test('collapses whitespace', () => {
    const result = normalizeText('foo   bar\n\nbaz');
    expect(result).toBe('foo bar baz');
  });
});
