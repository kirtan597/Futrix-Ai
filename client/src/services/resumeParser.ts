/**
 * resumeParser.ts
 * Client-side resume text extraction.
 * Supports plain text (.txt) files via FileReader.
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Extract text from a plain .txt File object.
 */
export function extractTextFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return reject(new Error('File size exceeds the 5MB limit. Please upload a smaller file or paste your text.'));
        }
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => reject(new Error('Could not read the uploaded file. Please try again.'));
        reader.readAsText(file);
    });
}

/**
 * Route to the right extractor based on file type.
 * Returns extracted text or throws an error with a user-friendly message.
 */
export async function extractResumeText(file: File): Promise<string> {
    if (!file) {
        throw new Error('No file selected.');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error('File size exceeds the 5MB limit. Please upload a smaller file or paste your text.');
    }

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt' || file.type === 'text/plain') {
        return extractTextFromTxt(file);
    }

    if (ext === 'pdf') {
        throw new Error(
            'PDF files cannot be parsed directly in the browser. Please copy and paste your resume text into the text box below.'
        );
    }

    if (ext === 'doc' || ext === 'docx') {
        throw new Error(
            'Word documents (.doc/.docx) cannot be parsed directly. Please copy and paste your resume text into the text box below.'
        );
    }

    throw new Error(`Unsupported file type ".${ext || 'unknown'}". Please upload a plain text (.txt) file or paste your resume text.`);
}

/**
 * Validate that extracted text has enough content to analyze.
 */
export function validateResumeText(text: string): { valid: boolean; message: string } {
    const trimmed = text ? text.trim() : '';
    if (trimmed.length < 50) {
        return { 
            valid: false, 
            message: `Resume text is too short (${trimmed.length}/50 chars). Please provide at least 50 characters of resume content.` 
        };
    }
    if (trimmed.length > 50_000) {
        return { 
            valid: false, 
            message: 'Resume text is too long. Please trim it to under 50,000 characters.' 
        };
    }
    return { valid: true, message: '' };
}
