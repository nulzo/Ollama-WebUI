const CodeCopyButton = ({
  onClick,
  copied,
}: {
  onClick: any;
  copied: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className="hover:text-foreground flex items-center text-muted-foreground gap-0.5 text-xs absolute top-1 right-4 rounded px-2 py-1 cursor-pointer transition"
      aria-label="Copy to clipboard"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 "
      >
        {copied ? (
          <>
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M5 12l5 5l10 -10"></path>
          </>
        ) : (
          <>
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
            <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
          </>
        )}
      </svg>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

export default CodeCopyButton;
