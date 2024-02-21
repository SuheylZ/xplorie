import * as dayjs from 'dayjs'
import { Queue } from './queue'

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
const monthDays = (
  month: Months,
  year: number = new Date().getFullYear()
): number => dayjs(new Date(year, month, 1)).daysInMonth()

export function dailyRecurrance(start: Date, limit: RecurranceLimit) {
  const startsOn = dayjs(start)
  const que = new Queue<dayjs.Dayjs>()

  if (isDateLimit(limit)) {
    const endsOn = dayjs(limit)
    let current = startsOn
    while (current.isBefore(endsOn) || current.isSame(endsOn)) {
      que.enque(current)
      current = current.add(1, 'day')
    }
  } else {
    let current = startsOn
    while (que.count() < limit) {
      que.enque(current)
      current = current.add(1, 'day')
    }
  }
  return que.toArray()
}

export function weeklyRecurrance(
  start: Date,
  days: Array<Days>,
  limit: RecurranceLimit
) {
  const startsOn = dayjs(start)
  const que = new Queue<dayjs.Dayjs>()
  let current = startsOn
  if (isCountLimit(limit)) {
    while (que.count() < limit) {
      que.enque(current)
      current = current.add(7, 'day')
    }
  } else {
    while (current.isBefore(limit) || current.isSame(limit)) {
      que.enque(current)
      current = current.add(7, 'day')
    }
  }
}
