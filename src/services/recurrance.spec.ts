import dayjs from "dayjs"
import { Days, daily, _weeklyByDay, weekly, Months } from "./recurrance"

function unwind(map: Map<{ month: number; year: number }, dayjs.Dayjs[]>) {
  const allDays: dayjs.Dayjs[] = []
  const allMonths: number[] = []

  for (const [key, value] of map) {
    allDays.push(...value)
    allMonths.push(key.month)
  }
  return [allDays, allMonths] as [dayjs.Dayjs[], number[]]
}

describe("recurrance", () => {
  const thursdayFeb1 = new Date(2024, 1, 1) //Thursday, Feb 1, 2024
  const fridayMarch1 = new Date(2024, 2, 1) // Friday, March 1, 2024

  describe("internal functions", () => {
    describe("Weekly single day, limit: number", () => {
      const limit = 5

      test("same day", () => {
        const a1 = _weeklyByDay(thursdayFeb1, Days.Thursday, limit)
        expect(a1.length).toBe(5)
        a1.forEach((x) => expect(x.day()).toBe(Days.Thursday))
      })

      test("past day", () => {
        const a1 = _weeklyByDay(thursdayFeb1, Days.Monday, limit)
        expect(a1.length).toBe(5)
        a1.forEach((x) => expect(x.day()).toBe(Days.Monday))
      })

      test("future day", () => {
        const a1 = _weeklyByDay(thursdayFeb1, Days.Friday, limit)
        expect(a1.length).toBe(5)
        a1.forEach((x) => expect(x.day()).toBe(Days.Friday))
      })
    })

    describe("Weekly single day, limit: Date", () => {
      test("same day", () => {
        const a1 = _weeklyByDay(thursdayFeb1, Days.Saturday, fridayMarch1)
        expect(a1.length).toBe(4)
        a1.forEach((x) => expect(x.day()).toBe(Days.Saturday))
      })

      test("past day", () => {
        const a1 = _weeklyByDay(thursdayFeb1, Days.Monday, fridayMarch1)
        expect(a1.length).toBe(4)
        a1.forEach((x) => expect(x.day()).toBe(Days.Monday))
      })

      test("future day", () => {
        const a1 = _weeklyByDay(thursdayFeb1, Days.Friday, fridayMarch1)
        expect(a1.length).toBe(4)
        a1.forEach((x) => expect(x.day()).toBe(Days.Friday))
      })
    })
  })

  describe("daily", () => {
    test("daily", () => {
      const a1 = daily(thursdayFeb1, 10)
      expect(a1.size).toBe(1)
    })

    test("daily", () => {
      const a1 = daily(thursdayFeb1, new Date(2024, 2, 1))
      expect(a1.size).toBe(2)
    })
  })

  describe("weekly", () => {
    test("limit by date", () => {
      const a1 = weekly(
        thursdayFeb1,
        [Days.Saturday, Days.Thursday],
        fridayMarch1
      )

      const [allDays, allMonths] = unwind(a1)

      allDays.forEach((x) =>
        expect(
          x.day() === Days.Saturday || x.day() === Days.Thursday
        ).toBeTruthy()
      )
      expect(allMonths.length).toBe(2)
      allMonths.forEach((x) =>
        expect(x === Months.February || x === Months.March).toBeTruthy()
      )
    })

    test("limit by Count", () => {
      const a1 = weekly(thursdayFeb1, [Days.Saturday, Days.Thursday], 4)

      const [allDays, allMonths] = unwind(a1)

      expect(allDays.length).toBe(4)
      expect(allMonths.length).toBe(1)
      expect(allMonths.at(0)).toBe(Months.February)

      allDays.forEach((x) =>
        expect(
          x.day() === Days.Saturday || x.day() === Days.Thursday
        ).toBeTruthy()
      )
    })
  })
})

