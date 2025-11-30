import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import MarketAnalysis from '../../components/MarketAnalysis/MarketAnalysis';
import { useAuth } from '../../contexts/AuthContext';

const MarketAnalysisPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <button
          onClick={() => navigate('/seller/dashboard')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Dashboard
        </button>
        
        <MarketAnalysis />
      </div>
    </DashboardLayout>
  );
};

export default MarketAnalysisPage;

