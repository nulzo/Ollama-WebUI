import React from 'react';

interface InlineCodeBlockProps {
  code: string;
}

const InlineCodeBlock: React.FC<InlineCodeBlockProps> = ({ code }) => {
  return (
    <code
      className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-primary text-sm font-bold"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default InlineCodeBlock;
