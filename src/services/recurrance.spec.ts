import { Days, daily, weekly, Months, monthly, Schedule } from "./recurrance"

const fixture = {
  thursdayFeb1: Object.freeze(new Date(2024, 1, 1)), //Thursday, Feb 1, 2024
  fridayMarch1: Object.freeze(new Date(2024, 2, 1)), // Friday, March 1, 2024
  thursdayOct31: Object.freeze(new Date(2024, 9, 31)), // Thursday, October 31, 2024

  unwrap: (map: Schedule) => {
    const allDays: Date[] = []
    const allMonths: number[] = []

    for (const [key, value] of map) {
      allDays.push(...value)
      allMonths.push(key.month)
    }
    return [allDays, allMonths] as [Date[], number[]]
  },
  dateDiffInDays: (a: Date, b: Date) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
    return Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY))
  }
}

describe("recurrance", () => {
  const expectDays = (dates: Date[], ...days: Days[]) => {
    for (const date of dates) {
      const day = date.getDay()
      expect(days).toContain(day)
    }
  }
  const expectMonths = (source: number[], ...months: Months[]) => {
    for (const month of source) {
      expect(months).toContain(month)
    }
  }

  describe("daily", () => {
    test("10 days from February 1", () => {
      const a1 = daily(fixture.thursdayFeb1, 10)
      const [days, months] = fixture.unwrap(a1)
      expect(months.length).toBeLessThanOrEqual(2)
      expect(days.length).toBe(10)
    })

    test("February 1 to March 1", () => {
      const a1 = daily(fixture.thursdayFeb1, fixture.fridayMarch1)
      const [days, months] = fixture.unwrap(a1)
      const diff =
        fixture.dateDiffInDays(fixture.fridayMarch1, fixture.thursdayFeb1) + 1

      expect(days.length).toBe(diff)
      expect(months.length).toBeLessThanOrEqual(2)
    })
  })

  describe("weekly", () => {
    test("Every Thursday & Satyrday from February 1", () => {
      const a1 = weekly(
        fixture.thursdayFeb1,
        [Days.Saturday, Days.Thursday],
        fixture.fridayMarch1
      )

      const [days, months] = fixture.unwrap(a1)

      expectDays(days, Days.Saturday, Days.Thursday)
      expect(months.length).toBe(1)
      expectMonths(months, Months.February, Months.March)
    })

    test("5 Thursday & Saturdays from february 1", () => {
      const a1 = weekly(fixture.thursdayFeb1, [Days.Saturday, Days.Thursday], 5)
      const [days, months] = fixture.unwrap(a1)

      expect(days.length).toBe(5)
      expect(months.length).toBe(1)
      expect(months.at(0)).toBe(Months.February)
      expectDays(days, Days.Thursday, Days.Saturday)
    })
  })

  describe("monthly", () => {
    describe("N dates", () => {
      test("5 first Thursday from February 1", () => {
        const dates = monthly(fixture.thursdayFeb1, "weekday", 5)
        const [days, months] = fixture.unwrap(dates)

        expect(days.length).toBe(5)
        expect(months.length).toBe(5)
        days.every((x) => expect(x.getDay()).toBe(Days.Thursday))
      })

      test("5 1st of every month from February 1", () => {
        const dates = monthly(fixture.thursdayFeb1, "date", 5)
        const [days, months] = fixture.unwrap(dates)

        expect(days.length).toBe(5)
        expect(months.length).toBeLessThanOrEqual(5)
        days.forEach((date) => expect(date.getDate()).toBe(1))
      })

      test("5 31st of every month from January 31", () => {
        const wednsday31January = new Date(2024, 0, 31)
        const dates = monthly(wednsday31January, "date", 5)
        const [days, months] = fixture.unwrap(dates)

        expect(days.length).toBe(5)
        expect(months.length).toBeLessThanOrEqual(5)
        expect(months.every((x) => x != Months.February)).toBeTruthy()
        days.forEach((date) => expect(date.getDate()).toBe(31))
      })
    })

    describe("until a date", () => {
      test("every first thursday", () => {
        const dates = monthly(
          fixture.thursdayFeb1,
          "weekday",
          fixture.thursdayOct31
        )
        const [days, months] = fixture.unwrap(dates)

        expect(days.length).toBe(9)
        expect(months.length).toBeLessThanOrEqual(9)
        days.every((x) => expect(x.getDate()).toBe(1))
      })

      test("1st of every month", () => {
        const dates = monthly(
          fixture.thursdayFeb1,
          "date",
          fixture.thursdayOct31
        )
        const [days, months] = fixture.unwrap(dates)

        expect(days.length).toBe(9)
        expect(months.length).toBeLessThanOrEqual(9)
        days.forEach((date) => expect(date.getDate()).toBe(1))
      })
    })
  })
})
































