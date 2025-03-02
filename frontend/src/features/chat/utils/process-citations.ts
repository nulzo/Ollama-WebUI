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
    citationsCount: citations?.length,
    citations: citations
  });

  if (!citations || citations.length === 0 || !content) {
    console.log('No citations or content to process, returning original content');
    return content;
  }

  // Create a map of chunk IDs to citation indices
  const citationMap = new Map<string, number>();
  citations.forEach((citation, index) => {
    citationMap.set(citation.chunk_id, index + 1);
  });

  // For each citation, find relevant sentences in the content and add citation markers
  let processedContent = content;
  
  // Sort citations by text length (descending) to avoid partial matches
  const sortedCitations = [...citations].sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
  
  // Keep track of positions where we've already inserted citations to avoid duplicates
  const insertedPositions = new Set<number>();
  
  console.log('Processing citations:', sortedCitations);
  
  // Process each citation
  sortedCitations.forEach(citation => {
    // Extract the first few words from the citation text to use as a search pattern
    const citationText = citation.text || '';
    if (!citationText || citationText.length < 15) {
      console.log(`Citation text too short (${citationText.length} chars), skipping:`, citationText);
      return; // Skip if too short
    }
    
    // Create multiple search patterns of different lengths to increase match probability
    const words = citationText.split(' ');
    const searchPatterns = [
      words.slice(0, Math.min(8, words.length)).join(' '),
      words.slice(0, Math.min(5, words.length)).join(' '),
      words.slice(0, Math.min(3, words.length)).join(' ')
    ].filter(pattern => pattern.length > 10);
    
    console.log('Search patterns for citation:', searchPatterns);
    
    // Try each search pattern
    let foundAnyMatch = false;
    for (const searchPattern of searchPatterns) {
      // Find potential matches in the content
      let startIndex = 0;
      let foundMatch = false;
      
      while (startIndex < processedContent.length) {
        const matchIndex = processedContent.toLowerCase().indexOf(searchPattern.toLowerCase(), startIndex);
        if (matchIndex === -1) {
          console.log(`No match found for pattern: "${searchPattern}"`);
          break;
        }
        
        console.log(`Found match for pattern "${searchPattern}" at index ${matchIndex}`);
        
        // Find the end of the sentence or paragraph
        let endIndex = processedContent.indexOf('.', matchIndex);
        const paragraphEnd = processedContent.indexOf('\n', matchIndex);
        
        if (endIndex === -1 || (paragraphEnd !== -1 && paragraphEnd < endIndex)) {
          endIndex = paragraphEnd;
        }
        
        if (endIndex === -1) endIndex = processedContent.length;
        
        // Check if we've already inserted a citation near this position
        let alreadyInserted = false;
        for (const pos of insertedPositions) {
          if (Math.abs(pos - endIndex) < 50) {
            alreadyInserted = true;
            console.log(`Citation already inserted near position ${endIndex}, skipping`);
            break;
          }
        }
        
        if (!alreadyInserted) {
          // Insert the citation marker at the end of the sentence
          const citationMarker = ` [^cite:${citation.chunk_id}]`;
          processedContent = 
            processedContent.substring(0, endIndex) + 
            citationMarker + 
            processedContent.substring(endIndex);
          
          console.log(`Inserted citation marker "${citationMarker}" at position ${endIndex}`);
          
          // Update indices to account for the inserted text
          insertedPositions.add(endIndex);
          foundMatch = true;
          foundAnyMatch = true;
          break; // Found a match for this pattern, move to next citation
        } else {
          startIndex = endIndex + 1;
        }
      }
      
      if (foundMatch) break; // Found a match with this pattern, no need to try others
    }
    
    if (!foundAnyMatch) {
      console.log(`No matches found for citation: ${citation.chunk_id}`);
    }
  });
  
  console.log('Final processed content:', processedContent);
  
  return processedContent;
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

  // Use a much simpler approach - add citations at the end of the content
  // This avoids issues with regex and complex text processing
  
  let processedContent = content;
  
  // Add a summary section at the end with citations
  processedContent += "\n\n**Sources:**\n";
  
  // Create a map to track unique sources to avoid duplicates
  const uniqueSources = new Map();
  
  // Add each citation as a separate bullet point
  citations.forEach((citation, index) => {
    // Extract source information from metadata if available
    const source = citation.metadata?.source || citation.metadata?.citation || `Source ${index + 1}`;
    
    // Skip if we've already added this source
    if (uniqueSources.has(source)) {
      return;
    }
    
    // Add the source to our tracking map
    uniqueSources.set(source, true);
    
    // Add the citation as a bullet point
    processedContent += `\n* ${source}`;
  });
  
  console.log('Simplified forced citations content created');
  
  return processedContent;
} 