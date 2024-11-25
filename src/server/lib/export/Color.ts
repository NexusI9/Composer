export interface IColor {
    name: string;
    color: RGB;
}

export class Color {

    name;
    color;
    style: PaintStyle | undefined;

    constructor({ name, color }: IColor) {
        this.name = name;
        this.color = color;
    }



    async create() {

        await figma.getLocalPaintStylesAsync().then(styles => {
            const existingStyle = styles.find(st => st.name === this.name);
            if (existingStyle) {
                //assign to existing style from name
                this.style = existingStyle;
            } else {
                this.style = figma.createPaintStyle();
                //create new style
                this.style.name = this.name;
                this.style.paints = [
                    { type: "SOLID", color: this.color }
                ];
            }
        });


    }
}