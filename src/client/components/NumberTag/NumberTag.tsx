
export interface INumberTag {
    text: string;
}

export default ({ text }: INumberTag) => {
    return (<small className="no-user-select number-tag bd-radius-max color-bg-base-800 color-text-base-300 padding-h-m">
        {text}
    </small>);

}