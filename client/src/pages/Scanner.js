import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { QrCode, Camera, CheckCircle, XCircle } from 'lucide-react';
import QrScanner from 'qr-scanner';
import axios from 'axios';
import AttendanceSuccessModal from '../components/AttendanceSuccessModal';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #e2e8f0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ScannerCard = styled.div`
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid #2d3748;
`;

const ScannerContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
`;

const Video = styled.video`
  width: 100%;
  height: 300px;
  object-fit: cover;
`;

const ScannerOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px solid #667eea;
  border-radius: 12px;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid rgba(102, 126, 234, 0.3);
    border-radius: 12px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const StartButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const StopButton = styled(Button)`
  background: #dc3545;
  color: white;
`;

const ResultCard = styled.div`
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-top: 2rem;
  border: 1px solid #2d3748;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ResultTitle = styled.h3`
  color: #e2e8f0;
  margin: 0;
`;

const ParticipantInfo = styled.div`
  background: #2d3748;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #4a5568;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #e2e8f0;
`;

const InfoValue = styled.span`
  color: #a0aec0;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  margin-top: 1rem;
  
  ${props => props.status === 'present' && `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `}
  
  ${props => props.status === 'error' && `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

const ManualInput = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #2d3748;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  background-color: #2d3748;
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Scanner = () => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAttendance, setSuccessAttendance] = useState(null);
  const videoRef = useRef(null);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    try {
      const video = videoRef.current;
      if (!video) return;

      const qrScanner = new QrScanner(
        video,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScanner.start();
      setScanner(qrScanner);
      setIsScanning(true);
      setResult(null);
    } catch (error) {
      console.error('Scanner error:', error);
      toast.error('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.destroy();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const handleScan = async (qrData) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/attendance/scan', {
        qrData,
        scannedBy: 'scanner',
        location: 'main-hall'
      });

      setResult({
        success: true,
        attendance: response.data.attendance,
        message: response.data.message
      });

      // Show success modal instead of toast
      setSuccessAttendance(response.data.attendance);
      setShowSuccessModal(true);
      stopScanner();
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to mark attendance'
      });
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    setLoading(true);
    try {
      // First get participant by registration ID
      const participantResponse = await axios.get(`/api/participants/${manualId}`);
      const participant = participantResponse.data.participant;

      // Then mark attendance
      const qrData = JSON.stringify({
        registrationId: participant.registrationId,
        name: participant.name,
        email: participant.email,
        timestamp: participant.registeredAt
      });

      const response = await axios.post('/api/attendance/scan', {
        qrData,
        scannedBy: 'manual',
        location: 'main-hall'
      });

      setResult({
        success: true,
        attendance: response.data.attendance,
        message: response.data.message
      });

      // Show success modal instead of toast
      setSuccessAttendance(response.data.attendance);
      setShowSuccessModal(true);
      setManualId('');
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to mark attendance'
      });
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSuccessAttendance(null);
    setResult(null);
  };

  const handleScanAnother = () => {
    setShowSuccessModal(false);
    setSuccessAttendance(null);
    setResult(null);
    // Optionally restart scanner
    if (!isScanning) {
      startScanner();
    }
  };

  return (
    <Container>
      <Title>
        <QrCode size={32} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        QR Code Scanner
      </Title>

      <ScannerCard>
        <ScannerContainer>
          <Video ref={videoRef} />
          {isScanning && <ScannerOverlay />}
        </ScannerContainer>

        <Controls>
          {!isScanning ? (
            <StartButton onClick={startScanner} disabled={loading}>
              <Camera size={20} />
              Start Scanner
            </StartButton>
          ) : (
            <StopButton onClick={stopScanner}>
              <XCircle size={20} />
              Stop Scanner
            </StopButton>
          )}
        </Controls>

        <ManualInput>
          <h3 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Manual Entry</h3>
          <form onSubmit={handleManualSubmit}>
            <Input
              type="text"
              placeholder="Enter Registration ID (e.g., NSCC-123456-ABC12)"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
            <Button type="submit" disabled={loading || !manualId.trim()}>
              {loading ? 'Processing...' : 'Mark Attendance'}
            </Button>
          </form>
        </ManualInput>
      </ScannerCard>

      {result && (
        <ResultCard>
          <ResultHeader>
            {result.success ? (
              <>
                <CheckCircle size={24} color="#28a745" />
                <ResultTitle>Attendance Marked Successfully</ResultTitle>
              </>
            ) : (
              <>
                <XCircle size={24} color="#dc3545" />
                <ResultTitle>Error</ResultTitle>
              </>
            )}
          </ResultHeader>

          {result.success && result.attendance && (
            <>
              <ParticipantInfo>
                <InfoRow>
                  <InfoLabel>Name:</InfoLabel>
                  <InfoValue>{result.attendance.name}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Email:</InfoLabel>
                  <InfoValue>{result.attendance.email}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Registration ID:</InfoLabel>
                  <InfoValue>{result.attendance.registrationId}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Time:</InfoLabel>
                  <InfoValue>{new Date(result.attendance.timestamp).toLocaleString()}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Location:</InfoLabel>
                  <InfoValue>{result.attendance.location}</InfoValue>
                </InfoRow>
              </ParticipantInfo>

              <StatusBadge status={result.attendance.status}>
                {result.attendance.status === 'present' && <CheckCircle size={16} />}
                {result.attendance.status.toUpperCase()}
              </StatusBadge>
            </>
          )}

          <p style={{ color: result.success ? '#28a745' : '#dc3545', marginTop: '1rem' }}>
            {result.message}
          </p>

          <Button 
            onClick={() => setResult(null)}
            style={{ marginTop: '1rem', background: '#6c757d' }}
          >
            Scan Another
          </Button>
        </ResultCard>
      )}

      <AttendanceSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        attendance={successAttendance}
        onScanAnother={handleScanAnother}
      />
    </Container>
  );
};

export default Scanner;
