export function normalizeSlides(slides) {
  return slides.map(slide => {
    let content = slide.content;
    console.log("🔍 Before normalize:", content, "Type:", typeof content);

    // Handle null/undefined content
    if (!content) {
      return { ...slide, content: [] };
    }

    // Case 1: Already a proper array
    if (Array.isArray(content)) {
      // Check if it's a single string with newlines
      if (content.length === 1 && typeof content[0] === "string") {
        const innerContent = content[0];
        
        // Split on newline characters
        if (innerContent.includes('\n')) {
          let cleaned = innerContent
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);

          console.log("✅ After normalize (newline split case):", cleaned);
          return { ...slide, content: cleaned };
        }
        
        // PostgreSQL array format: {"text1","text2","text3"}
        if (innerContent.startsWith("{") && innerContent.endsWith("}")) {
          let cleaned = innerContent
            .slice(1, -1) // remove outer braces
            .split('","') // split on "," 
            .map(s => {
              // Remove quotes from start and end
              return s.replace(/^"/, '').replace(/"$/, '').trim();
            })
            .filter(Boolean);

          console.log("✅ After normalize (PostgreSQL array case):", cleaned);
          return { ...slide, content: cleaned };
        }
        
        // Single string in array - check if it needs splitting
        if (innerContent.includes('","') || innerContent.includes('", "')) {
          // Looks like concatenated content, try to split
          let parts = innerContent.split(/",\s*"|\s*,\s*/).map(s => s.replace(/["{}\[\]]/g, '').trim()).filter(Boolean);
          console.log("✅ After normalize (split string case):", parts);
          return { ...slide, content: parts };
        }
      }

      // Normal array case - check each element for newlines
      const processedContent = content.map(item => {
        if (typeof item === 'string') {
          // Split on newlines if present
          if (item.includes('\n')) {
            return item.split('\n').map(s => s.trim()).filter(Boolean);
          }
          // Try to parse as JSON
          if (item.startsWith('{') || item.startsWith('[')) {
            try {
              const parsed = JSON.parse(item);
              return Array.isArray(parsed) ? parsed : [item];
            } catch {
              return item;
            }
          }
        }
        return item;
      }).flat();

      console.log("✅ After normalize (normal array case):", processedContent);
      return { ...slide, content: processedContent };
    }

    // Case 2: String content
    if (typeof content === "string") {
      // Split on newlines first (this is your main case)
      if (content.includes('\n')) {
        let cleaned = content
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean);

        console.log("✅ After normalize (newline string case):", cleaned);
        return { ...slide, content: cleaned };
      }

      // PostgreSQL array string format
      if (content.startsWith("{") && content.endsWith("}")) {
        let cleaned = content
          .slice(1, -1) // remove braces
          .split(/",\s*"/) // split on quote-comma-quote pattern
          .map(s => s.replace(/^"/, '').replace(/"$/, '').trim())
          .filter(Boolean);

        console.log("✅ After normalize (PostgreSQL string case):", cleaned);
        return { ...slide, content: cleaned };
      }

      // JSON array string format
      if (content.startsWith("[") && content.endsWith("]")) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            console.log("✅ After normalize (JSON array case):", parsed);
            return { ...slide, content: parsed };
          }
        } catch (e) {
          console.warn("Failed to parse JSON array:", e);
        }
      }

      // Check for comma-separated values
      if (content.includes(',')) {
        let parts = content.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length > 1) {
          console.log("✅ After normalize (comma split case):", parts);
          return { ...slide, content: parts };
        }
      }

      // Single string content
      console.log("✅ After normalize (single string case):", [content]);
      return { ...slide, content: [content] };
    }

    // Fallback case
    console.log("✅ After normalize (fallback case):", [String(content)]);
    return { ...slide, content: [String(content)] };
  });
}