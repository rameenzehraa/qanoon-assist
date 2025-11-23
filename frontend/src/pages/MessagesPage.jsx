import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import MessageBox from '../components/common/messaging/MessageBox';

function MessagesPage() {
    const { caseId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <Box sx={{ backgroundColor: '#272626ff', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <MessageBox caseRequestId={caseId} onBack={handleBack} />
            </Container>
        </Box>
    );
}

export default MessagesPage;