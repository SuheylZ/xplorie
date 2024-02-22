import { groupBy, sortBy } from "./algorithms"

describe("algorithms", () => {
  test("sort", () => {
    const a1 = [4, 5, 7, 2, 6, 1, 7, 9, 0, 1]

    const a2 = sortBy(a1, (a, b) => (a > b ? -1 : a === b ? 0 : 1))

    expect(a2.at(0)).toEqual(0)
    expect(a2.at(-1)).toEqual(9)
  })

  test("groupBy", () => {
    const a1 = [1, 2, 4, 6, 11, 34, 12, 32, 16, 39, 14, 9]
    const a2 = groupBy(a1, (x) => {
      if (x <= 10) return 10
      else if (x <= 20) return 20
      else return 30
    })

    expect(a2.size).toBe(3)
  })
})

