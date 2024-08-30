import { useEffect, useRef } from 'react';

const useScrollToEnd = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return ref;
};

export default useScrollToEnd;