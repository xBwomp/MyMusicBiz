import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Calendar, Download } from 'lucide-react';
import { enrollmentService } from '../../../services/adminService';
import { offeringService, studentService } from '../../../services/programService';
import { Enrollment } from '../../../types/admin';
import { Offering, Student } from '../../../types/program';

const FinancesTab = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const [enrollmentsData, offeringsData, studentsData] = await Promise.all([
        enrollmentService.getEnrollments(),
        offeringService.getOfferings(),
        studentService.getStudents()
      ]);
      setEnrollments(enrollmentsData);
      setOfferings(offeringsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialStats = () => {
    const today = new Date();
    let totalRevenue = 0;
    let totalPaymentsReceived = 0;
    
    // Calculate revenue from classes that have started or are in progress
    offerings.forEach(offering => {
      // Only count revenue from classes that have started
      if (offering.startDate <= today && offering.isActive) {
        // Get enrolled students for this offering
        const enrolledStudents = students.filter(student => 
          student.enrolledOfferings.includes(offering.id) && student.isActive
        );
        
        // Calculate total fees for this offering
        const totalOfferingFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
        
        // Add to total revenue (enrolled students × total fees)
        totalRevenue += enrolledStudents.length * totalOfferingFees;
      }
    });
    
    // Calculate total payments received from enrollments
    totalPaymentsReceived = enrollments.reduce((sum, e) => sum + e.paidAmount, 0);
    
    // Outstanding is the difference between expected revenue and payments received
    const totalOutstanding = totalRevenue - totalPaymentsReceived;
    
    const overdueAmount = enrollments
      .filter(e => e.paymentStatus === 'overdue')
      .reduce((sum, e) => sum + (e.totalFees - e.paidAmount), 0);
    const totalEnrollments = enrollments.length;

    return {
      totalRevenue,
      totalPaymentsReceived,
      totalOutstanding,
      overdueAmount,
      totalEnrollments,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const stats = calculateFinancialStats();

  const overdueEnrollments = enrollments.filter(e => e.paymentStatus === 'overdue');
  const recentPayments = enrollments
    .filter(e => e.paymentStatus === 'paid')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finances</h2>
          <p className="text-gray-600">Track revenue, payments, and outstanding balances</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-year">Current Year</option>
            <option value="all-time">All Time</option>
          </select>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Revenue Calculation Method</h3>
        <p className="text-sm text-blue-800">
          <strong>Total Revenue:</strong> Sum of (Class Fees × Enrolled Students) for all active classes that have started or are in progress.
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <strong>Outstanding Balance:</strong> Total Revenue minus actual payments received.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">From active classes × enrolled students</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+12%</span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOutstanding)}</p>
              <p className="text-xs text-gray-500 mt-1">Revenue minus payments received</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">
              ${formatCurrency(stats.totalPaymentsReceived)} received of ${formatCurrency(stats.totalRevenue)} expected
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">
              {overdueEnrollments.length} overdue accounts
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">
              {enrollments.filter(e => e.status === 'enrolled').length} active
            </span>
          </div>
        </div>
      </div>

      {/* Overdue Payments Alert */}
      {overdueEnrollments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Overdue Payments Require Attention</h4>
              <p className="text-sm text-red-700 mt-1">
                {overdueEnrollments.length} student(s) have overdue payments totaling {formatCurrency(stats.overdueAmount)}.
                Consider sending payment reminders or following up directly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {recentPayments.slice(0, 5).map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Student: {enrollment.studentId.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(enrollment.updatedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(enrollment.paidAmount)}
                  </p>
                  <p className="text-xs text-gray-500">Paid</p>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
            )}
          </div>
        </div>

        {/* Overdue Accounts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Accounts</h3>
          <div className="space-y-3">
            {overdueEnrollments.slice(0, 5).map((enrollment) => {
              const balanceOwed = enrollment.totalFees - enrollment.paidAmount;
              return (
                <div key={enrollment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Student: {enrollment.studentId.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {formatDate(enrollment.enrollmentDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {formatCurrency(balanceOwed)}
                    </p>
                    <button className="text-xs text-indigo-600 hover:text-indigo-700">
                      Send Reminder
                    </button>
                  </div>
                </div>
              );
            })}
            {overdueEnrollments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No overdue accounts</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['paid', 'partial', 'pending', 'overdue'].map((status) => {
            const count = enrollments.filter(e => e.paymentStatus === status).length;
            const amount = enrollments
              .filter(e => e.paymentStatus === status)
              .reduce((sum, e) => sum + (status === 'paid' ? e.paidAmount : e.totalFees - e.paidAmount), 0);
            
            return (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize mb-1">{status}</p>
                <p className="text-xs text-gray-500">{formatCurrency(amount)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancesTab;