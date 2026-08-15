import type { CPBlock } from "./CenterPageSection";
import type { CenterPage } from "@/types/centerPage";

/**
 * What an editor can change on a centre page, section by section.
 *
 * Each entry names the document key it saves (the API's PATCH sets exactly that
 * key) and the fields inside it. The field names are the ones eg-academy renders,
 * so a section here maps one-to-one onto a band of the live page — hero, the
 * statistics strip, the about block, and so on down the page in order.
 */
export interface CenterSectionSpec {
  id: string;
  label: string;
  /** Document key, or "meta" for the page's own settings. */
  sectionKey: keyof CenterPage | "meta";
  description?: string;
  blocks: CPBlock[];
  /** Reads the section's current value off the page. */
  read: (page: CenterPage) => unknown;
  /** Only for sections that are not a single key (the settings tab). */
  patch?: (value: any) => Partial<CenterPage>;
}

const ICON_HINT = "Shown beside the text on the website.";

export const CENTER_SECTIONS: CenterSectionSpec[] = [
  {
    id: "settings",
    label: "Page settings",
    sectionKey: "meta",
    description:
      "The centre's name is used in the navigation (“Study in Malta”) and in the page title. The URL is fixed after the page is created, so existing links keep working.",
    read: (page) => ({
      name: page.name ?? "",
      country: page.country ?? "",
      order: page.order != null ? String(page.order) : "",
      metaTitle: page.metaTitle ?? "",
      metaDescription: page.metaDescription ?? "",
    }),
    patch: (v) => ({
      name: v.name,
      country: v.country,
      order: v.order === "" || v.order == null ? 0 : Number(v.order),
      metaTitle: v.metaTitle,
      metaDescription: v.metaDescription,
    }),
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "name", label: "Centre name", placeholder: "Malta" },
          {
            key: "country",
            label: "Country",
            placeholder: "malta",
            hint: "Lowercase, as the rest of the catalog stores it. Picks the flag in the site's menu.",
          },
          { key: "order", label: "Order in menus", placeholder: "3" },
        ],
      },
      {
        kind: "fields",
        title: "Search engines",
        fields: [
          {
            key: "metaTitle",
            label: "Page title",
            placeholder: "Study in Malta",
            hint: "Leave empty to use “Study in <centre name>”.",
          },
          {
            key: "metaDescription",
            label: "Meta description",
            kind: "textarea",
            hint: "Leave empty to use the hero paragraph.",
          },
        ],
      },
    ],
  },
  {
    id: "hero",
    label: "Hero",
    sectionKey: "hero",
    description: "The first screen: background photograph, headline and the Apply button.",
    read: (page) => page.hero,
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "badge", label: "Badge above the headline", placeholder: "Study in Malta" },
          { key: "title", label: "Headline", placeholder: "Europe's Global" },
          {
            key: "titleHighlight",
            label: "Headline, highlighted part",
            placeholder: "Campus.",
            hint: "Shown on its own line in violet.",
          },
          { key: "ctaLabel", label: "Button label", placeholder: "Apply Now" },
          { key: "ctaNote", label: "Note under the button", placeholder: "Intake 2026 Open" },
          { key: "subtitle", label: "Paragraph", kind: "textarea" },
          { key: "image", label: "Background image", kind: "image" },
          { key: "imageAlt", label: "Image description", placeholder: "Valletta Malta skyline" },
        ],
      },
    ],
  },
  {
    id: "stats",
    label: "Statistics",
    sectionKey: "stats",
    description:
      "The four figures on the card overlapping the hero. Digits count up on the website, so “150,000+” and “1st” both work.",
    read: (page) => page.stats,
    blocks: [
      {
        kind: "list",
        under: null,
        title: "Figures",
        itemLabel: "Figure",
        fields: [
          { key: "value", label: "Figure", placeholder: "150,000+" },
          { key: "label", label: "Label", placeholder: "International Students" },
          { key: "icon", label: "Icon", kind: "icon", hint: ICON_HINT },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About the centre",
    sectionKey: "about",
    description: "The photograph with the years badge, and the three points beside it.",
    read: (page) => page.about,
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "years", label: "Years badge", placeholder: "10+" },
          { key: "yearsSubtitle", label: "Years badge caption", placeholder: "Years of Guiding International Students" },
          { key: "mainTitle", label: "Heading", kind: "textarea" },
          { key: "highlightedPart", label: "Heading, highlighted ending", placeholder: "opportunities." },
          { key: "image", label: "Photograph", kind: "image" },
          { key: "imageAlt", label: "Image description" },
        ],
      },
      {
        kind: "list",
        under: "features",
        title: "Points",
        itemLabel: "Point",
        fields: [
          { key: "title", label: "Title", placeholder: "Worldwide Recognition" },
          { key: "icon", label: "Icon", kind: "icon", hint: ICON_HINT },
          { key: "description", label: "Description", kind: "textarea" },
        ],
      },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    sectionKey: "lifestyle",
    description: "Living there: the heading, the photograph and the benefits list.",
    read: (page) => page.lifestyle,
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "title", label: "Heading", placeholder: "Elite Malta Lifestyle" },
          { key: "imageAlt", label: "Image description" },
          { key: "subtitle", label: "Paragraph", kind: "textarea" },
          { key: "image", label: "Photograph", kind: "image" },
        ],
      },
      {
        kind: "list",
        under: "benefits",
        title: "Benefits",
        itemLabel: "Benefit",
        fields: [
          { key: "title", label: "Title", placeholder: "Affordable Living" },
          { key: "icon", label: "Icon", kind: "icon", hint: ICON_HINT },
          { key: "description", label: "Description", kind: "textarea" },
        ],
      },
    ],
  },
  {
    id: "courses",
    label: "Programmes",
    sectionKey: "courses",
    description:
      "The “Explore Our Specializations” list. This is marketing copy for this centre — the searchable catalog is Academy Courses. A programme typed as “Top Up” appears under the Top Up filter on the site.",
    read: (page) => page.courses,
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "subtitle", label: "Intro paragraph", kind: "textarea" },
          { key: "footerTitle", label: "Footer heading", placeholder: "Need a custom program?" },
          { key: "buttonText", label: "Footer button", placeholder: "Book a Consultation" },
          { key: "footerDescription", label: "Footer paragraph", kind: "textarea" },
        ],
      },
      {
        kind: "list",
        under: "items",
        title: "Programmes",
        itemLabel: "Programme",
        fields: [
          { key: "name", label: "Programme", placeholder: "BA (Hons) Business Management" },
          { key: "type", label: "Type", placeholder: "Bachelor's Degree" },
        ],
      },
    ],
  },
  {
    id: "process",
    label: "Admission steps",
    sectionKey: "process",
    description: "The numbered “How to Join Us” flow.",
    read: (page) => page.process,
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "title", label: "Heading", placeholder: "How to" },
          { key: "highlightText", label: "Heading, highlighted part", placeholder: "Join Us" },
          { key: "subtitle", label: "Paragraph", kind: "textarea" },
          { key: "ctaSubtext", label: "Note under the call to action", placeholder: "Takes less than 10 minutes" },
        ],
      },
      {
        kind: "list",
        under: "steps",
        title: "Steps",
        itemLabel: "Step",
        fields: [
          { key: "step", label: "Number", placeholder: "01" },
          { key: "label", label: "Title", placeholder: "Choose Your Course" },
          { key: "icon", label: "Icon", kind: "icon", hint: ICON_HINT },
          { key: "desc", label: "Description", kind: "textarea" },
        ],
      },
    ],
  },
  {
    id: "future",
    label: "Opportunities",
    sectionKey: "future",
    description: "The three cards about careers, networking and transferring credits.",
    read: (page) => page.future,
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "mainTitle", label: "Heading", placeholder: "Malta" },
          { key: "subtitle", label: "Paragraph", kind: "textarea" },
        ],
      },
      {
        kind: "fields",
        under: "statCard",
        title: "Employment card",
        fields: [
          { key: "stat", label: "Figure", placeholder: "91%" },
          { key: "label", label: "Label", placeholder: "Employment Success" },
          { key: "description", label: "Description", kind: "textarea" },
        ],
      },
      {
        kind: "fields",
        under: "networkingCard",
        title: "Networking card",
        fields: [{ key: "description", label: "Description", kind: "textarea" }],
      },
      {
        kind: "fields",
        under: "creditTransfer",
        title: "Credit transfer card",
        fields: [
          { key: "title", label: "Title", placeholder: "Global University Transfer" },
          { key: "buttonText", label: "Button", placeholder: "See Transfer Partners →" },
          { key: "description", label: "Description", kind: "textarea" },
        ],
      },
    ],
  },
  {
    id: "faqs",
    label: "FAQs",
    sectionKey: "faqs",
    description: "The questions at the foot of the page.",
    read: (page) => page.faqs,
    blocks: [
      {
        kind: "list",
        under: null,
        title: "Questions",
        itemLabel: "Question",
        fields: [
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", kind: "textarea" },
        ],
      },
    ],
  },
  {
    id: "cta",
    label: "Closing banner",
    sectionKey: "cta",
    description: "The violet band at the very bottom of the page.",
    read: (page) => page.cta,
    blocks: [
      {
        kind: "fields",
        fields: [
          { key: "title", label: "Heading", placeholder: "Ready to start your journey to Malta?" },
        ],
      },
    ],
  },
];
