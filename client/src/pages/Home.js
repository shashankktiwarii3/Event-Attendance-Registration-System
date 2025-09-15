import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Users, QrCode, BarChart3, UserCheck } from 'lucide-react';

const Hero = styled.section`
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e2e8f0;
  margin-bottom: 3rem;
  border-radius: 12px;
  border: 1px solid #2d3748;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  transition: transform 0.2s ease;
  border: 1px solid #2d3748;
  
  &:hover {
    transform: translateY(-5px);
    border-color: #667eea;
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #e2e8f0;
`;

const FeatureDescription = styled.p`
  color: #a0aec0;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FeatureButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const StatsSection = styled.section`
  background: #1a1a2e;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-top: 3rem;
  border: 1px solid #2d3748;
`;

const StatsTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #e2e8f0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: #2d3748;
  border-radius: 8px;
  border: 1px solid #4a5568;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #a0aec0;
  font-size: 0.9rem;
`;

const Home = () => {
  return (
    <div>
      <Hero>
        <HeroTitle>QR Event Management</HeroTitle>
        <HeroSubtitle>
          Streamline your event registration and attendance tracking with QR codes
        </HeroSubtitle>
      </Hero>

      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>
            <Users size={30} />
          </FeatureIcon>
          <FeatureTitle>Easy Registration</FeatureTitle>
          <FeatureDescription>
            Register participants quickly with our simple form. Each participant gets a unique QR code for attendance tracking.
          </FeatureDescription>
          <FeatureButton to="/register">Register Now</FeatureButton>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <QrCode size={30} />
          </FeatureIcon>
          <FeatureTitle>QR Code Scanner</FeatureTitle>
          <FeatureDescription>
            Scan QR codes to mark attendance instantly. Our system prevents duplicate entries and tracks timestamps.
          </FeatureDescription>
          <FeatureButton to="/scanner">Start Scanning</FeatureButton>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <BarChart3 size={30} />
          </FeatureIcon>
          <FeatureTitle>Admin Dashboard</FeatureTitle>
          <FeatureDescription>
            Monitor attendance in real-time, export data to Excel, and get detailed analytics for your events.
          </FeatureDescription>
          <FeatureButton to="/admin">View Dashboard</FeatureButton>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <UserCheck size={30} />
          </FeatureIcon>
          <FeatureTitle>Participant Lookup</FeatureTitle>
          <FeatureDescription>
            Look up participant information and attendance history using their registration ID or email.
          </FeatureDescription>
          <FeatureButton to="/lookup">Search Participants</FeatureButton>
        </FeatureCard>
      </FeatureGrid>

      <StatsSection>
        <StatsTitle>System Features</StatsTitle>
        <StatsGrid>
          <StatCard>
            <StatNumber>100%</StatNumber>
            <StatLabel>Digital Tracking</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>Real-time</StatNumber>
            <StatLabel>Live Updates</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>Excel</StatNumber>
            <StatLabel>Export Ready</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>Secure</StatNumber>
            <StatLabel>Duplicate Prevention</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>
    </div>
  );
};

export default Home;
