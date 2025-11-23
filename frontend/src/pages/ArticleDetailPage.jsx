import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { knowledgeBaseAPI } from '../services/api';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await knowledgeBaseAPI.getArticleDetail(id);
        setArticle(res.data);
      } catch (err) {
        setError('Failed to load article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#000',
          backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#000',
          backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
          color: 'white',
          py: 6
        }}
      >
        <Container maxWidth="md">
          <Alert
            severity="error"
            sx={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#ff7675',
              mb: 3
            }}
          >
            {error || 'Article not found'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/knowledge-base')}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.05)'
              }
            }}
            variant="outlined"
          >
            Back to Knowledge Base
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000',
        backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
        color: 'white',
        py: 6
      }}
    >
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/knowledge-base')}
          sx={{
            mb: 4,
            color: 'white',
            borderColor: 'rgba(255,255,255,0.3)',
            fontWeight: 600,
            transition: '0.3s',
            '&:hover': {
              borderColor: 'white',
              background: 'rgba(255,255,255,0.08)'
            }
          }}
          variant="outlined"
        >
          Back to Search
        </Button>

        {/* Article Card */}
        <Card
          sx={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 3,
            backdropFilter: 'blur(4px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BookmarkIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.95rem',
                    letterSpacing: 1.5
                  }}
                >
                  {article.article_number}
                </Typography>
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mt: 2,
                  mb: 3,
                  color: 'white',
                  lineHeight: 1.3
                }}
              >
                {article.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={article.category_name}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                />
              </Box>
            </Box>

            <Divider
              sx={{
                my: 4,
                background: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.1)'
              }}
            />

            {/* Content */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.9,
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '1.05rem',
                  letterSpacing: 0.3
                }}
              >
                {article.content}
              </Typography>
            </Box>

            <Divider
              sx={{
                my: 4,
                background: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.1)'
              }}
            />

            {/* Keywords */}
            {article.keywords && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: 'white',
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  Search Keywords
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {article.keywords.split(',').map((keyword, idx) => (
                    <Chip
                      key={idx}
                      label={keyword.trim()}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        fontWeight: 500,
                        transition: '0.3s',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.15)',
                          borderColor: 'rgba(255,255,255,0.4)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}