import React from 'react';

interface InlineCodeBlockProps {
  code: string;
}

const InlineCodeBlock: React.FC<InlineCodeBlockProps> = ({ code }) => {
  return (
    <code
      className="text-sm font-semibold bg-primary/10 py-0.5 px-1.5 mx-0.5 rounded-md text-purple-300"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default InlineCodeBlock;