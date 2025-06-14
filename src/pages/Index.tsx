
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SetupPage from './SetupPage';

const Index = () => {
  // Remove the automatic redirect and show the setup page instead
  return <SetupPage />;
};

export default Index;
