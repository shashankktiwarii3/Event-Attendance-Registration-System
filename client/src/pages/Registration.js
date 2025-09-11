import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { QrCode, Download, User, Mail, Hash } from 'lucide-react';
import QRCodeReact from 'qrcode.react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #e2e8f0;
`;

const FormCard = styled.div`
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid #2d3748;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e2e8f0;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #2d3748;
  color: #e2e8f0;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const QRCard = styled.div`
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  border: 1px solid #2d3748;
`;

const QRContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: inline-block;
  margin: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const ParticipantInfo = styled.div`
  background: #2d3748;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: left;
  border: 1px solid #4a5568;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.div`
  margin-right: 0.5rem;
  color: #667eea;
`;

const InfoText = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
  color: #e2e8f0;
`;

const InfoValue = styled.span`
  color: #a0aec0;
`;

const DownloadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem auto 0;
  
  &:hover {
    background: #218838;
  }
`;

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_ENDPOINTS.PARTICIPANTS}/register`, formData);
      setParticipant(response.data.participant);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    if (!participant) return;
    
    try {
      // Method 1: Try to find canvas element
      const canvas = document.querySelector('#qr-code canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${participant.name.replace(/\s+/g, '-')}-QR-Code.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded successfully!');
        return;
      }

      // Method 2: Generate QR code data URL directly (most reliable)
      const qrData = JSON.stringify({
        registrationId: participant.registrationId,
        name: participant.name,
        email: participant.email,
        timestamp: participant.registeredAt
      });

      // Use the QRCode library to generate data URL
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const link = document.createElement('a');
      link.download = `${participant.name.replace(/\s+/g, '-')}-QR-Code.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code downloaded successfully!');

    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: Try to copy QR code data to clipboard
      try {
        const qrData = JSON.stringify({
          registrationId: participant.registrationId,
          name: participant.name,
          email: participant.email,
          timestamp: participant.registeredAt
        });
        
        await navigator.clipboard.writeText(qrData);
        toast.info('QR code data copied to clipboard. You can save it manually.');
      } catch (clipboardError) {
        toast.error('Failed to download QR code. Please try refreshing the page.');
      }
    }
  };

  return (
    <Container>
      <Title>Event Registration</Title>
      
      {!participant ? (
        <FormCard>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">
                <User size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Full Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">
                <Mail size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
              />
            </FormGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register for Event'}
            </Button>
          </form>
        </FormCard>
      ) : (
        <QRCard>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>
            <QrCode size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Your QR Code
          </h2>
          
          <ParticipantInfo>
            <InfoRow>
              <InfoIcon><User size={16} /></InfoIcon>
              <InfoText>Name:</InfoText>
              <InfoValue>{participant.name}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoIcon><Mail size={16} /></InfoIcon>
              <InfoText>Email:</InfoText>
              <InfoValue>{participant.email}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoIcon><Hash size={16} /></InfoIcon>
              <InfoText>Registration ID:</InfoText>
              <InfoValue>{participant.registrationId}</InfoValue>
            </InfoRow>
          </ParticipantInfo>

          <QRContainer>
            <QRCodeReact
              id="qr-code"
              value={JSON.stringify({
                registrationId: participant.registrationId,
                name: participant.name,
                email: participant.email,
                timestamp: participant.registeredAt
              })}
              size={200}
              level="H"
              includeMargin={true}
              renderAs="canvas"
            />
          </QRContainer>

          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Show this QR code at the event entrance to mark your attendance.
          </p>

          <DownloadButton onClick={downloadQRCode}>
            <Download size={16} />
            Download QR Code
          </DownloadButton>

          <Button 
            onClick={() => {
              setParticipant(null);
              setFormData({ name: '', email: '' });
            }}
            style={{ marginTop: '1rem', background: '#6c757d' }}
          >
            Register Another Person
          </Button>
        </QRCard>
      )}
    </Container>
  );
};

export default Registration;
