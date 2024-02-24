import dayjs, { Dayjs } from "dayjs"
import utc from "dayjs/plugin/utc"
import { groupBy, sortBy, unique } from "./algorithms"

export enum Days {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday // it should be sunday but library has Saturday as first day
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
export type UniqueDays = Set<Dayjs>

const isDateLimit = (r: RecurranceLimit): r is Date => r instanceof Date
const sortDates = (set: UniqueDays) =>
  sortBy(Array.from(set), (a, b) => (a.isAfter(b) ? -1 : a.isSame(b) ? 0 : 1))

dayjs.extend(utc)
/*
=========================
  Internal Functions
=========================
*/

function immutable(source: Date) {
  const adjusted = new Date(source.setHours(0, 0, 0))
  const adjustedDay = adjusted.getDay()

  const target = dayjs(adjusted).utc(true)
  const targetDay = target.day()

  const diff = targetDay - adjustedDay
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
  const target = source.hour(0).minute(0).second(0).toDate()
  const diff = target.getDay() - source.day()

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
function toSchedule(unique: UniqueDays | Dayjs[]) {
  const arr = Array.isArray(unique) ? unique : sortDates(unique)
  const dates = arr.map((x) => mutable(x))

  const schedule: Schedule = groupBy(dates, (x) => {
    return { month: x.getMonth(), year: x.getFullYear() }
  })

  return schedule
}
function createLimitPredicate(
  limit: RecurranceLimit,
  days: UniqueDays | Dayjs[]
) {
  const size = Array.isArray(days) ? () => days.length : () => days.size
  if (isDateLimit(limit)) {
    const pivot = immutable(limit)
    return (target: Dayjs) => target.isBefore(pivot) || target.isSame(pivot)
  } else {
    return (a: Dayjs) => size() < limit && dayjs.isDayjs(a)
  }
}
function generate(
  startsOn: Dayjs,
  limit: RecurranceLimit,
  next: (dt: Dayjs) => Dayjs
) {
  const set = new Set<Dayjs>() as UniqueDays
  const condition = createLimitPredicate(limit, set)
  let latest = startsOn

  while (condition(latest)) {
    set.add(latest)
    latest = next(latest)
  }
  return set
}
function createWeekCalculator(startsOn: Dayjs, limit: RecurranceLimit) {
  const getSentinal = (day: Days) => {
    const diff = startsOn.day() - day
    if (diff < 0) {
      return startsOn.add(Math.abs(diff), "day")
    } else if (diff > 0) {
      return startsOn.add(7 - diff, "day")
    } else {
      return startsOn.add(0, "day")
    }
  }
  const next = (source: Dayjs) => source.add(7, "day")

  return (day: Days) => {
    const sentinal = getSentinal(day)
    const set = generate(sentinal, limit, next)
    return sortDates(set)
  }
}
function monthlyByDate(start: Date, limit: RecurranceLimit) {
  const startsOn = immutable(start)
  const next = (current: Dayjs) => {
    const offsets = [1, 2, 3, 4]
    const nextDate =
      offsets
        .map((offset) => current.add(offset, "month"))
        .filter((x) => x.date() === current.date())
        .at(0) ?? current
    return nextDate
  }

  const set = generate(startsOn, limit, next)
  return set
}
function monthlyByWeekday(start: Date, limit: RecurranceLimit) {
  const startsOn = immutable(start)
  const weekday = startsOn.day()

  const calculate = createWeekCalculator(startsOn.startOf("month"), limit)
  const weeks = calculate(startsOn.day())
  const order =
    weeks
      .map((date, idx) => {
        return { date, idx }
      })
      .filter(({ date }) => date.isSame(startsOn))
      .at(0)?.idx ?? 0

  const next = (source: Dayjs) => {
    const offsets = [1, 2, 3, 4]
    for (const offset of offsets) {
      const d1 = source.add(offset, "month").startOf("month")
      const d2 = d1.endOf("month").toDate()
      const calculate = createWeekCalculator(d1, d2)
      const dates = calculate(weekday)
      const ret = order <= dates.length ? dates.at(order)! : undefined
      if (ret) return ret
    }
    return source
  }

  const set = generate(startsOn, limit, next)
  return set
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
  const next = (source: Dayjs) => source.add(1, "day")
  const days = generate(startsOn, limit, next)
  return toSchedule(days)
}
/**
 * calculates weekly recurrance by days limited either by date or count
 * @param start Date, where to start from
 * @param days Days[], days to be calculated
 * @param limit Date|number, how many dates to be generated
 * @returns Schedule
 */
export function weekly(start: Date, days: Days[], limit: RecurranceLimit) {
  const startsOn = immutable(start)
  const calculate = createWeekCalculator(startsOn, limit)
  const ret = unique(days)
    .map((day) => calculate(day))
    .flatMap((x) => x)

  const result = isDateLimit(limit) ? ret : ret.splice(0, limit)
  return toSchedule(result)
}
/**
 * Claculates monthly recurrance either by day order or by day
 * @param start Date, start date
 * @param type "weekday"|"date"
 * @param limit Date|number, to limit the number of dates
 * @returns Schedule
 */
export function monthly(start: Date, type: Monthly, limit: RecurranceLimit) {
  const calculate = type === "date" ? monthlyByDate : monthlyByWeekday
  const days = calculate(start, limit)
  return toSchedule(days)
}
