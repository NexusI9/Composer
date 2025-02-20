export class Configuration<T> {
  data: Array<T | undefined> = [];
  capacity: number = 1024;

  constructor(capacity: number) {
    this.capacity = capacity;
    for (let c = 0; c < capacity; c++) this.data[c] = undefined;
  }

  split(n: number) {
    //Split the array into n equal part
  }

  get layout() {
    /**
     * CF Setting UI:
     *
     * Column:
     * [  0  v] [  1  v]
     *
     * Row:
     * [  2  v] [  3  v]
     *
     */
    //Hard code the different layouts
    return (this.data[0] || this.data[1]) && !this.data[2] && !this.data[3]
      ? "COLUMN"
      : !this.data[0] && !this.data[1] && (this.data[2] || this.data[3])
        ? "ROW"
        : this.data[0] && this.data[1] && this.data[2] && this.data[3]
          ? "CROSS"
          : (this.data[0] || this.data[1]) && this.data[2] && this.data[3]
            ? "CROSS_ROW"
            : this.data[0] && this.data[1] && (this.data[2] || !this.data[3])
              ? "CROSS_COL"
              : (this.data[0] || this.data[1]) && (this.data[2] || this.data[3])
                ? "CROSS_MONO"
                : "UNKNOWN";
  }

  get filled() {
    return !!this.data.filter((item) => !!item).length;
  }

  get string() {
    return this.data.join(",");
  }

  get columns() {
    return [this.data[0], this.data[1]].filter((n) => !!n);
  }

  get rows() {
    return [this.data[2], this.data[3]].filter((n) => !!n);
  }

  indexOf(s: T) {
    return this.data.indexOf(s);
  }

  filter() {
    return this.data.filter((item) => !!item);
  }

  attributeAt(i: number) {
    return this.data[i];
  }

  reset() {
    this.data.length = 0;
  }

  allocate(i: number, value: T) {
    if (i >= this.capacity) {
      console.warn("Trying to load above array capacity, abort.");
      return;
    }
    this.data[i] = value;
  }

  dimensions(split: number, filter: boolean = false) {
    let cache = [...this.data]; //copy
    let rest = cache.splice(0, cache.length / split);
    if (filter) {
      cache = cache.filter((n) => !!n);
      rest = rest.filter((n) => !!n);
    }
    return { x: rest, y: cache };
  }
}
