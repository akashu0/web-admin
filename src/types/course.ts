import type { LearningCenter } from "./learningCenter";

// types/course.ts
export type DynamicFieldType = 'text' | 'textarea' | 'dropdown' | 'radio';

export type FieldType = 'text' | 'richtext' | 'media' | 'number' | 'boolean' | 'dropdown';

export interface DynamicField {
    label: string;
    id?: string;
    fieldName: string;
    fieldValue: any;
    fieldType: FieldType;
    options?: string[];
    order: number;
}

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

export interface CourseOverview {
    _id?: string;
    courseName: string;
    headingDescription: string;
    slug: string;
    description: string;
    durationYears?: number;
    durationMonths?: number;
    studyMode: 'online' | 'on-campus' | 'hybrid';
    awardedBy: string;
    intakes: string[];
    level: string;
    universityType?: 'Public' | 'Private';
    stream?: string;
    courseImage?: File | string | null;
    dynamicFields?: DynamicField[];
}

export interface FeeStructure {
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
    dynamicFields?: Array<{ id: string; fieldName: string; fieldValue: string; fieldType: 'text' | 'number'; order: number }>;
}

export interface DocumentRequired {
    id: string;
    documentName: string;
    description: string;
    isMandatory: boolean;
}

export interface VisaProcess {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
}

export interface CareerOpportunity {
    id: string;
    title: string;
    description: string;
    averageSalary?: string;
}



export interface Brochure {
    fileName?: string;
    title?: string;
    description?: string;
    fileUrl?: string;
    fileSize?: number;
}


export interface CourseFormData {
    feeStructures: FeeStructure[];
    universityId: string;
    _id?: string;
    overview: CourseOverview;
    studyCenters?: LearningCenter[];
    documentsRequired: DocumentRequired[];
    visaProcess: VisaProcess[];
    careerOpportunities: CareerOpportunity[];
    brochure: Brochure[];
    dynamicFields?: DynamicField[];
    status: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface PaginationMeta {
    hasPrevPage: boolean;
    hasNextPage: boolean;
    totalPages: number;
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface Course {
    feeStructures: FeeStructure[];
    universityId: string;
    studyCenters: never[];
    dynamicFields: never[];
    brochure: never[];
    overview: CourseOverview;
    careerOpportunities: never[];
    visaProcess: never[];
    documentsRequired: never[];
    _id: string;
    courseName: string;
    slug: string;
    courseImage?: string;
    description?: string;
    level?: string;
    durationYears?: number;
    durationMonths?: number;
    studyMode: 'online' | 'on-campus' | 'hybrid';
    intakes: string[];
    awardedBy?: string;
    stream?: string;
    universityType?: 'Public' | 'Private';
    status: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

export type CourseSection =
    | 'overview'
    | 'studyCenters'
    | 'feeStructures'
    | 'documents'
    | 'visa'
    | 'career'
    | 'brochure'
    | 'dynamicFields';

export interface CourseQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'draft' | 'published';
    level?: string;
    stream?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CourseListResponse {
    success: boolean;
    message: string;
    data: Course[];
    pagination: PaginationMeta;
}
