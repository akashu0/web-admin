/**
 * An eG Academy centre landing page — what eg-academy serves at
 * /centers/study-in-malta. Mirrors internal/catalog/centerpage.go.
 *
 * Every content field is optional: sections are saved one at a time, so a page
 * being written is partial by design.
 */
export interface CenterPage {
  _id: string;
  slug: string;
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;

  name: string;
  country?: string;
  order?: number;

  hero?: CenterHero;
  stats?: CenterStat[];
  about?: CenterAbout;
  lifestyle?: CenterLifestyle;
  courses?: CenterCourses;
  process?: CenterProcess;
  future?: CenterFuture;
  faqs?: CenterQA[];
  cta?: { title?: string };

  metaTitle?: string;
  metaDescription?: string;
}

export interface CenterHero {
  badge?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaNote?: string;
}

export interface CenterStat {
  label?: string;
  value?: string;
  icon?: string;
}

export interface CenterFeature {
  title?: string;
  description?: string;
  icon?: string;
}

export interface CenterAbout {
  years?: string;
  yearsSubtitle?: string;
  mainTitle?: string;
  highlightedPart?: string;
  image?: string;
  imageAlt?: string;
  features?: CenterFeature[];
}

export interface CenterLifestyle {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  benefits?: CenterFeature[];
}

export interface CenterCourses {
  subtitle?: string;
  footerTitle?: string;
  footerDescription?: string;
  buttonText?: string;
  items?: { name?: string; type?: string }[];
}

export interface CenterProcess {
  title?: string;
  highlightText?: string;
  subtitle?: string;
  ctaSubtext?: string;
  steps?: { step?: string; label?: string; desc?: string; icon?: string }[];
}

export interface CenterFuture {
  mainTitle?: string;
  subtitle?: string;
  statCard?: { stat?: string; label?: string; description?: string };
  networkingCard?: { description?: string };
  creditTransfer?: { title?: string; description?: string; buttonText?: string };
}

export interface CenterQA {
  question?: string;
  answer?: string;
}

export interface CenterPageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  status?: "draft" | "published";
}

/**
 * The icons eg-academy can render. The site resolves these names to lucide
 * components; a name that is not on this list falls back to a globe, so the list
 * exists to stop an editor guessing rather than to prevent a crash.
 */
export const CENTER_ICONS = [
  "Award",
  "BookOpen",
  "Briefcase",
  "CheckCircle",
  "Clock",
  "Globe",
  "GraduationCap",
  "Home",
  "MessageCircle",
  "Plane",
  "ShieldCheck",
  "TrendingUp",
  "Upload",
  "Users",
  "Zap",
] as const;
