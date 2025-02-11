import React from 'react';

interface InlineCodeBlockProps {
  code: string;
}

const InlineCodeBlock: React.FC<InlineCodeBlockProps> = ({ code }) => {
  return (
    <code
      className="relative bg-muted px-[0.3rem] py-[0.2rem] rounded font-bold font-geistmono text-primary text-sm prose markdown-prose"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default InlineCodeBlock;
