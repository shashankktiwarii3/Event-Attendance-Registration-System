import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Search, User, Mail, Hash, Calendar, CheckCircle, XCircle } from 'lucide-react';
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SearchCard = styled.div`
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid #2d3748;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #2d3748;
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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

const SearchOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const OptionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid #4a5568;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.active && `
    border-color: #667eea;
    background: #667eea;
    color: white;
  `}
`;

const ResultCard = styled.div`
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid #2d3748;
`;

const ParticipantInfo = styled.div`
  background: #2d3748;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #4a5568;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.div`
  margin-right: 0.75rem;
  color: #667eea;
`;

const InfoText = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
  min-width: 120px;
  color: #e2e8f0;
`;

const InfoValue = styled.span`
  color: #a0aec0;
`;

const AttendanceSection = styled.div`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #e2e8f0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AttendanceList = styled.div`
  background: #2d3748;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #4a5568;
`;

const AttendanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #4a5568;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AttendanceInfo = styled.div`
  flex: 1;
`;

const AttendanceDate = styled.div`
  font-weight: 500;
  color: #e2e8f0;
`;

const AttendanceTime = styled.div`
  font-size: 0.9rem;
  color: #a0aec0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${props => props.status === 'present' && `
    background: #d4edda;
    color: #155724;
  `}
  
  ${props => props.status === 'absent' && `
    background: #f8d7da;
    color: #721c24;
  `}
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: #a0aec0;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ParticipantLookup = () => {
  const [searchType, setSearchType] = useState('registrationId');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    try {
      let response;
      
      if (searchType === 'registrationId') {
        response = await axios.get(`${API_ENDPOINTS.PARTICIPANTS}/${searchValue}`);
        setParticipant(response.data.participant);
        
        // Fetch attendance for this participant
        const attendanceResponse = await axios.get(`${API_ENDPOINTS.ATTENDANCE}/participant/${searchValue}`);
        setAttendance(attendanceResponse.data.attendance);
      } else if (searchType === 'email') {
        // For email search, we'll need to get all participants and filter
        const allParticipantsResponse = await axios.get(API_ENDPOINTS.PARTICIPANTS);
        const foundParticipant = allParticipantsResponse.data.participants.find(
          p => p.email.toLowerCase() === searchValue.toLowerCase()
        );
        
        if (foundParticipant) {
          setParticipant(foundParticipant);
          const attendanceResponse = await axios.get(`${API_ENDPOINTS.ATTENDANCE}/participant/${foundParticipant.registrationId}`);
          setAttendance(attendanceResponse.data.attendance);
        } else {
          setParticipant(null);
          setAttendance([]);
          toast.error('Participant not found');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setParticipant(null);
      setAttendance([]);
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} />;
      case 'absent':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <Container>
      <Title>
        <Search size={32} />
        Participant Lookup
      </Title>

      <SearchCard>
        <SearchOptions>
          <OptionButton
            type="button"
            active={searchType === 'registrationId'}
            onClick={() => setSearchType('registrationId')}
          >
            Registration ID
          </OptionButton>
          <OptionButton
            type="button"
            active={searchType === 'email'}
            onClick={() => setSearchType('email')}
          >
            Email Address
          </OptionButton>
        </SearchOptions>

        <SearchForm onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder={
              searchType === 'registrationId' 
                ? 'Enter Registration ID (e.g., NSCC-123456-ABC12)'
                : 'Enter Email Address'
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button type="submit" disabled={loading || !searchValue.trim()}>
            <Search size={20} />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </SearchForm>
      </SearchCard>

      {loading && (
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      )}

      {!loading && participant && (
        <ResultCard>
          <ParticipantInfo>
            <InfoRow>
              <InfoIcon><User size={20} /></InfoIcon>
              <InfoText>Name:</InfoText>
              <InfoValue>{participant.name}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoIcon><Mail size={20} /></InfoIcon>
              <InfoText>Email:</InfoText>
              <InfoValue>{participant.email}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoIcon><Hash size={20} /></InfoIcon>
              <InfoText>Registration ID:</InfoText>
              <InfoValue>{participant.registrationId}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoIcon><Calendar size={20} /></InfoIcon>
              <InfoText>Registered:</InfoText>
              <InfoValue>{new Date(participant.registeredAt).toLocaleDateString()}</InfoValue>
            </InfoRow>
          </ParticipantInfo>

          <AttendanceSection>
            <SectionTitle>
              <Calendar size={20} />
              Attendance History
            </SectionTitle>
            
            {attendance.length === 0 ? (
              <NoResults>
                No attendance records found for this participant.
              </NoResults>
            ) : (
              <AttendanceList>
                {attendance.map((record, index) => (
                  <AttendanceItem key={index}>
                    <AttendanceInfo>
                      <AttendanceDate>
                        {new Date(record.timestamp).toLocaleDateString()}
                      </AttendanceDate>
                      <AttendanceTime>
                        {new Date(record.timestamp).toLocaleTimeString()} • {record.location}
                      </AttendanceTime>
                    </AttendanceInfo>
                    <StatusBadge status={record.status}>
                      {getStatusIcon(record.status)}
                      {record.status.toUpperCase()}
                    </StatusBadge>
                  </AttendanceItem>
                ))}
              </AttendanceList>
            )}
          </AttendanceSection>
        </ResultCard>
      )}

      {!loading && !participant && searchValue && (
        <ResultCard>
          <NoResults>
            <User size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No participant found</h3>
            <p>Please check your search criteria and try again.</p>
          </NoResults>
        </ResultCard>
      )}
    </Container>
  );
};

export default ParticipantLookup;
