import { addMonths, buildMonthGrid, compareDays, daysInMonth, isSameDay, toDate } from './date-utils';

describe('date utils', () => {
  it('keeps the day inside the target month when adding months', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2028, 0, 31), 1)).toEqual(new Date(2028, 1, 29));
    expect(addMonths(new Date(2026, 2, 15), -3)).toEqual(new Date(2025, 11, 15));
  });

  it('counts the days of a month', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2026, 11)).toBe(31);
  });

  it('compares only the calendar day', () => {
    expect(isSameDay(new Date(2026, 4, 3, 8), new Date(2026, 4, 3, 22))).toBe(true);
    expect(compareDays(new Date(2026, 4, 3, 23), new Date(2026, 4, 4, 1))).toBeLessThan(0);
  });

  it('reads YYYY-MM-DD as a local date', () => {
    expect(toDate('2026-11-04')).toEqual(new Date(2026, 10, 4));
    expect(toDate('')).toBeNull();
    expect(toDate('not a date')).toBeNull();
  });

  it('builds a 6-week grid starting on the chosen weekday', () => {
    const grid = buildMonthGrid(2026, 10, 1); // November 2026, weeks start on Monday
    expect(grid).toHaveLength(42);
    expect(grid[0].getDay()).toBe(1);
    expect(grid[0]).toEqual(new Date(2026, 9, 26));
  });
});
