/**
 * Processes message content to add inline citation markers
 * 
 * @param content The original message content
 * @param citations Array of citation objects
 * @returns The processed content with inline citation markers
 */
export function addInlineCitations(content: string, citations?: Array<{
  text: string;
  chunk_id: string;
  knowledge_id: string;
  metadata?: {
    source?: string;
    page?: number;
    row?: number;
    citation?: string;
    [key: string]: any;
  };
}>): string {
  console.log('addInlineCitations called with:', { 
    contentLength: content?.length, 
    citationsCount: citations?.length
  });

  if (!citations || citations.length === 0 || !content) {
    console.log('No citations or content to process, returning original content');
    return content;
  }

  // IMPORTANT: The content from the server already has citations properly formatted
  // We should NOT try to add citation markers, as this is causing the [0][0][0] sequences
  // Instead, just clean up any problematic patterns and return the content as is
  
  // Clean up problematic patterns
  let cleanedContent = content;
  
  // Remove Unicode null characters
  cleanedContent = cleanedContent.replace(/\u0000/g, '');
  
  // Remove any trailing 'e:' that might be a partial citation marker
  cleanedContent = cleanedContent.replace(/e:$/g, '');
  
  return cleanedContent;
}

/**
 * Test function to force inline citations to appear
 * This function adds citation markers at the end of each paragraph
 * regardless of whether the citation text matches the content
 */
export function forceInlineCitations(content: string, citations?: Array<{
  text: string;
  chunk_id: string;
  knowledge_id: string;
  metadata?: {
    source?: string;
    page?: number;
    row?: number;
    citation?: string;
    [key: string]: any;
  };
}>): string {
  console.log('forceInlineCitations called with:', { 
    contentLength: content?.length, 
    citationsCount: citations?.length 
  });

  if (!citations || citations.length === 0 || !content) {
    console.log('No citations or content to process, returning original content');
    return content;
  }

  // IMPORTANT: The content from the server already has citations properly formatted
  // We should NOT try to add citation markers, as this is causing the [0][0][0] sequences
  // Instead, just clean up any problematic patterns and return the content as is
  
  // Clean up problematic patterns
  let cleanedContent = content;
  
  // Remove Unicode null characters
  cleanedContent = cleanedContent.replace(/\u0000/g, '');
  
  // Remove any trailing 'e:' that might be a partial citation marker
  cleanedContent = cleanedContent.replace(/e:$/g, '');
  
  return cleanedContent;
} 