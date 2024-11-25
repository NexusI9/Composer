import ResizerIcon from '@icons/resizer.svg';
import './Resizer.scss';
import { useEffect, useState } from "react";
import { send } from '@client/lib/api';

export default () => {

    const [active, setActive] = useState(false);

    useEffect(() => {

        const onMouseMove = (e: any) => send({ action: 'RESIZE_WINDOW', payload: { width: e.x, height: e.y } });
        const setFalse = () => setActive(false);

        if (active) {
            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', setFalse);
        } else {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', setFalse);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', setFalse);
        }

    }, [active]);

    return (
        <div
            onMouseDown={() => setActive(true)}
            className="resizer"
            role='DISABLED'
        >
            <ResizerIcon />
        </div>);
}