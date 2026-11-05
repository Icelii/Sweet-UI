import { InitialsPipe } from './initials-pipe';

describe('InitialsPipe', () => {
  const pipe = new InitialsPipe();

  it('uses the first letter of the first and second names', () => {
    expect(pipe.transform('Ana López')).toBe('AL');
  });

  it('uses the first surname when there are three or more words', () => {
    expect(pipe.transform('Ana María López Ruiz')).toBe('AL');
  });

  it('uses the first two letters of a single word', () => {
    expect(pipe.transform('iceli')).toBe('IC');
  });

  it('ignores extra spaces', () => {
    expect(pipe.transform('  carlos   méndez ')).toBe('CM');
  });

  it('returns ?? for empty values', () => {
    expect(pipe.transform('')).toBe('??');
    expect(pipe.transform('   ')).toBe('??');
    expect(pipe.transform(null)).toBe('??');
    expect(pipe.transform(undefined)).toBe('??');
  });
});
