import { Days, daily, weeklyOnce } from "./recurrance"

describe("recurrance", () => {
  afterAll(() => {})

  const startsOn = new Date(2024, 1, 1) //Thursday

  describe("daily", () => {
    test("daily", () => {
      const a1 = daily(startsOn, 10)
      expect(a1.size).toBe(1)
    })

    test("daily", () => {
      const a1 = daily(startsOn, new Date(2024, 2, 1))
      expect(a1.size).toBe(2)
    })
  })

  describe("Weekly by Count", () => {
    const limit = 5

    test("weekly (day same)", () => {
      const a1 = weeklyOnce(startsOn, Days.Thursday, limit)
      expect(a1.length).toBe(5)
      a1.forEach((x) => expect(x.day()).toBe(Days.Thursday))
    })
    test("weekly (day past)", () => {
      const a1 = weeklyOnce(startsOn, Days.Monday, limit)
      expect(a1.length).toBe(5)
      a1.forEach((x) => expect(x.day()).toBe(Days.Monday))
    })

    test("weekly (day ahead)", () => {
      const a1 = weeklyOnce(startsOn, Days.Friday, limit)
      expect(a1.length).toBe(5)
      a1.forEach((x) => expect(x.day()).toBe(Days.Friday))
    })
  })

  describe("weekly by date", () => {
    const endsOn = new Date(2024, 2, 1)

    test("weekly (day same) by date", () => {
      const a1 = weeklyOnce(startsOn, Days.Saturday, endsOn)
      expect(a1.length).toBe(5)
      a1.forEach((x) => expect(x.day()).toBe(Days.Saturday))
    })

    test("weekly (day past) by date", () => {
      const a1 = weeklyOnce(startsOn, Days.Monday, endsOn)
      expect(a1.length).toBe(5)
      a1.forEach((x) => expect(x.day()).toBe(Days.Monday))
    })

    test("weekly (day ahead) by date", () => {
      const a1 = weeklyOnce(startsOn, Days.Friday, endsOn)
      expect(a1.length).toBe(5)
      a1.forEach((x) => expect(x.day()).toBe(Days.Friday))
    })
  })
})

