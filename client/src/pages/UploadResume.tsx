import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SAMPLE_RESUME = `Software Engineer with 3 years of experience.

Skills: React, TypeScript, Node.js, Python, MongoDB, Docker, Git, REST API

Experience:
- Built full-stack web applications using React and Node.js
- Deployed services using Docker and AWS
- Worked in Agile/Scrum teams`;

const STEPS = [
  { num: '01', text: 'AI scans your text for 40+ technologies' },
  { num: '02', text: 'Gaps are identified based on your stack' },
  { num: '03', text: 'A readiness score (0–100%) is calculated' },
  { num: '04', text: 'A personalized roadmap is generated' },
];

const TIPS = [
  'Include all technologies you have used',
  'Mention job titles and project names',
  'Add tools, frameworks, and methodologies',
  'Include cloud services (AWS, Azure, GCP)',
];

const FEATURES = [
  { label: '40+ Skills Detected' },
  { label: 'Gap Analysis' },
  { label: 'Readiness Score' },
  { label: 'Learning Roadmap' },
];

export default function UploadResume() {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const email = localStorage.getItem('userEmail') || '';
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: resumeText, email }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('analysisResult', JSON.stringify(data));
        navigate('/dashboard');
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to Node.js API on port 5000. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 68px)',
        background: 'linear-gradient(160deg, #f5faff 0%, #eaf4fd 60%, #f0f8ff 100%)',
        py: 6,
        px: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <Box sx={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '45vw', height: '45vh', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,180,234,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>

        {/* ── Page Header ── */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '11px',
              background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(14,109,205,0.3)',
            }}>
              <ArticleIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0e6dcd', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.2 }}>
                Resume Analysis
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#071730', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Paste Your Resume
              </Typography>
            </Box>
          </Box>

          <Typography color="text.secondary" sx={{ fontSize: '0.95rem', mb: 2.5, maxWidth: 520, lineHeight: 1.7, ml: '56px' }}>
            Our AI engine will extract your skills, identify market gaps, and generate a personalized career roadmap.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: '56px' }}>
            {FEATURES.map((f) => (
              <Chip
                key={f.label}
                label={f.label}
                size="small"
                icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#00b4ea !important' }} />}
                sx={{
                  background: 'rgba(14,109,205,0.07)',
                  border: '1px solid rgba(14,109,205,0.18)',
                  color: '#0e6dcd',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  px: 0.5,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* ── Main grid ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, gap: 3 }}>

          {/* ── Main upload card ── */}
          <Card sx={{
            boxShadow: '0 8px 40px rgba(14,109,205,0.10)',
            border: '1px solid rgba(14,109,205,0.15)',
            overflow: 'hidden',
          }}>
            {/* Top accent bar */}
            <Box sx={{
              height: 3,
              background: 'linear-gradient(90deg, #0e6dcd 0%, #00b4ea 50%, #00d4ff 100%)',
            }} />
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#071730' }}>
                  Resume Text
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setResumeText(SAMPLE_RESUME)}
                  startIcon={<AutoAwesomeIcon sx={{ fontSize: '15px !important' }} />}
                  sx={{
                    px: 2, fontSize: '0.8rem', borderRadius: '8px',
                    borderColor: 'rgba(14,109,205,0.3)',
                    color: '#0e6dcd',
                    '&:hover': {
                      borderColor: '#0e6dcd',
                      background: 'rgba(14,109,205,0.06)',
                    },
                  }}
                >
                  Use Sample
                </Button>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(14,109,205,0.1)' }} />

              <Box component="form" onSubmit={handleUpload}>
                <TextField
                  multiline
                  minRows={12}
                  fullWidth
                  placeholder={`Paste your resume text here...\n\ne.g. Skills: React, Python, Docker\nExperience: Software Engineer at...`}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      alignItems: 'flex-start',
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      fontSize: '0.875rem',
                      lineHeight: 1.75,
                      background: '#f8fbff',
                    },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || resumeText.trim().length < 10}
                  sx={{
                    py: 1.6,
                    fontSize: '1rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                    boxShadow: '0 6px 24px rgba(14,109,205,0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0a5db0 0%, #0e6dcd 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 32px rgba(14,109,205,0.5)',
                    },
                    '&.Mui-disabled': {
                      background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                      opacity: 0.5,
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                      Analyzing with AI...
                    </Box>
                  ) : (
                    '🚀  Generate AI Career Report'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* ── Info sidebar ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* What happens next card — ocean dark */}
            <Box sx={{
              borderRadius: '16px',
              background: 'linear-gradient(145deg, #071730 0%, #0a2548 100%)',
              border: '1px solid rgba(0,180,234,0.15)',
              p: 3,
              boxShadow: '0 10px 36px rgba(4,15,36,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow blob */}
              <Box sx={{
                position: 'absolute', top: -30, right: -30, width: 100, height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,180,234,0.2), transparent)',
                pointerEvents: 'none',
              }} />
              <Typography sx={{ fontWeight: 700, color: '#00b4ea', fontSize: '0.85rem', mb: 2.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                What happens next?
              </Typography>
              {STEPS.map(({ num, text }) => (
                <Box key={num} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{
                    color: '#00b4ea', fontWeight: 800, fontSize: '0.7rem', mt: '2px',
                    minWidth: 24, fontFamily: 'monospace',
                    background: 'rgba(0,180,234,0.1)',
                    border: '1px solid rgba(0,180,234,0.2)',
                    borderRadius: '5px',
                    px: 0.6, py: 0.2,
                    textAlign: 'center',
                  }}>
                    {num}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontSize: '0.83rem' }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Tips card — white */}
            <Card sx={{ border: '1px solid rgba(14,109,205,0.15)', boxShadow: '0 4px 20px rgba(14,109,205,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TipsAndUpdatesIcon sx={{ color: '#00b4ea', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#071730' }}>
                    Tips for best results
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(14,109,205,0.1)' }} />
                {TIPS.map((tip) => (
                  <Box key={tip} sx={{ display: 'flex', gap: 1.2, mb: 1.2, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0e6dcd, #00b4ea)',
                      flexShrink: 0, mt: '8px',
                    }} />
                    <Typography variant="body2" sx={{ color: '#3a5a80', lineHeight: 1.6, fontSize: '0.83rem' }}>
                      {tip}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
