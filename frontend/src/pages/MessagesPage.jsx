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
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <MessageBox caseRequestId={caseId} onBack={handleBack} />
        </Container>
    );
}

export default MessagesPage;