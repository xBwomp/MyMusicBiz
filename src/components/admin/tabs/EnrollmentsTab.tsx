import React, { useState, useEffect } from 'react';
import { Plus, Edit, Search, DollarSign, Calendar, User, AlertCircle } from 'lucide-react';
import { Enrollment } from '../../../types/admin';
import { enrollmentService } from '../../../services/adminService';

const EnrollmentsTab = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const enrollmentsData = await enrollmentService.getEnrollments();
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.offeringId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'waitlist':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Enrollments</h2>
          <p className="text-gray-600">Manage student enrollments and payments</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Enrollment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student or offering ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="enrolled">Enrolled</option>
            <option value="waitlist">Waitlist</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
      </div>

      {/* Enrollments Grid */}
      <div className="grid gap-6">
        {filteredEnrollments.map((enrollment) => {
          const balanceOwed = enrollment.totalFees - enrollment.paidAmount;
          const isOverdue = enrollment.paymentStatus === 'overdue';
          
          return (
            <div key={enrollment.id} className={`bg-white rounded-lg shadow-sm border p-6 ${
              isOverdue ? 'border-red-200' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      isOverdue ? 'bg-red-100' : 'bg-indigo-100'
                    }`}>
                      {isOverdue ? (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <User className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Enrollment #{enrollment.id.slice(-6)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                          {enrollment.paymentStatus.charAt(0).toUpperCase() + enrollment.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Student: {enrollment.studentId.slice(-6)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Offering: {enrollment.offeringId.slice(-6)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Enrolled: {formatDate(enrollment.enrollmentDate)}</span>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Financial Details</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Total Fees:</span>
                        <div className="text-gray-900">{formatCurrency(enrollment.totalFees)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Paid:</span>
                        <div className="text-green-600">{formatCurrency(enrollment.paidAmount)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Balance:</span>
                        <div className={balanceOwed > 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(balanceOwed)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Payment Status:</span>
                        <div className={`font-medium ${
                          enrollment.paymentStatus === 'paid' ? 'text-green-600' :
                          enrollment.paymentStatus === 'overdue' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {enrollment.paymentStatus.charAt(0).toUpperCase() + enrollment.paymentStatus.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Information */}
                  {enrollment.scheduleId && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-900">Schedule ID:</span>
                      <span className="ml-2 text-sm text-gray-600">{enrollment.scheduleId.slice(-6)}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {enrollment.notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{enrollment.notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Created: {formatDate(enrollment.createdAt)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200">
                    <Edit className="h-4 w-4" />
                  </button>
                  {balanceOwed > 0 && (
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium">
                      Record Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEnrollments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first enrollment.'
            }
          </p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>Create First Enrollment</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EnrollmentsTab;