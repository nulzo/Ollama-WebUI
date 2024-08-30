import { useEffect, useRef } from 'react';

const useScrollToEnd = (deps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [...deps]);

    return ref;
};

export default useScrollToEnd;