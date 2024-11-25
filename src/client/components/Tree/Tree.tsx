import { useEffect, useState } from "react";
import TreeItem, { ITreeItem } from '@components/TreeItem/TreeItem';
import { get, listen } from '@client/lib/api';
import './Tree.scss';
import TreeReloader from "@components/TreeReloader/TreeReloader";

export default () => {

    const [tree, setTree] = useState<Array<ITreeItem>>([]);
    const [rldTrigger, setRldTrigger] = useState(0);

    useEffect(() => {
        get({ action: 'GET_TREE' }).then(({ payload }) => setTree(payload));
    }, [rldTrigger]);

    listen(({ action }) => {
        switch (action) {
            case "RELOAD_TREE":
                setRldTrigger(performance.now());
                break;
        }
    });

    return (<div className="tree flex f-row padding-bottom-xl gap-xl full-height">
        <TreeReloader onReload={setTree}>
            {tree.map(item => <TreeItem key={item.id} {...item} />)}
        </TreeReloader>
    </div>);
}