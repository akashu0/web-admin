import type { SortParams } from "@/services/api";
// types/egAcademyCourse.ts

export const LEVEL_OPTIONS = [
  'Certification',
  'Diploma',
  'Foundation Diploma (Level 3 Diploma)',
  'Level 4 Diploma',
  'Level 5 Diploma',
  'Higher National Diploma (Level 5 Extended Diploma)',
  'PG Diploma (Level 7 Diploma)',
  'Bachelors',
  'Masters',
  'Doctorate (PhD)',
] as const;

export const INTAKE_OPTIONS = [
  'Every Month',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const STREAM_OPTIONS = [
  'Engineering & Technology',
  'Business & Management Studies',
  'Information Technology & Computing',
  'Accounting & Finance',
  'Education & Teaching',
  'Social Sciences & Humanities',
  'Medicine & Healthcare',
  'Nursing & Allied Health Sciences',
  'Aeronautical & Aviation Studies',
  'Architecture & Interior Design',
  'Artificial Intelligence & Data Science',
  'Cyber Security & Networking',
  'Software Engineering & Development',
  'Hospitality & Tourism Management',
  'Hotel & Culinary Arts',
  'Digital Marketing & Media Studies',
  'Graphic Design & Animation',
  'Fashion Design & Textile Studies',
  'Law & Legal Studies',
  'Psychology & Behavioral Sciences',
  'International Relations & Political Science',
  'Economics & Development Studies',
  'Logistics & Supply Chain Management',
  'Human Resource Management',
  'Entrepreneurship & Innovation',
  'Banking & Financial Technology (FinTech)',
  'Public Health & Healthcare Management',
  'Pharmacy & Pharmaceutical Sciences',
  'Dentistry & Oral Healthcare',
  'Physiotherapy & Rehabilitation Sciences',
  'Biomedical Sciences & Biotechnology',
  'Environmental Science & Sustainability',
  'Agriculture & Food Technology',
  'Marine & Nautical Studies',
  'Aviation Management & Pilot Training',
  'Robotics & Mechatronics Engineering',
  'Renewable Energy & Energy Management',
  'Construction Management & Quantity Surveying',
  'Media, Journalism & Communication',
  'Film Production & Multimedia Arts',
  'Event Management & Public Relations',
  'Sports Science & Physical Education',
  'Criminology & Forensic Science',
  'Early Childhood Education',
  'TESOL, TEFL & English Language Studies',
  'Islamic Studies & Theology',
  'Mathematics & Applied Sciences',
  'Chemistry, Physics & Biological Sciences',
  'Veterinary Science & Animal Care',
  'Occupational Health & Safety',
  'Project Management & Business Analytics',
  'E-Commerce & Digital Business',
  'Blockchain & Cloud Computing',
  'Game Design & Interactive Media',
  'UX/UI Design & Creative Technologies',
  'Tourism, Travel & Airline Operations',
  'Automotive Engineering & Electric Vehicle Technology',
  'Civil, Mechanical & Electrical Engineering',
  'Petroleum & Chemical Engineering',
  'Nanotechnology & Advanced Materials Science',
  // --- Merged 2026-07-22: broader field taxonomy (also used by University streams) ---
  'Business & Management',
  'Computing & Information Technology',
  'Architecture & Built Environment',
  'Geomatics & Geospatial Sciences',
  'Property & Real Estate',
  'Health & Medical Sciences',
  'Education',
  'Law',
  'Hospitality & Tourism',
  'Arts, Design & Media',
  'Social Sciences',
  'Environmental Sciences',
  'Agriculture & Food Sciences',
  'Aviation & Maritime',
  'Languages & Communication',
] as const;

export const CONTINENT_OPTIONS = [
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
] as const;

export const TUITION_FEE_TYPES = [
  'Fully Tuition Fee Funded',
  'Scholarships',
  'Regular (Self-Funded Program)',
] as const;

export const SCHOLARSHIP_PERCENTAGES = [
  '10%', '20%', '30%', '40%', '50%',
  '60%', '70%', '80%', '90%', '100%',
  'Not Applicable',
] as const;

export const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'EUR', name: 'Euro' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'NPR', name: 'Nepalese Rupee' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KRW', name: 'South Korean Won' },
] as const;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface EgAcademyOtherFee {
  fieldName: string;
  fieldValue: string;
  order: number;
}

export interface EgAcademyFeeStructure {
  tuitionFeeType?: 'Fully Tuition Fee Funded' | 'Scholarships' | 'Regular (Self-Funded Program)';
  scholarshipPercentage?: string;
  currency?: string;
  tuitionFee?: number;
  applicationFee?: number;
  admissionFee?: number;
  visaFee?: number;
  administrationFee?: number;
  accommodationFee?: number;
  transportationFee?: number;
  assessmentFee?: number;
  examFee?: number;
  otherFees?: EgAcademyOtherFee[];
}

export interface EgAcademyLearningCenter {
  _id?: string;
  city: string;
  country: string;
  continent: string;
  feeStructure?: EgAcademyFeeStructure;
}

export interface EgAcademyOverview {
  courseImage?: File | string | null;
  courseName: string;
  headingDescription?: string;
  /**
   * Kept only because the form still computes one from the course name for
   * display. The API derives the real slug itself and returns it on the COURSE,
   * not in here — reading `overview.slug` is what sent the editor to
   * /eg-academy/courses/undefined.
   */
  slug?: string;
  description?: string;
  durationYears?: string;
  durationMonths?: string;
  studyMode?: 'online' | 'on-campus' | 'hybrid';
  awardedBy?: string;
  intakes?: string[];
  level?: string;
  stream?: string;
}

export interface EgAcademyCourse {
  _id: string;
  slug: string;
  overview: EgAcademyOverview;
  learningCenters: EgAcademyLearningCenter[];
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface EgAcademyCourseFormData {
  overview: EgAcademyOverview;
  learningCenters: EgAcademyLearningCenter[];
  status: 'draft' | 'published';
  _id?: string;
}

export interface EgAcademyQueryParams extends SortParams {
  page?: number;
  limit?: number;
  search?: string;
  stream?: string;
  status?: 'draft' | 'published';
}

export interface EgAcademyPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EgAcademyCourseListResponse {
  success: boolean;
  data: EgAcademyCourse[];
  pagination: EgAcademyPaginationMeta;
}
