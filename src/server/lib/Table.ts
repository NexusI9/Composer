

export class Table<T> {

    data: T[][] = [];
    cursor = { row: 0, col: 0 };
    default: T;

    constructor(def: T) {
        this.default = def;
    }

    appendRow(value: T = this.default) {

        this.cursor.row++;
        this.data[this.cursor.row] = [value];

    }

    appendCol(value: T = this.default) {
        this.cursor.col++;
        if (!this.data[this.cursor.row]) this.appendRow(); 
        this.data[this.cursor.row][this.cursor.col] = value;

    }

    

}