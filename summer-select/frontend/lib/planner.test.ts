import { describe, expect, it } from "vitest";
import {
  buildEvents,
  buildIcs,
  cycleMonths,
  cycleWindow,
  daysBetween,
  daysUntil,
  groupEventsByMonth,
  icsFold,
  isStatusDone,
  parseDate,
  sortEntries,
  totalApplicationFees,
  upcomingDeadlines,
  urgencyOf,
} from "./planner";

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("parseDate", () => {
  it("parses calendar dates and ISO timestamps as local dates", () => {
    expect(parseDate("2027-01-15")).toEqual(day(2027, 1, 15));
    expect(parseDate("2027-01-15T23:59:00Z")).toEqual(day(2027, 1, 15));
  });

  it.each([null, undefined, "", "soon", "2027-13-01", "2027-02-31"])("rejects %s", (v) => {
    expect(parseDate(v as string | null | undefined)).toBeNull();
  });
});

describe("daysBetween / daysUntil", () => {
  it("counts calendar days regardless of time of day", () => {
    expect(daysBetween(new Date(2026, 9, 9, 23, 59), new Date(2026, 9, 10, 0, 1))).toBe(1);
    expect(daysUntil("2026-10-19", day(2026, 10, 9))).toBe(10);
    expect(daysUntil("2026-10-01", day(2026, 10, 9))).toBe(-8);
    expect(daysUntil("nope", day(2026, 10, 9))).toBeNull();
  });

  it("is not thrown off by daylight-saving changes", () => {
    expect(daysBetween(day(2026, 3, 7), day(2026, 3, 9))).toBe(2);
    expect(daysBetween(day(2026, 10, 31), day(2026, 11, 2))).toBe(2);
  });
});

describe("urgencyOf", () => {
  it.each([
    [-1, "passed"],
    [0, "today"],
    [1, "urgent"],
    [7, "urgent"],
    [8, "soon"],
    [30, "soon"],
    [31, "upcoming"],
  ] as const)("%i days is %s", (days, expected) => expect(urgencyOf(days)).toBe(expected));
});

describe("cycleWindow", () => {
  it("is the current year to next year from August on", () => {
    const w = cycleWindow(day(2026, 10, 9));
    expect(w.label).toBe("2026–2027");
    expect(w.start).toEqual(day(2026, 8, 1));
    expect(w.end).toEqual(day(2027, 8, 31));
    expect(cycleWindow(day(2026, 8, 1)).label).toBe("2026–2027");
  });

  it("keeps the same cycle through the following spring and summer", () => {
    expect(cycleWindow(day(2027, 3, 15)).label).toBe("2026–2027");
    expect(cycleWindow(day(2027, 7, 31)).label).toBe("2026–2027");
    expect(cycleWindow(day(2027, 8, 1)).label).toBe("2027–2028");
  });

  it("covers 13 months from August to August", () => {
    const months = cycleMonths(cycleWindow(day(2026, 10, 9)));
    expect(months).toHaveLength(13);
    expect(months[0].key).toBe("2026-08");
    expect(months[5].key).toBe("2027-01");
    expect(months[12].key).toBe("2027-08");
  });
});

const programs = [
  { lid: "a", application_open_date: "2026-09-01", priority_deadline: "2026-11-15", regular_deadline: "2027-01-10" },
  { lid: "b", application_open_date: null, priority_deadline: null, regular_deadline: "2027-02-01" },
  { lid: "c", application_open_date: null, priority_deadline: null, regular_deadline: null },
  { lid: "d", application_open_date: null, priority_deadline: null, regular_deadline: "2026-03-01" },
];

describe("buildEvents", () => {
  it("creates one event per usable date, sorted by date", () => {
    const events = buildEvents(programs);
    expect(events.map((e) => `${e.programId}:${e.kind}`)).toEqual([
      "d:regular",
      "a:opens",
      "a:priority",
      "a:regular",
      "b:regular",
    ]);
  });

  it("skips programs with no dates and invalid dates", () => {
    expect(buildEvents([programs[2]])).toEqual([]);
    expect(buildEvents([{ ...programs[2], regular_deadline: "TBD" }])).toEqual([]);
  });
});

