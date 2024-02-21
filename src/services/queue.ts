/**
 * Queue structure for the given type
 */

export class Queue<T> {
  private readonly _store: T[]

  constructor(arg: T[] | undefined = undefined) {
    if (arg && arg.length>0) {
      this._store = [...arg]
    }

    this._store = []
  }
  /**
   * Stores the element at the end o the queue
   */
  public enque(arg: T) {
    this._store.push(arg)
  }
  /**
   * pops the first element
   */
  public deque(): T | undefined {
    if (this._store.length > 0) return this._store.shift()
    return undefined
  }
  public isEmpty(): boolean {
    return this._store.length === 0
  }
  public count(): number {
    return this._store.length
  }
  public toArray() {
    const ret = [...this._store]
    return ret
  }
  public first() {
    return this._store.at(0)
  }
  public last() {
    return this._store.at(-1)
  }
}

export function joinQueue<T>(q1: Queue<T>, ...args: Queue<T>[]) {
  let target: T[] = q1.toArray()
  args.forEach((x) => {
    target = [...target, ...x.toArray()]
  })
  return new Queue(target)
}