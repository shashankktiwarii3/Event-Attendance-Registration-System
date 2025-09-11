import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  LogOut
} from 'lucide-react';
import axios from 'axios';
import AdminLogin from '../components/AdminLogin';
import { API_ENDPOINTS } from '../config/api';

const Container = styled.div`
  max-width: 1200px;
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
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  border: 1px solid #2d3748;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  
  ${props => props.color === 'blue' && 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'}
  ${props => props.color === 'green' && 'background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);'}
  ${props => props.color === 'orange' && 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);'}
  ${props => props.color === 'red' && 'background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);'}
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #a0aec0;
  font-size: 0.9rem;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  
  ${props => props.direction === 'up' && 'color: #28a745;'}
  ${props => props.direction === 'down' && 'color: #dc3545;'}
  ${props => props.direction === 'same' && 'color: #6c757d;'}
`;

const ControlsCard = styled.div`
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border: 1px solid #2d3748;
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

const RefreshButton = styled(Button)`
  background: #6c757d;
  color: white;
`;

const ExportButton = styled(Button)`
  background: #28a745;
  color: white;
`;

const LiveFeedCard = styled.div`
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid #2d3748;
`;

const FeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FeedTitle = styled.h3`
  color: #e2e8f0;
  margin: 0;
`;

const LastUpdated = styled.div`
  color: #a0aec0;
  font-size: 0.9rem;
`;

const FeedList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const FeedItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #2d3748;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FeedInfo = styled.div`
  flex: 1;
`;

const FeedName = styled.div`
  font-weight: 500;
  color: #e2e8f0;
`;

const FeedDetails = styled.div`
  font-size: 0.9rem;
  color: #a0aec0;
`;

const FeedTime = styled.div`
  font-size: 0.8rem;
  color: #718096;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => props.status === 'present' && `
    background: #d4edda;
    color: #155724;
  `}
  
  ${props => props.status === 'absent' && `
    background: #f8d7da;
    color: #721c24;
  `}
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

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data from:', `${API_ENDPOINTS.ADMIN}/dashboard`);
      const response = await axios.get(`${API_ENDPOINTS.ADMIN}/dashboard`);
      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to fetch dashboard data');
    }
  };

  const fetchLiveFeed = async () => {
    try {
      console.log('Fetching live feed from:', `${API_ENDPOINTS.ADMIN}/live-feed`);
      const response = await axios.get(`${API_ENDPOINTS.ADMIN}/live-feed`);
      console.log('Live feed received:', response.data);
      console.log('Total records received:', response.data.attendance?.length || 0);
      console.log('Present count:', response.data.presentCount || 0);
      console.log('Absent count:', response.data.absentCount || 0);
      setLiveFeed(response.data.attendance);
    } catch (error) {
      console.error('Error fetching live feed:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchLiveFeed()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ADMIN}/export/excel`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel report downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };



  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem('adminAuth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          // Check if login is not older than 24 hours
          const loginTime = new Date(parsed.loginTime);
          const now = new Date();
          const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
          
          if (parsed.isAuthenticated && hoursDiff < 24) {
            setIsAuthenticated(true);
            loadDashboardData();
          } else {
            localStorage.removeItem('adminAuth');
          }
        } catch (error) {
          localStorage.removeItem('adminAuth');
        }
      }
    };

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchDashboardData(), fetchLiveFeed()]);
      } catch (error) {
        console.error('Error loading initial dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up auto-refresh when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchLiveFeed();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setLoading(true);
    try {
      await Promise.all([fetchDashboardData(), fetchLiveFeed()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setDashboardData(null);
    setLiveFeed([]);
    toast.success('Logged out successfully');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <LoadingSpinner>
        <Spinner />
      </LoadingSpinner>
    );
  }

  return (
    <Container>
      <Title>
        <BarChart3 size={32} />
        Admin Dashboard
      </Title>

      <StatsGrid>
        <StatCard>
          <StatIcon color="blue">
            <Users size={30} />
          </StatIcon>
          <StatNumber>{dashboardData?.today?.totalRegistered || 0}</StatNumber>
          <StatLabel>Total Registered</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon color="green">
            <UserCheck size={30} />
          </StatIcon>
          <StatNumber>{dashboardData?.today?.totalAttended || 0}</StatNumber>
          <StatLabel>Total Attended</StatLabel>
          {dashboardData?.trends && (
            <TrendIndicator direction={dashboardData.trends.direction}>
              {dashboardData.trends.direction === 'up' && <TrendingUp size={16} />}
              {dashboardData.trends.direction === 'down' && <TrendingDown size={16} />}
              {dashboardData.trends.direction === 'same' && <Minus size={16} />}
              {dashboardData.trends.attendanceChange}%
            </TrendIndicator>
          )}
        </StatCard>


        <StatCard>
          <StatIcon color="red">
            <Users size={30} />
          </StatIcon>
          <StatNumber>{dashboardData?.today?.absent || 0}</StatNumber>
          <StatLabel>Absent</StatLabel>
        </StatCard>
      </StatsGrid>

      <StatsGrid>
        <StatCard>
          <StatNumber>{dashboardData?.today?.attendanceRate || 0}%</StatNumber>
          <StatLabel>Attendance Rate</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{dashboardData?.today?.present || 0}</StatNumber>
          <StatLabel>Present</StatLabel>
        </StatCard>
      </StatsGrid>

      <ControlsCard>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>Dashboard Controls</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
            Manage attendance data and export reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={20} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
          <ExportButton onClick={handleExport}>
            <Download size={20} />
            Export Excel
          </ExportButton>
          <Button 
            onClick={handleLogout}
            style={{ 
              background: '#6c757d', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={20} />
            Logout
          </Button>
        </div>
      </ControlsCard>

      <LiveFeedCard>
        <FeedHeader>
          <FeedTitle>
            Live Attendance Feed ({liveFeed.length} total)
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '1rem' }}>
              Present: {liveFeed.filter(p => p.status === 'present').length} | 
              Absent: {liveFeed.filter(p => p.status === 'absent').length}
            </span>
          </FeedTitle>
          <LastUpdated>
            Last updated: {new Date().toLocaleTimeString()}
          </LastUpdated>
        </FeedHeader>
        
        <FeedList>
          {liveFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No attendance records yet
            </div>
          ) : (
            liveFeed.map((record, index) => (
              <FeedItem key={index}>
                <FeedInfo>
                  <FeedName>{record.name}</FeedName>
                  <FeedDetails>
                    {record.registrationId} • {record.email}
                  </FeedDetails>
                </FeedInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <StatusBadge status={record.status}>
                    {record.status === 'late' ? 'PRESENT' : record.status.toUpperCase()}
                  </StatusBadge>
                  <FeedTime>
                    {record.status === 'present' 
                      ? `Scanned: ${new Date(record.timestamp).toLocaleTimeString()}`
                      : `Registered: ${new Date(record.timestamp).toLocaleTimeString()}`
                    }
                  </FeedTime>
                </div>
              </FeedItem>
            ))
          )}
        </FeedList>
      </LiveFeedCard>
    </Container>
  );
};

export default AdminDashboard;
