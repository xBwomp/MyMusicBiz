import React, { useState, useEffect } from 'react';
import { X, Edit, Save, Ambulance as Cancel, Mail, Phone, Calendar, User, BookOpen } from 'lucide-react';
import { Student } from '../../../types/program';
import { Family } from '../../../types/admin';
import { studentService } from '../../../services/programService';
import { familyService } from '../../../services/adminService';

interface StudentViewModalProps {
  studentId: string;
  onClose: () => void;
  onStudentUpdated: () => void;
}

const StudentViewModal: React.FC<StudentViewModalProps> = ({ 
  studentId, 
  onClose, 
  onStudentUpdated 
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    familyId: '',
    dateOfBirth: '',
    grade: '',
    instrument: '',
    skillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    notes: '',
  });

  useEffect(() => {
    loadStudentData();
    loadFamilies();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all students and find the one we need
      const students = await studentService.getStudents();
      const foundStudent = students.find(s => s.id === studentId);
      
      if (!foundStudent) {
        setError('Student not found');
        return;
      }

      setStudent(foundStudent);
      
      // Initialize edit form with student data
      setEditForm({
        firstName: foundStudent.firstName,
        lastName: foundStudent.lastName,
        email: foundStudent.email,
        phone: foundStudent.phone || '',
        familyId: foundStudent.familyId || '',
        dateOfBirth: foundStudent.dateOfBirth 
          ? foundStudent.dateOfBirth.toISOString().split('T')[0] 
          : '',
        grade: foundStudent.grade || '',
        instrument: foundStudent.instrument || '',
        skillLevel: foundStudent.skillLevel || 'beginner',
        notes: foundStudent.notes || '',
      });
    } catch (error) {
      console.error('Error loading student:', error);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const loadFamilies = async () => {
    try {
      const familiesData = await familyService.getFamilies();
      setFamilies(familiesData);
    } catch (error) {
      console.error('Error loading families:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form to original student data
    if (student) {
      setEditForm({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone || '',
        familyId: student.familyId || '',
        dateOfBirth: student.dateOfBirth 
          ? student.dateOfBirth.toISOString().split('T')[0] 
          : '',
        grade: student.grade || '',
        instrument: student.instrument || '',
        skillLevel: student.skillLevel || 'beginner',
        notes: student.notes || '',
      });
    }
  };

  const handleSave = async () => {
    if (!student) return;

    setSaving(true);
    setError(null);

    try {
      // Prepare update data
      const updateData: Partial<Student> = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone || undefined,
        familyId: editForm.familyId || undefined,
        dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth) : undefined,
        grade: editForm.grade || undefined,
        instrument: editForm.instrument || undefined,
        skillLevel: editForm.skillLevel,
        notes: editForm.notes || undefined,
      };

      // Update student
      await studentService.updateStudent(student.id, updateData);

      // Handle family association changes
      if (student.familyId !== editForm.familyId) {
        // Remove from old family
        if (student.familyId) {
          const oldFamily = families.find(f => f.id === student.familyId);
          if (oldFamily) {
            await familyService.updateFamily(student.familyId, {
              students: oldFamily.students.filter(id => id !== student.id),
            });
          }
        }

        // Add to new family
        if (editForm.familyId) {
          const newFamily = families.find(f => f.id === editForm.familyId);
          if (newFamily) {
            await familyService.updateFamily(editForm.familyId, {
              students: [...newFamily.students, student.id],
            });
          }
        }
      }

      // Reload student data to reflect changes
      await loadStudentData();
      setEditing(false);
      onStudentUpdated();
    } catch (error) {
      console.error('Error updating student:', error);
      setError('Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getAssociatedFamily = () => {
    return families.find(f => f.id === student?.familyId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-600">Error</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{error || 'Student not found'}</p>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const associatedFamily = getAssociatedFamily();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {editing ? 'Edit Student' : 'Student Details'}
              </h3>
              <p className="text-sm text-gray-600">
                {editing ? 'Update student information' : 'View student profile'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!editing && (
              <button
                onClick={handleEdit}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {editing ? (
            /* Edit Form */
            <form className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Family Association */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Family Association</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family
                  </label>
                  <select
                    value={editForm.familyId}
                    onChange={(e) => setEditForm({ ...editForm, familyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">No family association</option>
                    {families.map(family => (
                      <option key={family.id} value={family.id}>
                        {family.familyName} Family
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Student Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <input
                      type="text"
                      value={editForm.grade}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      placeholder="e.g., 5th, 10th, K"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Instrument
                    </label>
                    <input
                      type="text"
                      value={editForm.instrument}
                      onChange={(e) => setEditForm({ ...editForm, instrument: e.target.value })}
                      placeholder="e.g., Piano, Guitar, Voice"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Level
                    </label>
                    <select
                      value={editForm.skillLevel}
                      onChange={(e) => setEditForm({ ...editForm, skillLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about the student..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Cancel className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Name:</span>
                      <span className="text-sm text-gray-600">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Email:</span>
                      <a
                        href={`mailto:${student.email}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {student.email}
                      </a>
                    </div>
                    {student.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">Phone:</span>
                        <a
                          href={`tel:${student.phone}`}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          {student.phone}
                        </a>
                      </div>
                    )}
                    {student.dateOfBirth && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">Age:</span>
                        <span className="text-sm text-gray-600">
                          {calculateAge(student.dateOfBirth)} years old
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Association */}
              {associatedFamily && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Family Association</h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{associatedFamily.familyName} Family</p>
                        <p className="text-sm text-gray-600">
                          Primary Contact: {associatedFamily.primaryContactName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Email: {associatedFamily.primaryContactEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Student Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.grade && (
                      <div>
                        <span className="text-sm font-medium text-gray-900">Grade:</span>
                        <span className="ml-2 text-sm text-gray-600">{student.grade}</span>
                      </div>
                    )}
                    {student.instrument && (
                      <div>
                        <span className="text-sm font-medium text-gray-900">Primary Instrument:</span>
                        <span className="ml-2 text-sm text-gray-600">{student.instrument}</span>
                      </div>
                    )}
                    {student.skillLevel && (
                      <div>
                        <span className="text-sm font-medium text-gray-900">Skill Level:</span>
                        <span className="ml-2 text-sm text-gray-600 capitalize">{student.skillLevel}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-900">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        student.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Classes */}
              {student.enrolledOfferings.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Enrolled Classes</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {student.enrolledOfferings.length} Active Enrollment{student.enrolledOfferings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {student.enrolledOfferings.map((offeringId, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          Class ID: {offeringId.slice(-6)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {student.notes && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{student.notes}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Record Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-900">Created:</span>
                      <span className="ml-2">{formatDate(student.createdAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Last Updated:</span>
                      <span className="ml-2">{formatDate(student.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentViewModal;