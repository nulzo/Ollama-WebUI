import { useEffect, useRef } from 'react';

const useScrollToEnd = (messages) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return ref;
};

export default useScrollToEnd;