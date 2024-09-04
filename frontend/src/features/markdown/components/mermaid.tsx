import React from 'react';
import useMermaid from '../hooks/use-mermaid';

interface MermaidComponentProps {
    code: string;
}

const MermaidComponent: React.FC<MermaidComponentProps> = ({ code }) => {
    const { mermaidHtml, loading, error } = useMermaid(code);

    if (loading) {
        return <div>Loading Mermaid diagram...</div>;
    }

    if (error) {
        return <div>Error rendering Mermaid diagram: {error}</div>;
    }

    return <div dangerouslySetInnerHTML={{ __html: mermaidHtml || '' }} />;
};

export default MermaidComponent;