import dayjs from "dayjs"
import weekday from "dayjs/plugin/weekday"
import updateLocale from "dayjs/plugin/updateLocale"
import { groupBy, unique } from "./algorithms"

export enum Days {
  Saturday, // it should be sunday but dayjs has Saturday as first day
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
  December
}

dayjs.extend(weekday)
dayjs.extend(updateLocale)
dayjs.updateLocale("en", {
  weekdays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ],
  weekStart: 0,
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
})

/**
 * Map<{ month: number; year: number }, dayjs.Dayjs[]>
 */
export type Schedule = Map<{ month: number; year: number }, dayjs.Dayjs[]>

export type Circuit = Array<Schedule>
export const EmptyCircuit: Circuit = []

export type RecurranceLimit = Date | number

const date = (a: Date) => dayjs(a).add(1, "day")
const isDateLimit = (r: RecurranceLimit): r is Date => r instanceof Date
const isCountLimit = (r: RecurranceLimit): r is number => typeof r === "number"

export function _weeklyByDay(start: Date, day: Days, limit: RecurranceLimit) {
  const startsOn = date(start)
  const arr: dayjs.Dayjs[] = []

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

  const process = (c: dayjs.Dayjs) => {
    arr.push(c)
    return c.add(7, "day")
  }

  let latest = current
  if (isCountLimit(limit)) {
    while (arr.length < limit) {
      latest = process(latest)
    }
  } else {
    const endsOn = dayjs(limit)
    while (latest.isBefore(endsOn) || latest.isSame(endsOn)) {
      latest = process(latest)
    }
  }
  return arr
}
function toSchedule(arg: dayjs.Dayjs[]) {
  const schedule: Schedule = groupBy(arg, (x) => {
    return { month: x.month(), year: x.year() }
  })

  return schedule
}
/**
 * calculates daily recurrance either by date or count
 * @param start Date, where to start from
 * @param limit Date|number, how many dates to calculate
 * @returns Schedule
 */
export function daily(start: Date, limit: RecurranceLimit) {
  const startsOn = date(start)
  const arr: dayjs.Dayjs[] = []

  const count = (() => {
    if (isDateLimit(limit)) return date(limit).diff(startsOn, "days")
    else return limit
  })()

  const latest = arr.at(-1) ?? startsOn
  for (let i = 0; i < count; i++) {
    arr.push(latest.add(i, "day"))
  }

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
  const set = new Set<dayjs.Dayjs>()
  const calculate = (day: Days) => _weeklyByDay(start, day, limit)

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
 * @param type "ByWeekday"|"ByDate"
 * @param limit Date|number, to limit the number of dates
 * @returns Schedule
 */
// export function monthly(
//   start: Date,
//   type: "byWeekday" | "byDate",
//   limit: RecurranceLimit
// ) {
//   return {} as Schedule
// }