describe("upcomingDeadlines", () => {
  const events = buildEvents(programs);
  const today = day(2026, 10, 9);

  it("returns future deadlines only, never opening dates", () => {
    expect(upcomingDeadlines(events, today).map((e) => e.id)).toEqual([
      "a:priority:2026-11-15",
      "a:regular:2027-01-10",
      "b:regular:2027-02-01",
    ]);
  });

  it("counts a deadline that is today", () => {
    expect(upcomingDeadlines(events, day(2026, 11, 15))[0].id).toBe("a:priority:2026-11-15");
  });

  it("can skip programs the user has finished with", () => {
    expect(upcomingDeadlines(events, today, new Set(["a"])).map((e) => e.programId)).toEqual(["b"]);
  });
});

describe("groupEventsByMonth", () => {
  it("groups in-cycle events by month and separates the rest", () => {
    const { months, outside } = groupEventsByMonth(buildEvents(programs), cycleWindow(day(2026, 10, 9)));
    expect(months.map((m) => [m.key, m.events.length])).toEqual([
      ["2026-09", 1],
      ["2026-11", 1],
      ["2027-01", 1],
      ["2027-02", 1],
    ]);
    expect(outside.map((e) => e.programId)).toEqual(["d"]);
  });
});

describe("sortEntries", () => {
  const entries = [
    { programId: "1", name: "Bravo", rating: 3, createdAt: "2026-01-02", nextDeadline: "2027-02-01" },
    { programId: "2", name: "Alpha", rating: null, createdAt: "2026-03-01", nextDeadline: null },
    { programId: "3", name: "Charlie", rating: 5, createdAt: "2026-02-01", nextDeadline: "2026-11-15" },
  ];
  const ids = (mode: Parameters<typeof sortEntries>[1]) => sortEntries(entries, mode).map((e) => e.programId);

  it("sorts by soonest deadline, undated last", () => expect(ids("deadline")).toEqual(["3", "1", "2"]));
  it("sorts by rating, unrated last", () => expect(ids("rating")).toEqual(["3", "1", "2"]));
  it("sorts by most recently added", () => expect(ids("added")).toEqual(["2", "3", "1"]));
  it("sorts by name", () => expect(ids("name")).toEqual(["2", "1", "3"]));

  it("does not mutate its input", () => {
    const before = entries.map((e) => e.programId);
    sortEntries(entries, "name");
    expect(entries.map((e) => e.programId)).toEqual(before);
  });
});

describe("totalApplicationFees", () => {
  it("sums known fees and counts unknown ones", () => {
    expect(
      totalApplicationFees([{ application_fee: 75 }, { application_fee: 0 }, { application_fee: null }])
    ).toEqual({ total: 75, unknown: 1 });
  });
});

describe("isStatusDone", () => {
  it("is true once the application is out of the user's hands", () => {
    expect(isStatusDone("considering")).toBe(false);
    expect(isStatusDone("applying")).toBe(false);
    expect(isStatusDone("submitted")).toBe(true);
    expect(isStatusDone("accepted")).toBe(true);
  });
});

describe("icsFold", () => {
  it("leaves short lines alone", () => {
    expect(icsFold("SUMMARY:Short")).toBe("SUMMARY:Short");
  });

  it("folds long lines at 75 octets, including multi-byte characters", () => {
    const line = "SUMMARY:" + "项目截止".repeat(30);
    const folded = icsFold(line).split("\r\n");
    expect(folded.length).toBeGreaterThan(1);
    const encoder = new TextEncoder();
    for (const l of folded) expect(encoder.encode(l).length).toBeLessThanOrEqual(75);
    expect(folded.slice(1).every((l) => l.startsWith(" "))).toBe(true);
    expect(folded.map((l, i) => (i ? l.slice(1) : l)).join("")).toBe(line);
  });
});

describe("buildIcs", () => {
  const events = buildEvents(programs).filter((e) => e.programId === "a");
  const ics = buildIcs(events, () => "UCSB RMP, Summer; 2027", new Date(Date.UTC(2026, 9, 9, 12, 0, 0)));

  it("produces a well-formed calendar with CRLF line endings", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(3);
    expect(ics).toContain("DTSTAMP:20261009T120000Z");
  });

  it("writes all-day events that end the next day", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261115");
    expect(ics).toContain("DTEND;VALUE=DATE:20261116");
  });

  it("escapes commas and semicolons in summaries", () => {
    expect(ics).toContain("SUMMARY:Priority deadline: UCSB RMP\\, Summer\\; 2027");
  });

  it("adds reminders to deadlines but not to opening dates", () => {
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(4); // 2 deadlines x 2 alarms
  });
});
