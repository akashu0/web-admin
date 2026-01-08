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
    order: number;
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

export interface ICountry {
    _id: string;
    name: string;
    code: string;
    capital: string;
    continent: string;
    currency: string;
    language: string;
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
    language: string;
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
    language?: string;
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