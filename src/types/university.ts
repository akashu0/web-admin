export interface University {
    id: string;
    name: string;
    country: string;
    ranking: number;
    website: string;
}

export type UniversityFormData = Omit<University, 'id'>;
