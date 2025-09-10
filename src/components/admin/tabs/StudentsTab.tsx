import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Mail, Phone, Calendar } from 'lucide-react';
import { Student, Offering } from '../../../types/program';
import { StudentStatus } from '../../../types/status';
import { studentService, offeringService } from '../../../services/programService';
import StudentModal from '../modals/StudentModal';
import StatusDropdown from '../../common/StatusDropdown';
import StatusHistory from '../../common/StatusHistory';
import { useAdmin } from '../../../hooks/useAdmin';

const StudentsTab = () => {
  const { userProfile } = useAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showStatusHistory, setShowStatusHistory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, offeringsData] = await Promise.all([
        studentService.getStudents(),
        offeringService.getOfferings()
      ]);
      setStudents(studentsData);
      setOfferings(offeringsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOfferingName = (offeringId: string) => {
    const offering = offerings.find(o => o.id === offeringId);
    return offering ? offering.className : `Class ID: ${offeringId.slice(-6)}`;
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      (student.instrument && student.instrument.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    // Reload students to reflect the status change
    await loadData();
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
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <p className="text-gray-600">Manage student profiles and information</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name, email, or instrument..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Students Grid */}
        <div className="grid gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              id={`student-${student.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-lg">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      {student.grade && (
                        <span>Grade {student.grade}</span>
                      )}
                      {student.dateOfBirth && (
                        <span>Age {calculateAge(student.dateOfBirth)}</span>
                      )}
                      {student.skillLevel && (
                        <span className="capitalize">{student.skillLevel}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusDropdown
                        entityType="student"
                        entityId={student.id}
                        currentStatus={(student.status as StudentStatus) || 'active'}
                        onStatusChange={(newStatus) => handleStatusChange(student.id, newStatus)}
                        size="sm"
                        userRole={userProfile?.role}
                        changedById={userProfile?.id}
                      />
                      <button
                        onClick={() => setShowStatusHistory(
                          showStatusHistory === student.id ? null : student.id
                        )}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        {showStatusHistory === student.id ? 'Hide History' : 'View History'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.phone}</span>
                    </div>
                  )}
                  {student.instrument && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Instrument:</span>
                      <span className="text-sm text-gray-600">{student.instrument}</span>
                    </div>
                  )}
                </div>

                {student.enrolledOfferings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Enrolled Classes</h4>
                    <div className="flex flex-wrap gap-2">
                      {student.enrolledOfferings.map((offeringId, index) => {
                        const offeringName = getOfferingName(offeringId);
                        return (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {offeringName}
                        </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {student.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{student.notes}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <span>Created: {formatDate(student.createdAt)}</span>
                </div>

                {/* Status History */}
                {showStatusHistory === student.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <StatusHistory
                      entityType="student"
                      entityId={student.id}
                      maxEntries={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingStudent(student);
                    setShowModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first student.'
            }
          </p>
          <button
            onClick={() => {
              setEditingStudent(null);
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Add First Student</span>
          </button>
        </div>
      )}
      {showModal && (
        <StudentModal
          student={editingStudent || undefined}
          onClose={() => setShowModal(false)}
          onSaved={loadData}
        />
      )}
    </div>
  );
};

export default StudentsTab;
