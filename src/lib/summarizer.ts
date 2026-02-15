import { Definition, SummarySection, Summary } from "@/types";
import { generateId } from "./id";

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ". ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

function extractKeyTerms(text: string): Definition[] {
  const definitions: Definition[] = [];
  const lines = text.split(/\n+/).filter((l) => l.trim().length > 0);

  for (const line of lines) {
    // Pattern: "Term: definition" or "Term - definition"
    const colonMatch = line.match(/^([A-Z][A-Za-z\s]{2,30}):\s*(.{15,})/);
    if (colonMatch) {
      definitions.push({ term: colonMatch[1].trim(), definition: colonMatch[2].trim() });
      continue;
    }
    const dashMatch = line.match(/^([A-Z][A-Za-z\s]{2,30})\s*[-–—]\s*(.{15,})/);
    if (dashMatch) {
      definitions.push({ term: dashMatch[1].trim(), definition: dashMatch[2].trim() });
      continue;
    }
    // Pattern: "X is defined as Y" or "X refers to Y"
    const isMatch = line.match(/([A-Z][A-Za-z\s]{2,30})\s+(?:is defined as|refers to|is|are)\s+(.{15,})/);
    if (isMatch && !isMatch[1].match(/^(The|This|That|These|Those|It|They|We|He|She|And|But|Or|If|When|While)\s/i)) {
      definitions.push({ term: isMatch[1].trim(), definition: isMatch[2].trim() });
    }
  }

  // Deduplicate by term
  const seen = new Set<string>();
  return definitions.filter((d) => {
    const key = d.term.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

function buildSections(text: string): SummarySection[] {
  const sections: SummarySection[] = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);

  if (paragraphs.length <= 1) {
    const sentences = splitIntoSentences(text);
    const chunkSize = Math.max(3, Math.ceil(sentences.length / 4));
    const sectionNames = ["Introduction", "Core Concepts", "Analysis", "Key Takeaways"];
    for (let i = 0; i < Math.min(4, Math.ceil(sentences.length / chunkSize)); i++) {
      const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunk.length > 0) {
        sections.push({
          heading: sectionNames[i] || `Section ${i + 1}`,
          content: chunk.join(" "),
        });
      }
    }
  } else {
    const sectionNames = [
      "Introduction & Overview",
      "Foundational Concepts",
      "Core Analysis",
      "Detailed Examination",
      "Applications & Examples",
      "Summary & Conclusions",
    ];
    for (let i = 0; i < Math.min(paragraphs.length, 6); i++) {
      const heading = sectionNames[i] || `Section ${i + 1}`;
      sections.push({ heading, content: paragraphs[i].trim() });
    }
  }

  return sections;
}

function buildExecutiveSummary(text: string): string[] {
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return ["No content available for summarization."];

  // Pick sentences spread across the text for diversity
  const bulletCount = Math.min(5, sentences.length);
  const step = Math.max(1, Math.floor(sentences.length / bulletCount));
  const bullets: string[] = [];
  for (let i = 0; i < bulletCount; i++) {
    const idx = Math.min(i * step, sentences.length - 1);
    let sentence = sentences[idx];
    // Clean up and ensure reasonable length
    if (sentence.length > 200) sentence = sentence.slice(0, 197) + "...";
    bullets.push(sentence);
  }
  return bullets;
}

export function generateSummary(
  unitId: string,
  contentIds: string[],
  title: string,
  rawTexts: string[]
): Summary {
  const combinedText = rawTexts.join("\n\n");

  return {
    id: generateId(),
    unitId,
    contentIds,
    title: `${title} - Study Guide`,
    executiveSummary: buildExecutiveSummary(combinedText),
    keyDefinitions: extractKeyTerms(combinedText),
    detailedBreakdown: buildSections(combinedText),
    createdAt: new Date().toISOString(),
  };
}

export function summaryToMarkdown(summary: Summary): string {
  let md = `# ${summary.title}\n\n`;
  md += `_Generated on ${new Date(summary.createdAt).toLocaleDateString()}_\n\n`;

  md += `## Executive Summary\n\n`;
  for (const bullet of summary.executiveSummary) {
    md += `- ${bullet}\n`;
  }
  md += `\n`;

  if (summary.keyDefinitions.length > 0) {
    md += `## Key Definitions\n\n`;
    for (const def of summary.keyDefinitions) {
      md += `**${def.term}**: ${def.definition}\n\n`;
    }
  }

  md += `## Detailed Breakdown\n\n`;
  for (const section of summary.detailedBreakdown) {
    md += `### ${section.heading}\n\n${section.content}\n\n`;
  }

  return md;
}
