/**
 * Utility functions for formatting AI responses
 */

/**
 * Formats AI response text for better display
 * - Converts **text** to headlines
 * - Removes ## markdown headers
 * - Cleans up other markdown formatting
 */
export function formatAIResponse(text: string): string {
  return text
    // Convert **text** to headlines (remove the ** and make it a headline)
    .replace(/\*\*(.*?)\*\*/g, (match, content) => {
      return `\n\n${content.toUpperCase()}\n${'='.repeat(content.length)}\n`;
    })
    // Remove ## headers
    .replace(/^#{1,6}\s*/gm, '')
    // Remove markdown bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove markdown links
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up extra whitespace and newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
}

/**
 * Formats AI response for React component display
 * Returns an array of text segments with formatting information
 */
export function formatResponseForDisplay(text: string): Array<{
  type: 'text' | 'headline';
  content: string;
}> {
  const segments: Array<{ type: 'text' | 'headline'; content: string }> = [];
  
  // Split by **text** patterns
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      // This is a headline
      const headlineText = part.slice(2, -2);
      segments.push({
        type: 'headline',
        content: headlineText
      });
    } else if (part.trim()) {
      // This is regular text
      const cleanText = part
        .replace(/^#{1,6}\s*/gm, '') // Remove ## headers
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      
      if (cleanText) {
        segments.push({
          type: 'text',
          content: cleanText
        });
      }
    }
  }
  
  return segments;
}
