import {
  BookMarked,
  BookOpen,
  Briefcase,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Image,
  LayoutDashboard,
  Library,
  MapPin,
  Star,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /**
   * A second line under the label. The sidebar is 212px wide, so a name long
   * enough to say what a page actually does would truncate — this carries the
   * "and what is it" part without shortening the name.
   */
  hint?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/*
 * Flat groups, not collapsible submenus: every item in this CMS is one page, and
 * a group heading says what a chevron used to. Universities/Commission were the
 * only nested pair and they read better as siblings under Catalog.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Courses", to: "/courses", icon: BookOpen },
      { label: "Universities", to: "/universities", icon: GraduationCap },
      { label: "Countries", to: "/countries", icon: Globe },
      { label: "Visas", to: "/visas", icon: FileText },
      {
        label: "Jobs",
        to: "/jobs",
        icon: Briefcase,
        hint: "Publish the openings drafted in the CRM",
      },
    ],
  },
  {
    label: "eG Academy",
    items: [
      { label: "Academy Courses", to: "/eg-academy/courses", icon: BookMarked },
      {
        label: "Academy Centres",
        to: "/eg-academy/centers",
        icon: MapPin,
        hint: "The /centers landing pages",
      },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "FAQs", to: "/faqs", icon: HelpCircle },
      {
        label: "Reviews",
        to: "/reviews",
        icon: Star,
        hint: "Approve what students wrote",
      },
      { label: "Popup Banners", to: "/popup-banners", icon: Image },
      { label: "eG Library", to: "/library", icon: Library },
    ],
  },
];
