/**
 * remove duplicate elements from the iterable
 * @param arr : Iterable<T>
 * @returns T[]
 */
export function unique<T>(arr: Iterable<T>) {
  const set = new Set<T>()
  for (const it of arr) {
    if (!set.has(it)) set.add(it)
  }
  return Array.from(set)
}
/**
 * groups the iterable using the provided function
 * @param arr Iterable<T>
 * @param fn : (arg:T)=>Key
 * @returns Map<Key, T[]>
 */
export function groupBy<T, Key>(arr: Iterable<T>, fn: (arg: T) => Key) {
  const map = new Map<Key, T[]>()
  const keyMap = new Map<string, Key>()

  for (const value of arr) {
    const key = fn(value)
    const str = JSON.stringify(key)

    if (!keyMap.has(str)) keyMap.set(str, key)

    const realKey = keyMap.get(str)!

    if (map.has(realKey)) map.get(realKey)?.push(value)
    else map.set(realKey, [value])
  }

  return map
}
/**
 * sorts the Array or Set and returns the sorted array
 * @param arr : T[]
 * @param cmp : (a,b)=> performs b-a; -1 if a is bigger, 1 if b is bigger, 0 if equal // b-a
 * @returns sorted new array, previous array remains the same
 */
export function sortBy<T>(arr: T[], cmp: (a: T, b: T) => number): T[] {
  const left: T[] = []
  const right: T[] = []

  if (arr.length === 0) return []
  else {
    const pivot = arr.at(0)!
    for (const it of arr.toSpliced(0, 1)) {
      const diff = cmp(pivot, it)
      if (diff > 0) right.push(it)
      else if (diff <= 0) left.push(it)
    }

    return [...sortBy(left, cmp), pivot, ...sortBy(right, cmp)]
  }
}

