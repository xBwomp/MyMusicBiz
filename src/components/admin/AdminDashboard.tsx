import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const StudentsTab = lazy(() => import('./tabs/StudentsTab'));
const FamiliesTab = lazy(() => import('./tabs/FamiliesTab'));
const TeachersTab = lazy(() => import('./tabs/TeachersTab'));
const EnrollmentsTab = lazy(() => import('./tabs/EnrollmentsTab'));
const FinancesTab = lazy(() => import('./tabs/FinancesTab'));
const SettingsTab = lazy(() => import('./tabs/SettingsTab'));
const SchedulesTab = lazy(() => import('./tabs/SchedulesTab'));
const ProgramsTab = lazy(() => import('./tabs/ProgramsTab'));

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const renderTabContent = () => {
    return (
      <Suspense fallback={<div>Loading tab...</div>}>
        {(() => {
          switch (activeTab) {
            case 'overview':
              return <OverviewTab />;
            case 'programs':
              return <ProgramsTab />;
            case 'schedules':
              return <SchedulesTab />;
            case 'students':
              return <StudentsTab />;
            case 'families':
              return <FamiliesTab />;
            case 'teachers':
              return <TeachersTab />;
            case 'enrollments':
              return <EnrollmentsTab />;
            case 'finances':
              return <FinancesTab />;
            case 'settings':
              return <SettingsTab />;
            default:
              return <OverviewTab />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;