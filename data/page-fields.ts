import en from "@/messages/en.json";
import nl from "@/messages/nl.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";
import it from "@/messages/it.json";

/**
 * The page texts Roberto can edit under Admin → Page Content, per page.
 * Each is stored per language in Supabase `page_content` (kind 'text')
 * under the key `<locale>:<page>.<field>`, e.g. "it:home.introTitle".
 * Anything not saved yet falls back to the translation in /messages.
 */
export const EDITABLE_PAGES = ["home", "winery", "about", "visit"] as const;
export type EditablePage = (typeof EDITABLE_PAGES)[number];

export interface PageTextField {
  key: string;
  label: string;
  multiline?: boolean;
}

export const PAGE_TEXT_FIELDS: Record<EditablePage, PageTextField[]> = {
  home: [
    { key: "introTitle", label: "Intro title" },
    { key: "introText", label: "Intro text", multiline: true },
  ],
  winery: [
    { key: "openingLine", label: "Opening line (hero)", multiline: true },
    { key: "philosophyQuote", label: "Philosophy pull-quote", multiline: true },
    { key: "vineyardTitle", label: "Vineyard section title" },
    { key: "vineyardText1", label: "Vineyard — paragraph 1", multiline: true },
    { key: "vineyardText2", label: "Vineyard — paragraph 2", multiline: true },
    { key: "harvestTitle", label: "Harvest section title" },
    { key: "harvestText1", label: "Harvest — paragraph 1", multiline: true },
    { key: "harvestText2", label: "Harvest — paragraph 2", multiline: true },
    { key: "cellarTitle", label: "Cellar section title" },
    { key: "cellarText1", label: "Cellar — paragraph 1", multiline: true },
    { key: "cellarText2", label: "Cellar — paragraph 2", multiline: true },
    { key: "closingQuote", label: "Closing pull-quote", multiline: true },
    { key: "closingText", label: "Closing paragraph", multiline: true },
  ],
  about: [
    { key: "historyTitle", label: "History title" },
    { key: "historyText", label: "History text", multiline: true },
    { key: "todayTitle", label: "Today title" },
    { key: "todayText", label: "Today text", multiline: true },
  ],
  visit: [
    { key: "openingHoursTitle", label: "Opening hours — title" },
    { key: "openingHoursText", label: "Opening hours — hours & visit info", multiline: true },
  ],
};

export const TEXT_LOCALES = ["en", "nl", "de", "fr", "it"] as const;

const MESSAGES: Record<string, Record<string, Record<string, unknown>>> = { en, nl, de, fr, it };

export function pageTextKey(locale: string, page: string, field: string) {
  return `${locale}:${page}.${field}`;
}

/** The text currently in /messages for this field (the default). */
export function defaultPageText(locale: string, page: string, field: string): string {
  const value = MESSAGES[locale]?.[page]?.[field];
  return typeof value === "string" ? value : "";
}
