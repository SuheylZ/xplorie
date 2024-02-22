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
  January = 1,
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

export type Schedule = {
  Month: Months
  Year: number
  Days: Array<number>
}

export type Circuit = Array<Schedule>
export const EmptyCircuit: Circuit = []

export type RecurranceLimit = Date | number

const date = (a: Date) => dayjs(a).add(1, "day")
const isDateLimit = (r: RecurranceLimit): r is Date => r instanceof Date
const isCountLimit = (r: RecurranceLimit): r is number => typeof r === "number"

export function weeklyOnce(start: Date, day: Days, limit: RecurranceLimit) {
  const startsOn = date(start)
  const arr: dayjs.Dayjs[] = []

  const current = (() => {
    const diff = day - startsOn.day()

    if (diff < 0) return startsOn.add(Math.abs(diff) + 1, "day")
    else if (diff > 0) return startsOn.add(diff, "day").add(7, "day")
    else return startsOn
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
    while (current.isBefore(limit) || current.isSame(limit)) {
      latest = process(latest)
    }
  }
  return arr
}
function groupDates(arg: dayjs.Dayjs[]) {
  return groupBy(arg, (x) => {
    return { month: x.month(), year: x.year() }
  })
}

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

  return groupDates(arr)
}
export function weekly(start: Date, days: Days[], limit: RecurranceLimit) {
  const a1 = unique(days).flatMap((day) => weeklyOnce(start, day, limit))
  const a2 = unique(a1)
  const a3 = groupBy(a2, (x) => {
    return { month: x.month(), year: x.year() }
  })
  return a3
}
// export function monthly(
//   start: Date,
//   type: "byWeekday" | "byDate",
//   limit: RecurranceLimit
// ) {}
