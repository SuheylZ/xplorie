/**
 * Queue structure for the given type
 */

export class Queue<T> {
  private readonly _store: T[]

  constructor() {
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
}
