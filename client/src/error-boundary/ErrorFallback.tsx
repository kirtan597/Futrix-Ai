/**
 * ErrorFallback.tsx
 * 
 * Beautiful, user-friendly error UI that respects the design system
 * while providing clear recovery options.
 */

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  retryCount: number;
  onReset: () => void;
  onRefresh: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  retryCount,
  onReset,
  onRefresh,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        p: 2,
      }}
    >
      <Box sx={{ maxWidth: 600, width: '100%' }}>
        {/* Icon */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 61, 0, 0.1)',
              border: '2px solid rgba(255, 61, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 40, color: '#ff3d00' }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.04em',
              mb: 1,
            }}
          >
            Something went wrong
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.95rem',
              mb: 3,
            }}
          >
            We've logged this error and our team has been notified.
          </Typography>
        </Box>

        {/* Error Message */}
        <Alert
          severity="error"
          sx={{
            mb: 3,
            background: 'rgba(255,61,0,0.05)',
            border: '1px solid rgba(255,61,0,0.2)',
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              color: '#ff3d00',
            },
          }}
        >
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
            Error Code: {errorId}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
            {error.message || 'An unexpected error occurred'}
          </Typography>
        </Alert>

        {/* Error Details (Development Only) */}
        {isDevelopment && (
          <Box sx={{ mb: 3 }}>
            <Button
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              sx={{
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'none',
                fontSize: '0.85rem',
              }}
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>
            <Collapse in={showDetails}>
              <Paper
                sx={{
                  mt: 1,
                  p: 2,
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              >
                <Typography
                  component="pre"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    overflow: 'auto',
                    maxHeight: 200,
                    fontFamily: 'monospace',
                  }}
                >
                  {error.stack}
                  {errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:\n'}
                      {errorInfo.componentStack}
                    </>
                  )}
                </Typography>
              </Paper>
            </Collapse>
          </Box>
        )}

        {/* Helpful Info */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.7)',
              mb: 1,
              fontWeight: 600,
            }}
          >
            💡 What you can try:
          </Typography>
          <Typography
            component="ul"
            sx={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.6)',
              pl: 2,
              m: 0,
              '& li': { mb: 0.5 },
            }}
          >
            <li>Click "Try Again" to recover from this error</li>
            <li>Check your internet connection</li>
            <li>Try refreshing the page (Cmd+R or Ctrl+R)</li>
            <li>Clear your browser cache and cookies</li>
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            fullWidth
            sx={{
              py: 1.2,
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '10px',
              textTransform: 'none',
            }}
          >
            Try Again
          </Button>

          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={onRefresh}
            fullWidth
            sx={{
              py: 1.2,
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '10px',
              textTransform: 'none',
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.04)',
              },
            }}
          >
            Go Home
          </Button>
        </Box>

        {/* Retry Count Display */}
        {retryCount > 1 && (
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.3)',
              mt: 2,
            }}
          >
            Retry attempt: {retryCount}
          </Typography>
        )}

        {/* Support Link */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.4)',
            mt: 4,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            pt: 2,
          }}
        >
          Need help? Contact us with Error Code: <code>{errorId}</code>
        </Typography>
      </Box>
    </Box>
  );
};

export default ErrorFallback;
