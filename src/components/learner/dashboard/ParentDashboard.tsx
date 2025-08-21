import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, DollarSign, Bell, Plus, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { familyService } from '../../../services/adminService';
import { studentService } from '../../../services/programService';
import { programService, offeringService } from '../../../services/programService';
import { Family } from '../../../types/admin';
import { Student, Program, Offering } from '../../../types/program';

const ParentDashboard = () => {
  const { userProfile } = useAdmin();
  const [family, setFamily] = useState<Family | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
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
      }

      // Load programs and offerings
      const [programsData, offeringsData] = await Promise.all([
        programService.getActivePrograms(),
        offeringService.getActiveOfferings()
      ]);
      
      setPrograms(programsData);
      setOfferings(offeringsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentEnrollments = (studentId: string) => {
    return offerings.filter(o => 
      students.find(s => s.id === studentId)?.enrolledOfferings.includes(o.id)
    );
  };

  const getTotalMonthlyFees = () => {
    let total = 0;
    students.forEach(student => {
      const enrollments = getStudentEnrollments(student.id);
      enrollments.forEach(enrollment => {
        total += enrollment.instructionalFee;
      });
    });
    return total;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Family Profile Not Found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find a family profile associated with your account. 
          Please contact the administrator to set up your family profile.
        </p>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
          Contact Support
        </button>
      </div>
    );
  }

  const totalEnrollments = students.reduce((sum, student) => sum + student.enrolledOfferings.length, 0);
  const activeStudents = students.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {family.familyName} Family!</h1>
        <p className="text-indigo-100">
          Manage your children's musical education and track their progress.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Fees</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalMonthlyFees())}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Programs</p>
              <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Students Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">My Students</h2>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1">
            <span>Manage All</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {students.length > 0 ? (
          <div className="grid gap-4">
            {students.map((student) => {
              const enrollments = getStudentEnrollments(student.id);
              return (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {enrollments.length} active enrollment{enrollments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {enrollments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {enrollments.map((enrollment) => (
                          <span
                            key={enrollment.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {enrollment.className}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found for your family.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Plus className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-gray-900">Enroll in New Program</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-gray-900">View Schedule</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-gray-900">Make Payment</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Welcome to the Family Portal!</p>
              <p className="text-xs text-gray-600">You can now manage your family's enrollments online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;