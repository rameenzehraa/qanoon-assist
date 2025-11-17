import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, TextField, Button, Typography,
    Avatar, CircularProgress, IconButton, Chip
} from '@mui/material';
import { Send, ArrowBack, AttachFile, Close, Download } from '@mui/icons-material';
import { messageAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

function MessageBox({ caseRequestId, onBack }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [caseRequestId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await messageAPI.getByCaseRequest(caseRequestId);
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedFile) return;

        setSending(true);
        try {
            const messageData = {
                case_request: caseRequestId,
                content: newMessage.trim() || '📎 File attached',
            };

            if (selectedFile) {
                messageData.attachment = selectedFile;
            }

            await messageAPI.send(messageData);
            setNewMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getFileName = (url) => {
        if (!url) return '';
        return url.split('/').pop();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={onBack}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6">Case Messages</Typography>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
                {messages.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary">
                            No messages yet. Start the conversation!
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => {
                        const isMyMessage = message.sender === user?.id;
                        return (
                            <Box
                                key={message.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                                    mb: 2
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1, maxWidth: '70%', flexDirection: isMyMessage ? 'row-reverse' : 'row' }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: isMyMessage ? 'primary.main' : 'secondary.main' }}>
                                        {message.sender_name?.[0] || 'U'}
                                    </Avatar>
                                    <Box>
                                        <Paper
                                            sx={{
                                                p: 1.5,
                                                bgcolor: isMyMessage ? 'primary.main' : 'white',
                                                color: isMyMessage ? 'white' : 'text.primary'
                                            }}
                                        >
                                            <Typography variant="body2">{message.content}</Typography>
                                            
                                            {/* File Attachment */}
                                            {message.attachment && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        icon={<AttachFile />}
                                                        label={getFileName(message.attachment)}
                                                        size="small"
                                                        onClick={() => window.open(message.attachment.startsWith('http') ? message.attachment : `http://localhost:8000${message.attachment}`, '_blank')}
                                                        deleteIcon={<Download />}
                                                        onDelete={() => window.open(message.attachment.startsWith('http') ? message.attachment : `http://localhost:8000${message.attachment}`, '_blank')}
                                                        sx={{ 
                                                            bgcolor: isMyMessage ? 'rgba(255,255,255,0.2)' : 'primary.light',
                                                            color: isMyMessage ? 'white' : 'primary.main',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Paper>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box component="form" onSubmit={handleSend} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                {/* Selected File Preview */}
                {selectedFile && (
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            icon={<AttachFile />}
                            label={selectedFile.name}
                            onDelete={handleRemoveFile}
                            deleteIcon={<Close />}
                            color="primary"
                            variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </Typography>
                    </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <IconButton 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending}
                        color="primary"
                    >
                        <AttachFile />
                    </IconButton>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={sending || (!newMessage.trim() && !selectedFile)}
                        endIcon={<Send />}
                    >
                        Send
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}

export default MessageBox;