import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Mail, Phone, MapPin, Users } from 'lucide-react';
import { Family } from '../../../types/admin';
import { FamilyStatus } from '../../../types/status';
import { Student } from '../../../types/program';
import { familyService } from '../../../services/adminService';
import { studentService } from '../../../services/programService';
import FamilyModal from '../modals/FamilyModal';
import StudentViewModal from '../modals/StudentViewModal';
import StatusDropdown from '../../common/StatusDropdown';
import StatusHistory from '../../common/StatusHistory';

const FamiliesTab = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showStatusHistory, setShowStatusHistory] = useState<string | null>(null);

  useEffect(() => {
    loadFamilies();
    loadStudents();
  }, []);

  const loadFamilies = async () => {
    try {
      const familiesData = await familyService.getFamilies();
      setFamilies(familiesData);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const studentsData = await studentService.getStudents();
      const studentMap: Record<string, Student> = {};
      studentsData.forEach(student => {
        studentMap[student.id] = student;
      });
      setStudents(studentMap);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowStudentModal(true);
  };

  const handleStudentModalClose = () => {
    setShowStudentModal(false);
    setSelectedStudentId(null);
  };

  const handleStudentUpdated = () => {
    // Reload both families and students data to reflect any changes
    loadFamilies();
    loadStudents();
  };
  const filteredFamilies = families.filter(family => {
  const handleFamilyStatusChange = async (familyId: string, newStatus: string) => {
    // Reload families to reflect the status change
    await loadFamilies();
  };

    const searchLower = searchTerm.toLowerCase();
    return (
      family.familyName.toLowerCase().includes(searchLower) ||
      family.primaryContactName.toLowerCase().includes(searchLower) ||
      family.primaryContactEmail.toLowerCase().includes(searchLower) ||
      (family.secondaryContactName && family.secondaryContactName.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading || studentsLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900">Families</h2>
          <p className="text-gray-600">Manage family profiles and contact information</p>
        </div>
        <button
          onClick={() => {
            setEditingFamily(null);
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Family</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search families by name or contact information..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Families Grid */}
      <div className="grid gap-6">
        {filteredFamilies.map((family) => (
          <div key={family.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{family.familyName} Family</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-600">{family.students.length} student(s)</p>
                      <StatusDropdown
                        entityType="family"
                        entityId={family.id}
                        currentStatus={(family.status as FamilyStatus) || 'active'}
                        onStatusChange={(newStatus) => handleFamilyStatusChange(family.id, newStatus)}
                        size="sm"
                      />
                      <button
                        onClick={() => setShowStatusHistory(
                          showStatusHistory === family.id ? null : family.id
                        )}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        {showStatusHistory === family.id ? 'Hide History' : 'Status History'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Primary Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <span className="text-sm text-gray-600">{family.primaryContactName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${family.primaryContactEmail}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {family.primaryContactEmail}
                      </a>
                    </div>
                    {family.primaryContactPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${family.primaryContactPhone}`}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          {family.primaryContactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary Contact */}
                {(family.secondaryContactName || family.secondaryContactEmail || family.secondaryContactPhone) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Secondary Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {family.secondaryContactName && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Name:</span>
                          <span className="text-sm text-gray-600">{family.secondaryContactName}</span>
                        </div>
                      )}
                      {family.secondaryContactEmail && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a
                            href={`mailto:${family.secondaryContactEmail}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            {family.secondaryContactEmail}
                          </a>
                        </div>
                      )}
                      {family.secondaryContactPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a
                            href={`tel:${family.secondaryContactPhone}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            {family.secondaryContactPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Address */}
                {family.address && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Address</h4>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <div>{family.address.street}</div>
                        <div>{family.address.city}, {family.address.state} {family.address.zipCode}</div>
                      </div>
                    </div>
                  </div>
                )}

                 {/* Students */}
                 {family.students.length > 0 && (
                   <div className="mb-4">
                     <h4 className="text-sm font-medium text-gray-900 mb-2">Students</h4>
                     <div className="flex flex-wrap gap-2">
                       {family.students.map((studentId, index) => {
                         const student = students[studentId];
                         return student ? (
                           <button
                             key={index}
                             onClick={() => handleStudentClick(student.id)}
                             className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
                           >
                             {student.firstName} {student.lastName}
                           </button>
                         ) : (
                           <span
                             key={index}
                             className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                           >
                             Student ID: {studentId.slice(-6)}
                           </span>
                         );
                       })}
                     </div>
                   </div>
                 )}

                {/* Notes */}
                {family.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{family.notes}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Created: {formatDate(family.createdAt)}
                </div>

                {/* Status History */}
                {showStatusHistory === family.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <StatusHistory
                      entityType="family"
                      entityId={family.id}
                      maxEntries={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingFamily(family);
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

      {filteredFamilies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No families found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first family.'
            }
          </p>
          <button
            onClick={() => {
              setEditingFamily(null);
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Add First Family</span>
          </button>
        </div>
      )}
      
      {/* Family Modal */}
      {showModal && (
        <FamilyModal
          family={editingFamily || undefined}
          onClose={() => setShowModal(false)}
          onSaved={loadFamilies}
        />
      )}
      
      {/* Student View Modal */}
      {showStudentModal && selectedStudentId && (
        <StudentViewModal
          studentId={selectedStudentId}
          onClose={handleStudentModalClose}
          onStudentUpdated={handleStudentUpdated}
        />
      )}
    </div>
  );
};

export default FamiliesTab;
