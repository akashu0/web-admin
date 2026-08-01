import type { Cost } from '@/types/country';

/**
 * The shape the country editor holds. Shared by the create modal and the
 * per-section edit page so the tab components can be typed once.
 */
export interface CountryFormValues {
    name: string;
    capital: string;
    continent: string;
    currency: string;
    spokenLanguages: string;
    population: string;
    about: string;
    status: 'draft' | 'published';
    slug: string;
    costOfLiving: Cost[];
    visaProcessDocuments: string;
    topUniversities: string[];
    topCourses: string[];
}

export const emptyCountryForm: CountryFormValues = {
    name: '',
    capital: '',
    continent: '',
    currency: '',
    spokenLanguages: '',
    population: '',
    about: '',
    status: 'draft',
    slug: '',
    costOfLiving: [],
    visaProcessDocuments: '',
    topUniversities: [],
    topCourses: [],
};

export const generateSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
