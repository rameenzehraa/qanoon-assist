import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  Paper,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { knowledgeBaseAPI } from '../services/api';

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await knowledgeBaseAPI.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Load all articles on mount
  useEffect(() => {
    loadAllArticles();
  }, []);

  // Load all articles
  const loadAllArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await knowledgeBaseAPI.getAllArticles();
      setArticles(res.data.results || res.data || []);
    } catch (err) {
      setError('Error loading articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search articles
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() && !selectedCategory) {
      loadAllArticles();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await knowledgeBaseAPI.searchArticles({
        q: searchTerm,
        category: selectedCategory
      });
      setArticles(res.data.results || []);
      if (res.data.results?.length === 0) {
        setError('No articles found. Try different keywords.');
      }
    } catch (err) {
      setError('Error searching articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Clear filters and load all
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    loadAllArticles();
  };

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
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <BookmarkIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              color: 'white'
            }}
          >
            Legal Knowledge Base
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.1rem'
            }}
          >
            Search Pakistan's laws and legal articles
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 5,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(4px)',
            borderRadius: 3,
            transition: '0.3s',
            '&:hover': {
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.08)'
            }
          }}
        >
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}
          >
            <TextField
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                flex: 1,
                minWidth: '200px',
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  opacity: 0.7,
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />
              }}
            />

            <TextField
              select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                minWidth: '150px',
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                },
                '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' }
              }}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: '#000',
                fontWeight: 700,
                padding: '8px 24px',
                transition: '0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
                }
              }}
            >
              Search
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                transition: '0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              Clear
            </Button>
          </Box>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Results Count */}
        {articles.length > 0 && !loading && (
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)'
            }}
          >
            {articles.length} Article{articles.length !== 1 ? 's' : ''} Found
          </Typography>
        )}

        {/* Results Grid */}
        {articles.length > 0 && (
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid item xs={12} key={article.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 3,
                    backdropFilter: 'blur(4px)',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.08)'
                    }
                  }}
                  onClick={() => navigate(`/knowledge-base/article/${article.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: 'white',
                            fontSize: '1.1rem'
                          }}
                        >
                          Article {article.article_number}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: 'rgba(255,255,255,0.95)'
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 2,
                            lineHeight: 1.6,
                            color: 'rgba(255,255,255,0.7)'
                          }}
                        >
                          {article.content.substring(0, 150)}...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={article.category_name}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              border: '1px solid rgba(255,255,255,0.2)',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <BookmarkIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 500
              }}
            >
              No articles found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.4)',
                mt: 1
              }}
            >
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}