import { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';
import he from 'he';

const useMermaid = (code: string) => {
  const [mermaidHtml, setMermaidHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        const decodedCode = he.decode(code);
        mermaid.initialize({
          startOnLoad: true,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
          suppressErrorRendering: true,
        });

        const { svg } = await mermaid.render(`mermaid-${uuidv4()}`, decodedCode);
        setMermaidHtml(svg);
        setError(null); // Clear any previous errors
      } catch (err: any | unknown) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      renderMermaid();
    }
  }, [code]);

  return { mermaidHtml, loading, error };
};

export default useMermaid;
