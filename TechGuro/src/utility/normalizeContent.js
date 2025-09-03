export function normalizeSlides(slides) {
  return slides.map(slide => {
    let content = slide.content;
    console.log("🔍 Before normalize:", content);

    if (Array.isArray(content)) {
      // Case: raw Postgres literal wrapped inside an array
      if (
        content.length === 1 &&
        typeof content[0] === "string" &&
        content[0].startsWith("{") &&
        content[0].endsWith("}")
      ) {
        let cleaned = content[0]
          .slice(1, -1) // remove {}
          .split(/","/) // split on "," only
          .map(s => s.replace(/^"|"$/g, "").trim())
          .filter(Boolean);

        console.log("✅ After normalize (array case):", cleaned);
        return { ...slide, content: cleaned };
      }

      // Normal array → just return
      return { ...slide, content };
    }

    if (!content) {
      return { ...slide, content: [] };
    }

    if (typeof content === "string") {
      if (content.startsWith("{") && content.endsWith("}")) {
        let cleaned = content
          .slice(1, -1)
          .split(/","/)
          .map(s => s.replace(/^"|"$/g, "").trim())
          .filter(Boolean);

        console.log("✅ After normalize (string case):", cleaned);
        return { ...slide, content: cleaned };
      }

      return { ...slide, content: [content] };
    }

    return { ...slide, content: [String(content)] };
  });
}