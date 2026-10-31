// Activity heatmap helpers (gap 8: heatmap + achievement badges).
//
// Pure functions over practice-attempt timestamps. Days are UTC calendar
// days, matching the existing streak logic, which keys dates with
// `toISOString().slice(0, 10)`. Nothing here touches the database, so every
// rule below is unit-testable without a database connection.

export interface AttemptLike {
  createdAt: Date | string;
}

export interface DayCount {
  /** UTC date key, YYYY-MM-DD. */
  date: string;
  count: number;
}

export interface HeatmapCell {
  /** Null for padding cells outside the window, rendered blank. */
  date: string | null;
  count: number;
}

/** One calendar week, Monday first, always 7 cells. */
export type HeatmapWeek = HeatmapCell[];

/** 26 weeks of history, the standard heatmap window. */
export const HEATMAP_DAYS = 182;

/**
 * A week counts toward the weekly goal when it has at least this many
 * active days. Deliberately weekly, not daily: a missed day never wipes
 * anything, it only means that one week is not a goal week.
 */
export const WEEKLY_GOAL_DAYS = 3;

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);
  return day;
}

/** First UTC date in a window of `days` days ending on `today`. */
export function heatmapWindowStart(days: number, today: Date = new Date()): Date {
  const end = startOfUtcDay(today);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return start;
}

/**
 * Aggregate attempts into one count per UTC day. Every day in the window is
 * present (zero when quiet), oldest first. Attempts outside the window and
 * unparseable timestamps are ignored.
 */
export function aggregateAttemptsByDay(
  attempts: AttemptLike[],
  days: number = HEATMAP_DAYS,
  today: Date = new Date(),
): DayCount[] {
  const start = heatmapWindowStart(days, today);
  const startKey = toDateKey(start);
  const endKey = toDateKey(today);

  const counts = new Map<string, number>();
  for (const attempt of attempts) {
    const at = attempt.createdAt instanceof Date ? attempt.createdAt : new Date(attempt.createdAt);
    if (Number.isNaN(at.getTime())) continue;
    const key = toDateKey(at);
    if (key < startKey || key > endKey) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: DayCount[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    const key = toDateKey(day);
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

/** 0 = Monday ... 6 = Sunday, for a UTC date key. */
function mondayBasedDayIndex(dateKey: string): number {
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return (day + 6) % 7;
}

/**
 * Group day counts into Monday-first weeks. The first week is padded with
 * blank cells so it starts on Monday, and the last week is padded the same
 * way, so every week has exactly 7 cells and columns line up.
 */
export function buildHeatmapWeeks(days: DayCount[]): HeatmapWeek[] {
  if (days.length === 0) return [];

  const weeks: HeatmapWeek[] = [];
  let week: HeatmapWeek = [];
  for (let i = 0; i < mondayBasedDayIndex(days[0].date); i++) {
    week.push({ date: null, count: 0 });
  }
  for (const day of days) {
    week.push({ date: day.date, count: day.count });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push({ date: null, count: 0 });
    weeks.push(week);
  }
  return weeks;
}

/**
 * How many weeks have at least `target` active days. Weeks are independent:
 * a quiet week never subtracts from earlier goal weeks, and goal weeks do
 * not need to be consecutive. That is the forgiving rule behind the
 * steady-weeks badge.
 */
export function countGoalWeeks(weeks: HeatmapWeek[], target: number = WEEKLY_GOAL_DAYS): number {
  let goalWeeks = 0;
  for (const week of weeks) {
    const active = week.filter((cell) => cell.date !== null && cell.count > 0).length;
    if (active >= target) goalWeeks += 1;
  }
  return goalWeeks;
}

/** Active days in the week that contains `dateKey`; 0 when it is not in the window. */
export function countActiveDaysInWeekContaining(weeks: HeatmapWeek[], dateKey: string): number {
  for (const week of weeks) {
    if (week.some((cell) => cell.date === dateKey)) {
      return week.filter((cell) => cell.date !== null && cell.count > 0).length;
    }
  }
  return 0;
}
