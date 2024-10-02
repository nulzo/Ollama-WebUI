import katex from 'katex';
import 'katex/contrib/mhchem/mhchem.js';
import 'katex/dist/katex.min.css';

const KatexRenderer = ({ content, displayMode = false }) => {
  const renderedContent = katex.renderToString(content, {
    displayMode,
    throwOnError: false,
    strict: false,
    output: 'html',
  });

  return (
    <span
      className="inline-block align-middle"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default KatexRenderer;
