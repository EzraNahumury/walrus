// Deterministic, local-only insight generation. No external AI APIs.
//
// The goal is to surface signal a form owner could act on: average rating,
// rating distribution, recurring phrases in free-text fields, top tags,
// and a single "next action" suggestion derived from the data.

import type {
  FeedbackInsight,
  FormResponse,
  FormSchema,
  ResponseTriage,
} from "@/types/signalvault";

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","at","for","with","by",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","this","that","these","those","i","me","my","you","your","we","our",
  "they","their","it","its","as","if","so","than","then","there","here","not",
  "no","yes","just","very","really","also","because","when","what","which",
  "who","whom","how","about","from","into","over","under","up","down","out",
  "more","most","some","any","all","each","every","other","such",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

export function generateInsight(
  schema: FormSchema,
  responses: FormResponse[],
  triages: Record<string, ResponseTriage | undefined>,
): FeedbackInsight {
  const ratingField = schema.fields.find((f) => f.type === "star_rating");
  const ratings: number[] = [];
  const histogram: Record<number, number> = {};
  if (ratingField) {
    for (const r of responses) {
      const v = r.publicFields[ratingField.id];
      if (typeof v === "number") {
        ratings.push(v);
        histogram[v] = (histogram[v] ?? 0) + 1;
      }
    }
  }
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : undefined;

  const phraseCounts = new Map<string, number>();
  for (const r of responses) {
    for (const field of schema.fields) {
      if (field.type !== "rich_text" && field.type !== "short_text") continue;
      const v = r.publicFields[field.id];
      if (typeof v !== "string") continue;
      for (const tok of tokenize(v)) {
        phraseCounts.set(tok, (phraseCounts.get(tok) ?? 0) + 1);
      }
    }
  }
  const recurringPhrases = [...phraseCounts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase, count]) => ({ phrase, count }));

  const tagCounts = new Map<string, number>();
  let highPriorityCount = 0;
  for (const r of responses) {
    const t = triages[r.responseId];
    if (!t) continue;
    if (t.priority === "p0" || t.priority === "p1") highPriorityCount++;
    for (const tag of t.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, count }));

  let suggestedNextAction = "Collect more responses before drawing conclusions.";
  if (responses.length === 0) {
    suggestedNextAction = "Share the form link with your community to start collecting signal.";
  } else if (highPriorityCount > 0) {
    suggestedNextAction = `Triage ${highPriorityCount} high-priority response${highPriorityCount === 1 ? "" : "s"} flagged P0/P1.`;
  } else if (recurringPhrases.length > 0) {
    const top = recurringPhrases[0];
    suggestedNextAction = `Investigate the recurring theme “${top.phrase}” mentioned in ${top.count} responses.`;
  } else if (averageRating !== undefined && averageRating < 3.5) {
    suggestedNextAction = `Average rating is ${averageRating.toFixed(1)} — read low-rated responses first.`;
  }

  return {
    formId: schema.formId,
    generatedAt: Date.now(),
    totalResponses: responses.length,
    averageRating,
    ratingHistogram: ratingField ? histogram : undefined,
    topTags,
    recurringPhrases,
    highPriorityCount,
    suggestedNextAction,
  };
}
