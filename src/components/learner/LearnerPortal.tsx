import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LearnerLayout from './LearnerLayout';
import ParentDashboard from './dashboard/ParentDashboard';
import ProgramBrowser from './programs/ProgramBrowser';
import EnrollmentManager from './enrollments/EnrollmentManager';
import FamilyProfile from './profile/FamilyProfile';
import PaymentCenter from './payments/PaymentCenter';
import LearnerSettings from './settings/LearnerSettings';

const LearnerPortal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ParentDashboard />;
      case 'programs':
        return <ProgramBrowser />;
      case 'enrollments':
        return <EnrollmentManager />;
      case 'family':
        return <FamilyProfile />;
      case 'payments':
        return <PaymentCenter />;
      case 'settings':
        return <LearnerSettings />;
      default:
        return <ParentDashboard />;
    }
  };

  return (
    <LearnerLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </LearnerLayout>
  );
};

export default LearnerPortal;