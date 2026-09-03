
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
    durationYears?: string;
    durationMonths?: string;
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

/**
 * One line of "what to send us with your application".
 *
 * `isActive` and `isMandatory` answer different questions, and the public page
 * renders each: active decides whether the document is SHOWN, mandatory whether
 * it is shown as required. "IELTS, if required" is active and not mandatory.
 *
 * `isActive` is optional because absent means active — every document stored
 * before the field existed was added deliberately, and defaulting those to
 * inactive would empty the section on every existing course.
 */
export interface DocumentRequired {
    id: string;
    documentName: string;
    description: string;
    isMandatory: boolean;
    /** "Personal", "Academic", … — see DEFAULT_COURSE_DOCUMENTS. */
    category?: string;
    isActive?: boolean;
}

/** A course links to a Visa record; the steps live on that record, not here. */
export interface VisaProcess {
    visaId: string;
}

/**
 * A course links to a StudyCenter record the same way.
 *
 * This is the shape the STAFF endpoint returns — the bare id, nothing else.
 * Only the public detail swaps it for the centre document (resolveCourseRefs),
 * so anything here that wants a centre name must look it up through
 * studyCenterService. It was typed as the full `LearningCenter` before, which
 * is why the view page rendered "Centre" with a blank location for every row.
 */
export interface CourseStudyCenter {
    centerId: string;
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
    // Cloudinary's id for the file — what DELETE addresses, so removing a
    // brochure takes the file with it instead of orphaning it.
    publicId?: string;
}


/** The staff-authored "why choose this course" block. Content is editor HTML. */
export interface WhyChoose {
    heading?: string;
    content?: string;
}

export interface CourseFormData {
    feeStructures: FeeStructure[];
    /**
     * The universities offering this course, in the order they were entered.
     * The first is the primary — the API mirrors it into `universityId` for the
     * readers that can still only take one (an application is for a single
     * university), so this list is the one to edit.
     */
    universityIds: string[];
    /** Id of the FAQ question set shown on the public course page, or "". */
    faqs?: string;
    _id?: string;
    overview: CourseOverview;
    studyCenters?: CourseStudyCenter[];
    documentsRequired: DocumentRequired[];
    visaProcess: VisaProcess[];
    careerOpportunities: CareerOpportunity[];
    whyChoose?: WhyChoose;
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
    // The section arrays were declared `never[]`, which made every read of a row
    // a type error and forced casts at each call site. They are the same shapes
    // the form uses.
    feeStructures: FeeStructure[];
    universityIds?: string[];
    /** Derived by the API from `universityIds[0]`; read-only here. */
    universityId?: string;
    faqs?: string;
    studyCenters?: CourseStudyCenter[];
    dynamicFields?: DynamicField[];
    brochure?: Brochure[];
    overview: CourseOverview;
    careerOpportunities?: CareerOpportunity[];
    whyChoose?: WhyChoose;
    visaProcess?: VisaProcess[];
    documentsRequired?: DocumentRequired[];
    viewCount?: number;
    _id: string;
    slug: string;
    status: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

export type CourseSection =
    | 'overview'
    | 'whyChoose'
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
}

export interface CourseListResponse {
    success: boolean;
    message: string;
    data: Course[];
    pagination: PaginationMeta;
}
