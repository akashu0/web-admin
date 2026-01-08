// types/country.ts (Frontend - Vite React TypeScript)

export interface CostItem {
    label?: string;
    min?: number;
    max?: number;
    currency?: string;
}

export interface Cost {
    tuition?: CostItem[];
    living?: CostItem[];
    note?: string;
}

export interface IExamEligibility {
    examName: string;
    description: string;
    minimumScore?: string;
    requiredFor: string; // undergraduate, postgraduate, both
    validityPeriod?: string;
    bookingLink?: string;
    preparationTips?: string;
}

export interface IIntakePeriod {
    title: string;
    period: string;
    description: string;
    bestFor: string;
}

export interface IWorkOpportunity {
    title: string;
    description: string;
    type: string; // part-time, full-time, internship
    allowedHoursPerWeek?: string;
    eligibility: string;
    averageSalary?: string;
    popularSectors: string[];
    requirements?: string;
}

export interface IScholarship {
    name: string;
    description: string;
    eligibility: string;
    amount: string;
    coverage: string;
    applicationDeadline?: string;
    externalLink?: string;
    isGovernmentFunded: boolean;
}


export interface IVisaStep {
    title: string;
    description: string;
}

export interface IVisaDocument {
    name: string;
    description: string;
}

export interface IVisa {
    _id: string;
    country: string;
    visaFee?: number;
    currency?: string;
    visaSteps?: IVisaStep[];
    visaDocuments?: IVisaDocument[];
    renewalDocuments?: IVisaDocument[];
    visaProcessingTime?: number;
    visaProcessingTimeUnit?: string;
    visaSuccessRate?: string;
}

export interface IUniversityLite {
    _id: string;
    name: string;
    city?: string;
    rank?: string;
    logoUrl?: string;
    slug: string;
}

export interface ICourseOverview {
    title?: string;
    description?: string;
}

export interface ICourseLite {
    _id: string;
    overview?: ICourseOverview;
    slug: string;
}

export interface CountryResponse {
    _id: string;
    name: string;
    code: string;
    capital: string;
    continent: string;
    currency: string;
    spokenLanguages: string;
    population: string;
    about: string;
    logo?: string;
    banner?: string;
    status: "published" | "draft";
    slug: string;

    // Related sections
    intakePeriods: IIntakePeriod[];
    scholarships: IScholarship[];
    visaProcessDocuments?: IVisa | null;
    topUniversities?: IUniversityLite[];
    topCourses?: ICourseLite[];
    costOfLiving: Cost[];
    examsEligibility: IExamEligibility[];
    workOpportunities: IWorkOpportunity[];

    createdAt: Date;
    updatedAt: Date;
}


export interface ICountry {
    _id: string;
    name: string;
    code: string;
    capital: string;
    continent: string;
    currency: string;
    spokenLanguages: string;
    population: string;
    about: string;
    logo?: string;
    banner?: string;
    status: "published" | "draft";
    slug: string;

    // Related sections
    intakePeriods: IIntakePeriod[];
    scholarships: IScholarship[];
    visaProcessDocuments: string; // ObjectId as string
    topUniversities: string[]; // Array of ObjectId as strings
    topCourses: string[]; // Array of ObjectId as strings
    costOfLiving: Cost[];
    examsEligibility: IExamEligibility[];
    workOpportunities: IWorkOpportunity[];

    createdAt: Date;
    updatedAt: Date;
}

// DTO types for API requests
export interface CreateCountryDto {
    name: string;
    code: string;
    capital: string;
    continent: string;
    currency: string;
    spokenLanguages: string;
    population: string;
    about: string;
    logo?: string;
    banner?: string;
    status: "published" | "draft";
    slug: string;
    intakePeriods?: IIntakePeriod[];
    scholarships?: IScholarship[];
    costOfLiving?: Cost[];
    examsEligibility?: IExamEligibility[];
    workOpportunities?: IWorkOpportunity[];
}

export interface UpdateCountryDto {
    name?: string;
    code?: string;
    capital?: string;
    continent?: string;
    currency?: string;
    spokenLanguages?: string;
    population?: string;
    about?: string;
    logo?: string;
    banner?: string;
    status?: "published" | "draft";
    slug?: string;
    intakePeriods?: IIntakePeriod[];
    scholarships?: IScholarship[];
    costOfLiving?: Cost[];
    examsEligibility?: IExamEligibility[];
    workOpportunities?: IWorkOpportunity[];
}

// Additional helper types
export type ContinentType = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';
export type StatusType = 'published' | 'draft';
export type WorkOpportunityType = 'part-time' | 'full-time' | 'internship';
export type ExamRequiredFor = 'undergraduate' | 'postgraduate' | 'both';