import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { programService, studentService } from '../../../services/programService';
import { enrollmentService } from '../../../services/adminService';

const OverviewTab = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activePrograms: 0,
    totalEnrollments: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [students, programs, enrollments] = await Promise.all([
        studentService.getStudents(),
        programService.getActivePrograms(),
        enrollmentService.getEnrollments(),
      ]);

      // Calculate monthly revenue (simplified - sum of all paid enrollments)
      const monthlyRevenue = enrollments
        .filter(e => e.paymentStatus === 'paid')
        .reduce((sum, e) => sum + e.paidAmount, 0);

      setStats({
        totalStudents: students.length,
        activePrograms: programs.length,
        totalEnrollments: enrollments.length,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Programs',
      value: stats.activePrograms,
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+3%',
    },
    {
      title: 'Enrollments',
      value: stats.totalEnrollments,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+8%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Hunicker Institute Admin</h2>
        <p className="text-indigo-100">
          Manage your music programs, students, and operations from this central dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New student enrolled in Piano Basics</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Payment received from Johnson family</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-purple-100 rounded-full">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New class schedule created</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Attention Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              3 students have overdue payments. Review the finances section for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;