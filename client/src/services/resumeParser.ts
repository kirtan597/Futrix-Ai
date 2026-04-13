/**
 * resumeParser.ts
 * Client-side resume text extraction.
 * Supports plain text (.txt) files via FileReader.
 * PDF parsing support placeholder — requires pdf.js or similar CDN.
 */

/**
 * Extract text from a plain .txt File object.
 */
export function extractTextFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsText(file);
    });
}

/**
 * Route to the right extractor based on file type.
 * Returns extracted text or throws an error with a user-friendly message.
 */
export async function extractResumeText(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt' || file.type === 'text/plain') {
        return extractTextFromTxt(file);
    }

    if (ext === 'pdf') {
        // PDF extraction — requires pdfjs-dist if installed
        // For now: prompt user to paste text instead
        throw new Error(
            'PDF upload is a Pro feature. Please paste your resume text manually, or convert your PDF to .txt.'
        );
    }

    throw new Error(`Unsupported file type ".${ext}". Please upload a .txt file or paste your resume text.`);
}

/**
 * Validate that extracted text has enough content to analyze.
 */
export function validateResumeText(text: string): { valid: boolean; message: string } {
    const trimmed = text.trim();
    if (trimmed.length < 50) {
        return { valid: false, message: 'Resume text is too short. Please paste at least 50 characters.' };
    }
    if (trimmed.length > 50_000) {
        return { valid: false, message: 'Resume text is too long. Please trim it to under 50,000 characters.' };
    }
    return { valid: true, message: '' };
}
