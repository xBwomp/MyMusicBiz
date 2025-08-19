import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { familyService, studentService, enrollmentService } from '../../../services/adminService';
import { studentService } from '../../../services/programService';
import { Family, Enrollment } from '../../../types/admin';
import { Student } from '../../../types/program';

const PaymentCenter = () => {
  const { userProfile } = useAdmin();
  const [family, setFamily] = useState<Family | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, [userProfile]);

  const loadPaymentData = async () => {
    if (!userProfile?.email) return;

    try {
      setLoading(true);
      
      // Find family by email
      const families = await familyService.getFamilies();
      const userFamily = families.find(f => 
        f.primaryContactEmail === userProfile.email || 
        f.secondaryContactEmail === userProfile.email
      );

      if (userFamily) {
        setFamily(userFamily);
        
        // Load students for this family
        const allStudents = await studentService.getStudents();
        const familyStudents = allStudents.filter(s => s.familyId === userFamily.id);
        setStudents(familyStudents);

        // Load enrollments for family students
        const allEnrollments = await enrollmentService.getEnrollments();
        const familyEnrollments = allEnrollments.filter(e => 
          familyStudents.some(s => s.id === e.studentId)
        );
        setEnrollments(familyEnrollments);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
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

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Family Profile Not Found</h3>
        <p className="text-gray-600">
          Please contact support to set up your family profile.
        </p>
      </div>
    );
  }

  const totalOwed = enrollments.reduce((sum, e) => sum + (e.totalFees - e.paidAmount), 0);
  const totalPaid = enrollments.reduce((sum, e) => sum + e.paidAmount, 0);
  const overduePayments = enrollments.filter(e => e.paymentStatus === 'overdue');
  const pendingPayments = enrollments.filter(e => e.paymentStatus === 'pending' || e.paymentStatus === 'partial');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Center</h1>
        <p className="text-gray-600">Manage your family's payments and billing information</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOwed)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Payments</p>
              <p className="text-2xl font-bold text-red-600">{overduePayments.length}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Payments */}
      {totalOwed > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Outstanding Payments</h2>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Pay All ({formatCurrency(totalOwed)})</span>
            </button>
          </div>

          <div className="space-y-4">
            {enrollments
              .filter(e => e.totalFees > e.paidAmount)
              .map((enrollment) => {
                const student = students.find(s => s.id === enrollment.studentId);
                const balanceOwed = enrollment.totalFees - enrollment.paidAmount;
                
                return (
                  <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                            {getPaymentStatusIcon(enrollment.paymentStatus)}
                            <span className="capitalize">{enrollment.paymentStatus}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-gray-900">Total Fees</div>
                            <div className="text-gray-600">{formatCurrency(enrollment.totalFees)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Paid Amount</div>
                            <div className="text-green-600">{formatCurrency(enrollment.paidAmount)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Balance Due</div>
                            <div className="text-red-600 font-semibold">{formatCurrency(balanceOwed)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Enrolled</div>
                            <div className="text-gray-600">{formatDate(enrollment.enrollmentDate)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                          Pay {formatCurrency(balanceOwed)}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <button className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Statement</span>
          </button>
        </div>

        <div className="space-y-4">
          {enrollments
            .filter(e => e.paidAmount > 0)
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, 10)
            .map((enrollment) => {
              const student = students.find(s => s.id === enrollment.studentId);
              
              return (
                <div key={enrollment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Payment for {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(enrollment.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(enrollment.paidAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {enrollment.paymentStatus === 'paid' ? 'Paid in Full' : 'Partial Payment'}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {enrollments.filter(e => e.paidAmount > 0).length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payment history available.</p>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No payment methods on file.</p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCenter;