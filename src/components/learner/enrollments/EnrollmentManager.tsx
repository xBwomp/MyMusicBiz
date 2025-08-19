import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { familyService, studentService, enrollmentService } from '../../../services/adminService';
import { offeringService } from '../../../services/programService';
import { Family, Enrollment } from '../../../types/admin';
import { Student, Offering } from '../../../types/program';

const EnrollmentManager = () => {
  const { userProfile } = useAdmin();
  const [family, setFamily] = useState<Family | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollmentData();
  }, [userProfile]);

  const loadEnrollmentData = async () => {
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

      // Load offerings
      const offeringsData = await offeringService.getOfferings();
      setOfferings(offeringsData);
    } catch (error) {
      console.error('Error loading enrollment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentEnrollments = (studentId: string) => {
    return enrollments.filter(e => e.studentId === studentId);
  };

  const getOfferingDetails = (offeringId: string) => {
    return offerings.find(o => o.id === offeringId);
  };

  const getStudentDetails = (studentId: string) => {
    return students.find(s => s.id === studentId);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <CheckCircle className="h-4 w-4" />;
      case 'waitlist':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'dropped':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Family Profile Not Found</h3>
        <p className="text-gray-600">
          Please contact support to set up your family profile.
        </p>
      </div>
    );
  }

  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled').length;
  const totalOwed = enrollments.reduce((sum, e) => sum + (e.totalFees - e.paidAmount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Enrollments</h1>
        <p className="text-gray-600">Manage your children's class enrollments and payments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{activeEnrollments}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOwed)}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments by Student */}
      <div className="space-y-6">
        {students.map((student) => {
          const studentEnrollments = getStudentEnrollments(student.id);
          
          if (studentEnrollments.length === 0) return null;

          return (
            <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-lg">
                    {student.firstName[0]}{student.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {studentEnrollments.length} enrollment{studentEnrollments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {studentEnrollments.map((enrollment) => {
                  const offering = getOfferingDetails(enrollment.offeringId);
                  const balanceOwed = enrollment.totalFees - enrollment.paidAmount;
                  
                  return (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {offering?.className || 'Unknown Class'}
                          </h4>
                          <p className="text-sm text-gray-600">{offering?.term}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(enrollment.status)}`}>
                            {getStatusIcon(enrollment.status)}
                            <span className="capitalize">{enrollment.status}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                            {enrollment.paymentStatus.charAt(0).toUpperCase() + enrollment.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>

                      {offering && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Start Date</div>
                              <div className="text-gray-600">{formatDate(offering.startDate)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">End Date</div>
                              <div className="text-gray-600">{formatDate(offering.stopDate)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Location</div>
                              <div className="text-gray-600">
                                {offering.deliveryMethod === 'virtual' ? 'Virtual' : offering.location || 'On Site'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Instructor</div>
                              <div className="text-gray-600">{offering.instructor}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-lg p-3">
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
                            <div className={balanceOwed > 0 ? 'text-red-600' : 'text-green-600'}>
                              {formatCurrency(balanceOwed)}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Enrolled</div>
                            <div className="text-gray-600">{formatDate(enrollment.enrollmentDate)}</div>
                          </div>
                        </div>
                      </div>

                      {balanceOwed > 0 && (
                        <div className="mt-3 flex justify-end">
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                            Make Payment
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {enrollments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollments Found</h3>
          <p className="text-gray-600 mb-6">
            You don't have any current enrollments. Browse our programs to get started!
          </p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Browse Programs
          </button>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManager;