import { ITreeItem } from "@components/TreeItem/TreeItem"
import { useEffect, useState } from "react";
import { get, listen } from '@client/lib/api';

export interface ITreeReloader {
    onReload: (e: Array<ITreeItem>) => void;
    children: JSX.Element[] | JSX.Element; 
}

export default ({ onReload, children }: ITreeReloader) => {

    const [rldTrigger, setRldTrigger] = useState(0);

    useEffect(() => {
        get({ action: 'GET_TREE' }).then(({ payload }) => onReload(payload));
    }, [rldTrigger]);

    listen(({ action }) => {
        switch (action) {
            case "RELOAD_TREE":
                setRldTrigger(performance.now());
                break;
        }
    });

    return (<>{children}</>);


}