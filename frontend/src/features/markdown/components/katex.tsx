import katex from "katex";
import 'katex/contrib/mhchem';
import 'katex/dist/katex.min.css';

const KatexRenderer = ({ content, displayMode = false }) => {
  const renderedContent = katex.renderToString(content, {
    displayMode,
    throwOnError: false
  });

  return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
};

export default KatexRenderer;