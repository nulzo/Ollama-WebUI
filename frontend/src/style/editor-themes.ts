import { type editor } from 'monaco-editor';

export function createEditorTheme(isDark: boolean): editor.IStandaloneThemeData {
  const lightTheme = {
    // From your syntax.css light theme
    keyword: '#d73a49',      // keywords, tags, etc.
    entity: '#6f42c1',       // functions, classes
    constant: '#005cc5',     // constants, numbers
    string: '#032f62',       // strings
    variable: '#e36209',     // variables
    comment: '#6a737d',      // comments
    tag: '#22863a',          // tags
    markup: '#24292e',       // general markup
    heading: '#005cc5',      // headings
    list: '#735c0f',         // lists
  };

  const darkTheme = {
    // From your syntax.css dark theme (Tokyo Night)
    background: '#09090b',
    foreground: '#fafafa',
    comment: '#565f89',
    red: '#f7768e',         // keywords, regex
    orange: '#ff9e64',      // numbers, constants
    yellow: '#e0af68',      // built-ins
    cyan: '#2ac3de',        // selectors
    lightBlue: '#7dcfff',   // functions, properties
    green: '#73daca',       // selectors
    greener: '#9ece6a',     // strings
    blue: '#7aa2f7',        // sections
    magenta: '#bb9af7',     // operators
    white: '#c0caf5',       // punctuation
  };

  return {
    base: isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [
      // Base text and background
      { token: '', foreground: isDark ? darkTheme.foreground : lightTheme.markup },
      
      // Comments
      { token: 'comment', foreground: isDark ? darkTheme.comment.slice(1) : lightTheme.comment.slice(1) },
      
      // Keywords
      { token: 'keyword', foreground: isDark ? darkTheme.red.slice(1) : lightTheme.keyword.slice(1) },
      { token: 'keyword.control', foreground: isDark ? darkTheme.magenta.slice(1) : lightTheme.keyword.slice(1) },
      
      // Strings
      { token: 'string', foreground: isDark ? darkTheme.greener.slice(1) : lightTheme.string.slice(1) },
      
      // Numbers and constants
      { token: 'number', foreground: isDark ? darkTheme.orange.slice(1) : lightTheme.constant.slice(1) },
      { token: 'constant', foreground: isDark ? darkTheme.orange.slice(1) : lightTheme.constant.slice(1) },
      
      // Functions and classes
      { token: 'function', foreground: isDark ? darkTheme.lightBlue.slice(1) : lightTheme.entity.slice(1) },
      { token: 'class', foreground: isDark ? darkTheme.lightBlue.slice(1) : lightTheme.entity.slice(1) },
      
      // Variables
      { token: 'variable', foreground: isDark ? darkTheme.white.slice(1) : lightTheme.variable.slice(1) },
      { token: 'variable.predefined', foreground: isDark ? darkTheme.orange.slice(1) : lightTheme.constant.slice(1) },
      
      // Operators
      { token: 'operator', foreground: isDark ? darkTheme.magenta.slice(1) : lightTheme.keyword.slice(1) },
      
      // Tags
      { token: 'tag', foreground: isDark ? darkTheme.red.slice(1) : lightTheme.tag.slice(1) },
      
      // Types
      { token: 'type', foreground: isDark ? darkTheme.lightBlue.slice(1) : lightTheme.entity.slice(1) },
      
      // Regexp
      { token: 'regexp', foreground: isDark ? darkTheme.red.slice(1) : lightTheme.keyword.slice(1) },
    ],
    colors: {
      // Editor UI colors
      'editor.background': isDark ? darkTheme.background : '#ffffff',
      'editor.foreground': isDark ? darkTheme.foreground : lightTheme.markup,
      'editor.lineHighlightBackground': isDark ? '#292e42' : '#f8f9fa',
      'editor.selectionBackground': isDark ? '#515c7e' : '#add6ff',
      'editor.inactiveSelectionBackground': isDark ? '#3b4261' : '#e5ebf1',
      'editorLineNumber.foreground': isDark ? darkTheme.comment : '#6e7681',
      'editorLineNumber.activeForeground': isDark ? darkTheme.foreground : '#24292e',
      'editorIndentGuide.background': isDark ? '#292e42' : '#f0f1f2',
      'editorIndentGuide.activeBackground': isDark ? '#3b4261' : '#d0d7de',
      'editor.selectionHighlightBorder': isDark ? '#515c7e' : '#add6ff',
      'editorCursor.foreground': isDark ? darkTheme.white : lightTheme.markup,
      'editorWhitespace.foreground': isDark ? '#3b4261' : '#6e7681',
      'editorBracketMatch.background': isDark ? '#515c7e40' : '#c8e1ff',
      'editorBracketMatch.border': isDark ? '#515c7e' : '#add6ff',
    },
  };
}