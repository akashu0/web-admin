// pages/Course/courseDocumentDefaults.ts

/**
 * The default "Documents Required for Admission" catalogue.
 *
 * Lives in the client, not the API, for the same reason the university's
 * FIXED_REQUIREMENTS does: it is a presentation list. A course stores only the
 * documents an editor actually switched on, each carrying its own `category`, so
 * the public page can group what it is given without a copy of this table.
 *
 * Exported so the editor and the read-only course view render the same documents
 * in the same order — a second copy of this list is how two screens drift apart.
 */
export interface CourseDocumentDefault {
    documentName: string;
    /** Pre-ticked "Required" for the documents that always are. */
    isMandatory: boolean;
    /** Seeds the details field; the editor can replace it. */
    description?: string;
}

export interface CourseDocumentCategory {
    category: string;
    /** Shown under the heading in the editor only. */
    hint?: string;
    documents: CourseDocumentDefault[];
}

/**
 * Order matters: it is the order both the editor and the website render, and the
 * order a document is stored in.
 */
export const DEFAULT_COURSE_DOCUMENTS: CourseDocumentCategory[] = [
    {
        category: 'Personal',
        documents: [
            { documentName: 'Passport', isMandatory: true },
            { documentName: 'Photograph', isMandatory: true },
            { documentName: 'Identification Document', isMandatory: true },
        ],
    },
    {
        category: 'Academic',
        documents: [
            { documentName: 'Qualification Certificates', isMandatory: true },
            { documentName: 'Academic Transcripts/Mark Sheets', isMandatory: true },
            { documentName: 'Previous Academic Records', isMandatory: true },
        ],
    },
    {
        category: 'English Proficiency',
        hint: 'Only where the programme asks for it.',
        documents: [
            {
                documentName: 'IELTS/PTE/TOEFL/Duolingo/MOI',
                // Conditional, so it is switched on but NOT marked required —
                // which is the whole reason active and mandatory are separate.
                isMandatory: false,
                description: 'If required.',
            },
        ],
    },
    {
        category: 'Additional',
        documents: [
            { documentName: 'CV/Resume', isMandatory: false },
            { documentName: 'SOP', isMandatory: false },
            { documentName: 'Recommendation Letter', isMandatory: false },
        ],
    },
    {
        category: 'Masters and PG Diploma Students',
        hint: 'Where applicable.',
        documents: [
            { documentName: 'Work Experience Documents', isMandatory: false, description: 'Where applicable.' },
            { documentName: 'Professional Certificates', isMandatory: false, description: 'Where applicable.' },
            { documentName: 'Portfolio', isMandatory: false, description: 'Where applicable.' },
            {
                documentName: 'Project Work or Research Documents',
                isMandatory: false,
                description: 'Where applicable.',
            },
        ],
    },
];

/** Every default document name, for telling a default row from a custom one. */
export const DEFAULT_DOCUMENT_NAMES = new Set(
    DEFAULT_COURSE_DOCUMENTS.flatMap((c) => c.documents.map((d) => d.documentName)),
);

/** The category a custom document is filed under. */
export const CUSTOM_CATEGORY = 'Other Requirements';
