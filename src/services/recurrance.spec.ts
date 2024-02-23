import {
  Days,
  daily,
  weeklyByDay,
  weekly,
  Months,
  monthly,
  Schedule
} from "./recurrance"

describe("recurrance", () => {
  const thursdayFeb1 = new Date(2024, 1, 1) //Thursday, Feb 1, 2024
  const fridayMarch1 = new Date(2024, 2, 1) // Friday, March 1, 2024
  const thursdayOct31 = new Date(2024, 9, 31) // Thursday, October 31, 2024

  function unwrap(map: Schedule) {
    const allDays: Date[] = []
    const allMonths: number[] = []

    for (const [key, value] of map) {
      allDays.push(...value)
      allMonths.push(key.month)
    }
    return [allDays, allMonths] as [Date[], number[]]
  }
  function expectDays(dates: Date[], ...days: Days[]) {
    const shiftedDays = days.map((d) => {
      const diff = d - 1
      return diff < 0 ? 7 + diff : diff
    })
    for (const date of dates) {
      const day = date.getDay()
      expect(shiftedDays).toContain(day)
    }
  }
  function expectMonths(source: number[], ...months: Months[]) {
    for (const month of source) {
      expect(months).toContain(month)
    }
  }
  function dateDiffInDays(a: Date, b: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
    return Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY))
  }

  describe("internals funtions", () => {
    describe("Weekly", () => {
      describe("limit: number", () => {
        const limit = 5

        test("same day", () => {
          const a1 = weeklyByDay(thursdayFeb1, Days.Thursday, limit)
          expect(a1.length).toBe(5)
          a1.forEach((x) => expect(x.day()).toBe(Days.Thursday))
        })

        test("past day", () => {
          const a1 = weeklyByDay(thursdayFeb1, Days.Monday, limit)
          expect(a1.length).toBe(5)
          a1.forEach((x) => expect(x.day()).toBe(Days.Monday))
        })

        test("future day", () => {
          const a1 = weeklyByDay(thursdayFeb1, Days.Friday, limit)
          expect(a1.length).toBe(5)
          a1.forEach((x) => expect(x.day()).toBe(Days.Friday))
        })
      })

      describe("limit: Date", () => {
        test("same day", () => {
          const a1 = weeklyByDay(thursdayFeb1, Days.Saturday, fridayMarch1)
          expect(a1.length).toBe(4)
          a1.forEach((x) => expect(x.day()).toBe(Days.Saturday))
        })

        test("past day", () => {
          const a1 = weeklyByDay(thursdayFeb1, Days.Monday, fridayMarch1)
          expect(a1.length).toBe(4)
          a1.forEach((x) => expect(x.day()).toBe(Days.Monday))
        })

        test("future day", () => {
          const a1 = weeklyByDay(thursdayFeb1, Days.Friday, fridayMarch1)
          expect(a1.length).toBe(5)
          a1.forEach((x) => expect(x.day()).toBe(Days.Friday))
        })
      })
    })
  })

  describe("public functions", () => {
    describe("daily", () => {
      test("N days", () => {
        const a1 = daily(thursdayFeb1, 10)
        const [days, months] = unwrap(a1)
        expect(months.length).toBeLessThanOrEqual(2)
        expect(days.length).toBe(10)
      })

      test("until a date", () => {
        const a1 = daily(thursdayFeb1, fridayMarch1)
        const [days, months] = unwrap(a1)
        const diff = dateDiffInDays(fridayMarch1, thursdayFeb1) + 1

        expect(days.length).toBe(diff)
        expect(months.length).toBeLessThanOrEqual(2)
      })
    })

    describe("weekly", () => {
      test("limit by date", () => {
        const a1 = weekly(
          thursdayFeb1,
          [Days.Saturday, Days.Thursday],
          fridayMarch1
        )

        const [days, months] = unwrap(a1)

        expectDays(days, Days.Saturday, Days.Thursday)
        expect(months.length).toBe(1)
        expectMonths(months, Months.February, Months.March)
      })

      test("limit by Count", () => {
        const a1 = weekly(thursdayFeb1, [Days.Saturday, Days.Thursday], 4)
        const [days, months] = unwrap(a1)

        expect(days.length).toBe(4)
        expect(months.length).toBe(1)
        expect(months.at(0)).toBe(Months.February)
        expectDays(days, Days.Saturday, Days.Thursday)
      })
    })

    describe("monthly", () => {
      describe("N dates", () => {
        test("every first thursday", () => {
          const dates = monthly(thursdayFeb1, "weekday", 5)
          const [days, months] = unwrap(dates)

          expect(days.length).toBe(5)
          expect(months.length).toBeLessThanOrEqual(5)
          expectDays(days, Days.Thursday)
        })

        test("1st of every month", () => {
          const dates = monthly(thursdayFeb1, "date", 5)
          const [days, months] = unwrap(dates)

          expect(days.length).toBe(5)
          expect(months.length).toBeLessThanOrEqual(5)
          days.forEach((date) => expect(date.getDate()).toBe(1))
        })

        test("31st of every month", () => {
          const wednsday31January = new Date(2024, 0, 31)
          const dates = monthly(wednsday31January, "date", 5)
          const [days, months] = unwrap(dates)

          expect(days.length).toBe(5)
          expect(months.length).toBeLessThanOrEqual(5)
          expect(months.every((x) => x != Months.February)).toBeTruthy()
          days.forEach((date) => expect(date.getDate()).toBe(1))
        })
      })

      describe("until a date", () => {
        test("every first thursday", () => {
          const dates = monthly(thursdayFeb1, "weekday", thursdayOct31)
          const [days, months] = unwrap(dates)

          expect(days.length).toBe(9)
          expect(months.length).toBeLessThanOrEqual(9)
          expectDays(days, Days.Thursday)
          //.forEach((date) => expect(date.day()).toBe(Days.Thursday))
        })

        test("1st of every month", () => {
          const dates = monthly(thursdayFeb1, "date", thursdayOct31)
          const [days, months] = unwrap(dates)

          expect(days.length).toBe(9)
          expect(months.length).toBeLessThanOrEqual(9)
          days.forEach((date) => expect(date.getDate()).toBe(1))
        })
      })
    })
  })
})













