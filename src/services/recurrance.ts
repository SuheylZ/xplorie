import dayjs, { Dayjs } from "dayjs"
import weekday from "dayjs/plugin/weekday"
import { groupBy, unique } from "./algorithms"

export enum Days {
  Saturday, // it should be sunday but library has Saturday as first day
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday
}
export enum Months {
  January = 0,
  February,
  March,
  May,
  June,
  July,
  August,
  Septemnber,
  October,
  November,
  December = 11
}

export type Schedule = Map<{ month: number; year: number }, Date[]>
export type Monthly = "weekday" | "date"
export type RecurranceLimit = Date | number

const isDateLimit = (r: RecurranceLimit): r is Date => r instanceof Date
//const isCountLimit = (r: RecurranceLimit): r is number => typeof r === "number"
dayjs.extend(weekday)
/*
=========================
  Internal Functions
=========================
*/
function immutable(source: Date) {
  const target = dayjs(source)
  const targetDay = target.day()
  const sourceDay = source.getDay() + 1

  const diff = targetDay - sourceDay
  switch (diff) {
    case -1:
      return target.add(1, "day")
    case 0:
      return target
    case 1:
      return target.subtract(1, "day")
  }
  return target
}
function mutable(source: Dayjs) {
  const target = source.toDate()
  const diff = target.getDay() - (source.day() + 1)

  function addDays(date: Date, days: number) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  switch (diff) {
    case -1:
      return addDays(target, -1)
    case 0:
      return target
    case 1:
      return addDays(target, 1)
  }

  return target
}
function toSchedule(arg: Dayjs[]) {
  const dates = arg.map((x) => mutable(x))

  const schedule: Schedule = groupBy(dates, (x) => {
    return { month: x.getMonth(), year: x.getFullYear() }
  })

  return schedule
}
function createLimitPredicate(limit: RecurranceLimit, days: Dayjs[]) {
  if (isDateLimit(limit)) {
    const pivot = immutable(limit)
    return (target: Dayjs) => target.isBefore(pivot) || target.isSame(pivot)
  } else {
    return (a: Dayjs) => days.length < limit && dayjs.isDayjs(a)
  }
}

export function weeklyByDay(start: Date, day: Days, limit: RecurranceLimit) {
  const startsOn = immutable(start)
  const days: Dayjs[] = []

  const current = (() => {
    const diff = startsOn.day() - day
    if (diff < 0) {
      return startsOn.add(Math.abs(diff), "day")
    } else if (diff > 0) {
      return startsOn.add(7 - diff, "day")
    } else {
      return startsOn.add(0, "day")
    }
  })()

  const add = (c: Dayjs) => {
    days.push(c)
    return c.add(7, "day")
  }

  let latest = current
  const condition = createLimitPredicate(limit, days)
  while (condition(latest)) {
    latest = add(latest)
  }

  return days
}
function monthlyByDate(start: Date, limit: RecurranceLimit): Dayjs[] {
  const startsOn = immutable(start)
  const days: Dayjs[] = []

  const addOrIgnore = (a: Dayjs) => {
    if (a.date() === startsOn.date()) days.push(a)
    return a.add(1, "month")
  }

  let latest = startsOn
  const condition = createLimitPredicate(limit, days)
  while (condition(latest)) {
    latest = addOrIgnore(latest)
  }

  return days
}
function monthlyByWeekday(start: Date, limit: RecurranceLimit): Dayjs[] {
  const startsOn = immutable(start)
  const days: Dayjs[] = []
  const weekday = startsOn.day()

  const order =
    weeklyByDay(start, weekday, startsOn.endOf("month").toDate())
      .map((item, index) => [item, index] as [Dayjs, number])
      .filter((x) => x[0].isSame(startsOn))
      .at(0)?.[1] ?? 0

  const getWeekdayByOrder = (dates: Dayjs[]) => {
    if (order <= dates.length) return dates.at(order)!

    return undefined
  }

  const getNext = (source: Dayjs) => {
    let ret: Dayjs | undefined = undefined
    let index = 1

    while (!ret) {
      const first = source.add(index++, "month").startOf("month")
      const last = first.endOf("month")
      const dates = weeklyByDay(first.toDate(), weekday, last.toDate())
      ret = getWeekdayByOrder(dates)
    }
    return ret!
  }

  const condition = createLimitPredicate(limit, days)
  let latest = startsOn
  while (condition(latest)) {
    days.push(latest)
    latest = getNext(latest)
  }

  return days
}

/*
=========================
  Public Functions
=========================
*/

/**
 * calculates daily recurrance either by date or count
 * @param start Date, where to start from
 * @param limit Date|number, how many dates to calculate
 * @returns Schedule
 */
export function daily(start: Date, limit: RecurranceLimit) {
  const startsOn = immutable(start)
  const arr: Dayjs[] = []

  const condition = createLimitPredicate(limit, arr)
  let latest = startsOn
  while (condition(latest)) {
    arr.push(latest)
    latest = latest.add(1, "day")
  }

  // const count = (() => {
  //   if (isDateLimit(limit)) return immutable(limit).diff(startsOn, "days")
  //   else return limit
  // })()

  // const latest = arr.at(-1) ?? startsOn
  // for (let i = 0; i < count; i++) {
  //   arr.push(latest.add(i, "day"))
  // }

  return toSchedule(arr)
}
/**
 * calculates weekly recurrance by days limited either by date or count
 * @param start Date, where to start from
 * @param days Days[], days for which to calculate
 * @param limit Date|number, how many dates to be generated
 * @returns Schedule
 */
export function weekly(start: Date, days: Days[], limit: RecurranceLimit) {
  const set = new Set<Dayjs>()
  const calculate = (day: Days) => weeklyByDay(start, day, limit)

  for (const day of unique(days)) {
    const res = calculate(day)
    res.forEach((x) => set.add(x))
  }

  const arr = isDateLimit(limit)
    ? Array.from(set)
    : Array.from(set).splice(0, limit)

  return toSchedule(arr)
}
/**
 * Claculates monthly recurrance either by day order or by day
 * @param start Date, start date
 * @param type "weekday"|"date"
 * @param limit Date|number, to limit the number of dates
 * @returns Schedule
 */
export function monthly(start: Date, type: Monthly, limit: RecurranceLimit) {
  const days = (() => {
    if (type === "date") {
      return monthlyByDate(start, limit)
    } else {
      return monthlyByWeekday(start, limit)
    }
  })()

  return toSchedule(days)
}
