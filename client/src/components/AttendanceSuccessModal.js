import React from 'react';
import styled from 'styled-components';
import { CheckCircle, User, Mail, Hash, Clock, MapPin, X } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const SuccessHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
    }
  }
`;

const SuccessTitle = styled.h2`
  color: #28a745;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const SuccessSubtitle = styled.p`
  color: #666;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
`;

const ParticipantDetails = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailIcon = styled.div`
  margin-right: 1rem;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
`;

const DetailInfo = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-weight: 500;
  color: #333;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  margin: 1rem 0;
  
  ${props => props.status === 'present' && `
    background: #d4edda;
    color: #155724;
    border: 2px solid #c3e6cb;
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  color: white;
`;

const AttendanceSuccessModal = ({ isOpen, onClose, attendance, onScanAnother }) => {
  if (!isOpen || !attendance) return null;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>

        <SuccessHeader>
          <SuccessIcon>
            <CheckCircle size={40} color="white" />
          </SuccessIcon>
          <SuccessTitle>Attendance Marked Successfully!</SuccessTitle>
          <SuccessSubtitle>Welcome to the event</SuccessSubtitle>
        </SuccessHeader>

        <ParticipantDetails>
          <DetailRow>
            <DetailIcon><User size={20} /></DetailIcon>
            <DetailInfo>
              <DetailLabel>Participant Name</DetailLabel>
              <DetailValue>{attendance.name}</DetailValue>
            </DetailInfo>
          </DetailRow>

          <DetailRow>
            <DetailIcon><Mail size={20} /></DetailIcon>
            <DetailInfo>
              <DetailLabel>Email Address</DetailLabel>
              <DetailValue>{attendance.email}</DetailValue>
            </DetailInfo>
          </DetailRow>

          <DetailRow>
            <DetailIcon><Hash size={20} /></DetailIcon>
            <DetailInfo>
              <DetailLabel>Registration ID</DetailLabel>
              <DetailValue>{attendance.registrationId}</DetailValue>
            </DetailInfo>
          </DetailRow>

          <DetailRow>
            <DetailIcon><Clock size={20} /></DetailIcon>
            <DetailInfo>
              <DetailLabel>Attendance Time</DetailLabel>
              <DetailValue>{formatTime(attendance.timestamp)}</DetailValue>
            </DetailInfo>
          </DetailRow>

          <DetailRow>
            <DetailIcon><MapPin size={20} /></DetailIcon>
            <DetailInfo>
              <DetailLabel>Location</DetailLabel>
              <DetailValue>{attendance.location}</DetailValue>
            </DetailInfo>
          </DetailRow>
        </ParticipantDetails>

        <div style={{ textAlign: 'center' }}>
          <StatusBadge status={attendance.status}>
            <CheckCircle size={20} />
            PRESENT
          </StatusBadge>
        </div>

        <ActionButtons>
          <SecondaryButton onClick={onClose}>
            Close
          </SecondaryButton>
          <PrimaryButton onClick={onScanAnother}>
            Scan Another
          </PrimaryButton>
        </ActionButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AttendanceSuccessModal;
