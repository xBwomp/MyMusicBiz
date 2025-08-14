import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import OverviewTab from './tabs/OverviewTab';
import ProgramsTab from './tabs/ProgramsTab';
import SchedulesTab from './tabs/SchedulesTab';
import StudentsTab from './tabs/StudentsTab';
import FamiliesTab from './tabs/FamiliesTab';
import TeachersTab from './tabs/TeachersTab';
import EnrollmentsTab from './tabs/EnrollmentsTab';
import FinancesTab from './tabs/FinancesTab';
import SettingsTab from './tabs/SettingsTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
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
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;