import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { extractResumeText } from '../services/resumeParser';

interface UploadZoneProps {
    onText: (text: string) => void;
    onError?: (msg: string) => void;
    loading?: boolean;
    disabled?: boolean;
}

export default function UploadZone({ onText, onError, loading = false, disabled = false }: UploadZoneProps) {
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        try {
            const text = await extractResumeText(file);
            onText(text);
        } catch (err: unknown) {
            if (onError) onError(err instanceof Error ? err.message : 'Failed to read file');
        }
    }, [onText, onError]);

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles } = useDropzone({
        onDrop,
        disabled: disabled || loading,
        accept: { 'text/plain': ['.txt'] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5 MB
    });

    const hasFile = acceptedFiles.length > 0;
    const borderColor = isDragReject
        ? 'rgba(248,113,113,0.5)'
        : isDragAccept || isDragActive
            ? 'rgba(255,255,255,0.45)'
            : hasFile
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(255,255,255,0.1)';

    return (
        <Box
            {...getRootProps()}
            sx={{
                border: `1px dashed ${borderColor}`,
                borderRadius: '14px',
                p: 3,
                textAlign: 'center',
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                background: isDragActive
                    ? 'rgba(255,255,255,0.04)'
                    : hasFile
                        ? 'rgba(255,255,255,0.02)'
                        : 'transparent',
                transition: 'all 0.22s',
                '&:hover': disabled || loading ? {} : {
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.25)',
                },
            }}
        >
            <input {...getInputProps()} />

            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={28} thickness={2.5} sx={{ color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>Reading file...</Typography>
                </Box>
            ) : hasFile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 28, color: 'rgba(74,222,128,0.6)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                        {acceptedFiles[0].name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)' }}>
                        Text extracted · Click to replace
                    </Typography>
                </Box>
            ) : isDragActive ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.6)' }} />
                    <Typography sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>Drop to upload</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: 'rgba(255,255,255,0.25)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
                        Drop a <strong style={{ color: 'rgba(255,255,255,0.65)' }}>.txt</strong> file here
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)' }}>
                        Or click to browse · Max 5 MB
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
