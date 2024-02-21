
export function unique<T>(arr: Iterable<T>) {
  const set = new Set<T>()
  for (const it of arr) {
    if (!set.has(it))
      set.add(it)
  }
  return Array.from(set)
}

export function groupBy<T, Key>(arr: Iterable<T>, fn: (arg: T) => Key) {
  const map = new Map<Key, T[]>()

  for (const value of arr) {
    const key = fn(value)
    if (map.has(key)) map.get(key)?.push(value)
    else map.set(key, [value])
  }
  return map
}

export function sortBy<T>(arr: Iterable<T>, cmp: (a: T, b: T) => number): T[] {
  const left: T[] = []
  const right: T[] = []

  let pivot: T | undefined
  for (const item of arr) {
    if (!pivot) pivot = item
    else {
      const diff = cmp(pivot, item)
      if (diff <= 0) left.push(item)
      else right.push(item)
    }
  }

  return sortBy(left, cmp).concat(sortBy(right, cmp))
}
