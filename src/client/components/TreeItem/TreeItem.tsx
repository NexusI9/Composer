import { Text } from '@radix-ui/themes';
import './TreeItem.scss';
import { LayerType } from '@ctypes/settings';

import ComponentIcon from "@icons/component.svg";
import EllipseIcon from "@icons/ellipse.svg";
import FrameIcon from "@icons/frame.svg";
import GroupIcon from "@icons/group.svg";
import InstanceIcon from "@icons/instance.svg";
import LineIcon from "@icons/line.svg";
import RectangleIcon from "@icons/rectangle.svg";
import StarIcon from "@icons/star.svg";
import TextIcon from "@icons/text.svg";
import PolygonIcon from "@icons/polygon.svg";
import { createElement } from 'react';

export interface ITreeItem {
    name: string;
    path: string;
    id: string;
    subdir: ITreeItem[];
    active: boolean;
    type: LayerType;
    position: { x: number, y: number };
}

type IIconType = {
    [key in LayerType]: string;
}

const iconType: IIconType = {
    "FRAME": FrameIcon,
    "TEXT": TextIcon,
    "RECTANGLE": RectangleIcon,
    "GROUP": GroupIcon,
    "LINE": LineIcon,
    "ELLIPSE": EllipseIcon,
    "POLYGON": PolygonIcon,
    "STAR": StarIcon,
    "COMPONENT": ComponentIcon,
    "COMPONENT_SET": ComponentIcon,
    "INSTANCE": InstanceIcon
}

const TreeItem = ({ name, subdir, active, type }: ITreeItem) => {
    return (<div className="tree-item padding-left-xl flex-no-shrink" data-active={active}>
        <Text size="2" className='flex f-row gap-m f-center-h'>
            <span className="flex f-row gap-s f-center-h">
                <span className='tree-item-subdir color-text-base-700'>└</span>
                {createElement(iconType[type])}
            </span>
            <span className='tree-item-folder'>
                {name}
            </span>

        </Text>
        {subdir.map(item => <TreeItem key={item.id} {...item} />)}
    </div>)
}

export default TreeItem;
