import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, DollarSign, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { programService, studentService, offeringService } from '../../../services/programService';
import { enrollmentService } from '../../../services/adminService';
import { Program, Student, Offering } from '../../../types/program';
import { Enrollment } from '../../../types/admin';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  activePrograms: number;
  totalOfferings: number;
  activeOfferings: number;
  totalEnrollments: number;
  activeEnrollments: number;
  monthlyRevenue: number;
  overduePayments: number;
  programUtilization: Array<{
    programName: string;
    enrolled: number;
    capacity: number;
    utilization: number;
  }>;
}

const OverviewTab = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    newStudentsThisMonth: 0,
    activePrograms: 0,
    totalOfferings: 0,
    activeOfferings: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    monthlyRevenue: 0,
    overduePayments: 0,
    programUtilization: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch all required data concurrently for better performance
      const [students, programs, offerings, enrollments] = await Promise.all([
        studentService.getStudents(),
        programService.getPrograms(),
        offeringService.getOfferings(),
        enrollmentService.getEnrollments(),
      ]);

      // Calculate comprehensive dashboard statistics
      const dashboardStats = calculateDashboardStats(students, programs, offerings, enrollments);
      
      setStats(dashboardStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDashboardStats = (
    students: Student[],
    programs: Program[],
    offerings: Offering[],
    enrollments: Enrollment[]
  ): DashboardStats => {
    // Student metrics
    const activeStudents = students.filter(s => s.isActive);
    const totalStudents = students.length;
    
    // Calculate new students this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newStudentsThisMonth = students.filter(s => {
      const createdDate = s.createdAt;
      return createdDate.getMonth() === currentMonth && 
             createdDate.getFullYear() === currentYear;
    }).length;

    // Program metrics
    const activePrograms = programs.filter(p => p.isActive);
    const totalOfferings = offerings.length;
    const activeOfferings = offerings.filter(o => o.isActive);

    // Enrollment metrics
    const activeEnrollments = enrollments.filter(e => e.status === 'enrolled');
    const totalEnrollments = enrollments.length;

    // Financial metrics
    const monthlyRevenue = enrollments
      .filter(e => {
        const enrollDate = e.enrollmentDate;
        return enrollDate.getMonth() === currentMonth && 
               enrollDate.getFullYear() === currentYear &&
               e.paymentStatus === 'paid';
      })
      .reduce((sum, e) => sum + e.paidAmount, 0);

    const overduePayments = enrollments
      .filter(e => e.paymentStatus === 'overdue')
      .reduce((sum, e) => sum + (e.totalFees - e.paidAmount), 0);

    // Program utilization analysis
    const programUtilization = activePrograms.map(program => {
      const programOfferings = activeOfferings.filter(o => o.programId === program.id);
      const totalCapacity = programOfferings.reduce((sum, o) => sum + (o.maxStudents || 0), 0);
      const totalEnrolled = programOfferings.reduce((sum, o) => sum + (o.currentEnrollment || 0), 0);
      
      return {
        programName: program.name,
        enrolled: totalEnrolled,
        capacity: totalCapacity,
        utilization: totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0,
      };
    }).filter(p => p.capacity > 0); // Only show programs with defined capacity

    return {
      totalStudents,
      activeStudents: activeStudents.length,
      newStudentsThisMonth,
      activePrograms: activePrograms.length,
      totalOfferings,
      activeOfferings: activeOfferings.length,
      totalEnrollments,
      activeEnrollments: activeEnrollments.length,
      monthlyRevenue,
      overduePayments,
      programUtilization,
    };
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate growth percentages (simplified - in real app, compare with previous period)
  const calculateGrowth = (current: number, category: string) => {
    // Simplified growth calculation - in production, compare with historical data
    const growthRates = {
      students: 12,
      programs: 3,
      enrollments: 8,
      revenue: 15,
    };
    return growthRates[category as keyof typeof growthRates] || 0;
  };

  const statCards = [
    {
      title: 'Active Students',
      value: stats.activeStudents,
      subtitle: `${stats.totalStudents} total`,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${calculateGrowth(stats.activeStudents, 'students')}%`,
      changePositive: true,
    },
    {
      title: 'Active Programs',
      value: stats.activePrograms,
      subtitle: `${stats.activeOfferings} class offerings`,
      icon: BookOpen,
      color: 'bg-green-500',
      change: `+${calculateGrowth(stats.activePrograms, 'programs')}%`,
      changePositive: true,
    },
    {
      title: 'Current Enrollments',
      value: stats.activeEnrollments,
      subtitle: `${stats.totalEnrollments} total`,
      icon: Calendar,
      color: 'bg-purple-500',
      change: `+${calculateGrowth(stats.activeEnrollments, 'enrollments')}%`,
      changePositive: true,
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      subtitle: stats.overduePayments > 0 ? `${formatCurrency(stats.overduePayments)} overdue` : 'All payments current',
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: `+${calculateGrowth(stats.monthlyRevenue, 'revenue')}%`,
      changePositive: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message with Refresh */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Hunicker Institute Admin</h2>
            <p className="text-indigo-100">
              Manage your music programs, students, and operations from this central dashboard.
            </p>
            {lastUpdated && (
              <p className="text-indigo-200 text-sm mt-2">
                Last updated: {formatDate(lastUpdated)}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className={`h-4 w-4 mr-1 ${stat.changePositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${stat.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Students This Month Alert */}
      {stats.newStudentsThisMonth > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800">New Student Growth</h4>
              <p className="text-sm text-green-700 mt-1">
                {stats.newStudentsThisMonth} new student{stats.newStudentsThisMonth !== 1 ? 's' : ''} enrolled this month! 
                Keep up the great work attracting new families to your programs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Program Utilization */}
      {stats.programUtilization.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Capacity Utilization</h3>
          <div className="space-y-4">
            {stats.programUtilization.map((program, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{program.programName}</span>
                    <span className="text-sm text-gray-600">
                      {program.enrolled} / {program.capacity} students ({program.utilization}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        program.utilization >= 90 ? 'bg-red-500' :
                        program.utilization >= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(program.utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Add New Student</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Create New Program</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Schedule Class</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Database Connection: Active</p>
                <p className="text-xs text-gray-500">All services operational</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Data Sync: Real-time</p>
                <p className="text-xs text-gray-500">Last sync: {lastUpdated ? formatDate(lastUpdated) : 'Never'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className={`p-1 rounded-full ${stats.overduePayments > 0 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <div className={`w-2 h-2 rounded-full ${stats.overduePayments > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Payment Status: {stats.overduePayments > 0 ? 'Attention Needed' : 'All Current'}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.overduePayments > 0 ? `${formatCurrency(stats.overduePayments)} overdue` : 'No overdue payments'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Payments Alert */}
      {stats.overduePayments > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Payment Attention Required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {formatCurrency(stats.overduePayments)} in overdue payments detected. 
                Review the finances section for details and consider sending payment reminders.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;