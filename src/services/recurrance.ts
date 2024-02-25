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
const WEEKLENGTH = 7
const isDateLimit = (r: RecurranceLimit): r is Date => r instanceof Date
const sortDates = (dates: UniqueDays | Dayjs[]) =>
  sortBy(Array.isArray(dates) ? dates : Array.from(dates), (a, b) =>
    a.isAfter(b) ? -1 : a.isSame(b) ? 0 : 1
  )
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
  return diff === 0 ? target : target.add(diff, "day")
}
function mutable(source: Dayjs) {
  const target = source.hour(0).minute(0).second(0).toDate()
  const diff = target.getDay() - source.day()
  if (diff !== 0) target.setDate(target.getDate() + diff)
  return target
}
function toSchedule(unique: UniqueDays | Dayjs[]) {
  const arr = sortDates(unique)
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
function createMonthDate() {
  return (source: Dayjs) => {
    const offsets = [1, 2, 3, 4]
    for (const offset of offsets) {
      const target = source.add(offset, "month")
      if (target.date() === source.date()) return target
    }
    return source
  }
}
function createMonthWeekday(startsOn: Dayjs) {
  const order = (() => {
    let index = 0
    while (startsOn.date() - WEEKLENGTH * index >= WEEKLENGTH) index++
    return index
  })()

  return (source: Dayjs) => {
    const offsets = [1, 2, 3, 4]
    for (const offset of offsets) {
      const t1 = source.add(offset, "month").startOf("month")
      const days = Math.abs((source.day() - t1.day()) * (order * WEEKLENGTH))
      const target = t1.add(days, "day")
      return target
    }
    return source
  }
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
  const getSentinal = (day: Days) => {
    const diff = day - startsOn.day()
    const offset = diff < 0 ? WEEKLENGTH - diff : diff
    return startsOn.add(offset, "day")
  }
  const next = (source: Dayjs) => source.add(WEEKLENGTH, "day")
  const t0: Dayjs[] = []
  unique(days).forEach((day) => {
    const sentinal = getSentinal(day)
    const set = generate(sentinal, limit, next)
    Array.from(set).forEach((x) => t0.push(x))
  })

  const t1 = sortDates(t0)
  const t2 = isDateLimit(limit) ? t1 : sortDates(t1).splice(0, limit)
  return toSchedule(t2)
}
/**
 * Calculates monthly recurrance either by day order or by day
 * @param start Date, start date
 * @param type "weekday"|"date"
 * @param limit Date|number, to limit the number of dates
 * @returns Schedule
 */
export function monthly(start: Date, type: Monthly, limit: RecurranceLimit) {
  const startsOn = immutable(start)
  const next =
    type === "date" ? createMonthDate() : createMonthWeekday(startsOn)
  const days = generate(startsOn, limit, next)
  return toSchedule(days)
}