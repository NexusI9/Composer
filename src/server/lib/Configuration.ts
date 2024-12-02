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

    get filled() {
        return !!this.data.filter(item => !!item).length;
    }

    get string() {
        return this.data.join(',');
    }

    indexOf(s: T) {
        return this.data.indexOf(s);
    }

    filter() {
        return this.data.filter(item => !!item);
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
            cache = cache.filter(n => !!n);
            rest = rest.filter(n => !!n);
        }
        return { x: rest, y: cache }
    }


}