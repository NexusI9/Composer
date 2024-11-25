import { ITreeItem } from "@components/TreeItem/TreeItem";

export function getActivePageAmount(tree: Array<ITreeItem>) {

    let amount = 0;

    const calculate = (branch: Array<ITreeItem>) => {
        amount += branch.filter(br => br.active).length;
        branch.forEach(({ subdir }) => calculate(subdir));
    }

    calculate(tree);

    return amount;

}