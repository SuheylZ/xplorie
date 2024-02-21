import * as dayjs from "dayjs"
import { Queue } from './queue'
import _ from "underscore"
import { groupBy, unique } from "./algorithms"

export enum Days {
  Sunday = 0,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Frifday,
  Saturday,
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
  December,
}

export type Schedule = {
  Month: Months
  Year: number
  Days: Array<number>
}

export type Circuit = Array<Schedule>
export const EmptyCircuit: Circuit = []

export type RecurranceLimit = Date | number

const isDateLimit = (r: RecurranceLimit): r is Date => r instanceof Date
const isCountLimit = (r: RecurranceLimit): r is number => typeof r === 'number'
const thisYear = new Date().getFullYear()
const daysInMonth = (month: Months, year: number =thisYear): number => dayjs(new Date(year, month, 1)).daysInMonth()



function weeklyOnce(start: Date, day: Days, limit: RecurranceLimit) {
  const startsOn = dayjs(start)
  const arr: dayjs.Dayjs[] = []

  const current = (() => {
    const diff = day - startsOn.day()
    if (diff < 0) return startsOn.add(diff, "day")
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

export function daily(start: Date, limit: RecurranceLimit) {
  const startsOn = dayjs(start)
  const que = new Queue<dayjs.Dayjs>()

  const count = (() => {
    if (isDateLimit(limit)) return dayjs(limit).diff(startsOn, "days")
    else return limit
  })()

  const latest = que.last() ?? startsOn
  for (let i = 0; i < count; i++) {
    que.enque(latest.add(i, "day"))
  }

  // const process = (curr: dayjs.Dayjs) => {
  //   que.enque(curr)
  //   return curr.add(1, 'day')
  // }
  // if (isDateLimit(limit)) {
  //   const endsOn = dayjs(limit)
  //   let latest = que.last() ?? startsOn
  //   while (latest.isBefore(endsOn)) {
  //     latest = process(latest)
  //   }
  // } else {
  //   let latest = que.last() ?? startsOn
  //   while (que.count() <= limit) {
  //     latest = process(latest)
  //   }
  // }

  return groupBy(que.toArray(), (x) => {
    return { month: x.month(), year: x.year() }
  })
}
export function weekly(start: Date, days: Days[], limit: RecurranceLimit) {
  const a1 = unique(days).flatMap(day => weeklyOnce(start, day, limit))
  const a2 = unique(a1)
  const a3 = groupBy(a2, x => { return { month: x.month(), year: x.year() } })
  return a3
}
export function monthly(start: Date, type: "byWeekday" | "byDate", limit: RecurranceLimit) {
  
}