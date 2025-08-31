// utils/normalizeContent.js
export function normalizeSlides(slides) {
  return slides.map(slide => {
    let content = slide.content;

    if (typeof content === "string") {
      try {
        content = JSON.parse(content);
      } catch {
        content = content.replace(/[{}"]/g, "").split(",");
      }
    }

    if (!Array.isArray(content)) {
      content = [content];
    }

    return { ...slide, content };
  });
}
