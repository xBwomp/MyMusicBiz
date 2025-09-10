import React, { useState } from 'react';
import { X, Plus, Minus, Search, User, Mail } from 'lucide-react';
import { Offering, Student } from '../../../types/program';
import { studentService, offeringService } from '../../../services/programService';

interface StudentScheduleModalProps {
  offeringId: string;
  offering: Offering;
  students: Student[];
  enrolledStudents: Student[];
  onClose: () => void;
  onUpdated: () => void;
}

const StudentScheduleModal: React.FC<StudentScheduleModalProps> = ({
  offeringId,
  offering,
  students,
  enrolledStudents,
  onClose,
  onUpdated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(enrolledStudents.map(s => s.id))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a Map for fast student lookup
  const studentMap = React.useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.id, s));
    return map;
  }, [students]);

  const availableStudents = students.filter(student =>
    
    student.status?.toLowerCase() !== 'inactive' &&
    (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      // Check capacity limit
      if (newSelected.size >= offering.maxStudents) {
        alert(`Maximum capacity of ${offering.maxStudents} students reached`);
        return;
      }
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Enforce capacity limit strictly
      if (selectedStudents.size > offering.maxStudents) {
        setError(`Cannot save: selected students exceed class capacity (${offering.maxStudents}).`);
        setSaving(false);
        return;
      }
      // Update each student's enrolled offerings
      const currentlyEnrolled = new Set(enrolledStudents.map(s => s.id));
      const newlySelected = new Set(selectedStudents);

      // Students to add to the offering
      const studentsToAdd = Array.from(newlySelected).filter(id => !currentlyEnrolled.has(id));
      // Students to remove from the offering
      const studentsToRemove = Array.from(currentlyEnrolled).filter(id => !newlySelected.has(id));

      // Add students to offering
      for (const studentId of studentsToAdd) {
        const student = studentMap.get(studentId);
        if (student) {
          const updatedOfferings = [...student.enrolledOfferings];
          if (!updatedOfferings.includes(offeringId)) {
            updatedOfferings.push(offeringId);
            await studentService.updateStudent(studentId, {
              enrolledOfferings: updatedOfferings
            });
          }
        }
      }

      // Remove students from offering
      for (const studentId of studentsToRemove) {
        const student = studentMap.get(studentId);
        if (student) {
          const updatedOfferings = student.enrolledOfferings.filter(id => id !== offeringId);
          await studentService.updateStudent(studentId, {
            enrolledOfferings: updatedOfferings
          });
        }
      }

      // Update offering's current enrollment count
      await offeringService.updateOffering(offeringId, {
        currentEnrollment: selectedStudents.size
      });

      onUpdated();
      onClose();
    } catch (err) {
      setError('Error updating student enrollments. Please try again.');
      console.error('Error updating student enrollments:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDaysOfWeek = (daysOfWeek: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek
      .sort((a, b) => a - b)
      .map(day => dayNames[day])
      .join(', ');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-schedule-modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 id="student-schedule-modal-title" className="text-lg font-semibold text-gray-900">Manage Students</h3>
            <p className="text-sm text-gray-600">
              {offering.className} • {offering.term}
            </p>
            <p className="text-sm text-gray-500">
              {formatDaysOfWeek(offering.daysOfWeek)} • {formatTime(offering.startTime)} - {formatTime(offering.endTime)}
              {offering.deliveryMethod === 'virtual' ? ' • Virtual' : offering.location ? ` • ${offering.location}` : ' • On Site'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Error UI */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            {/* Current Enrollment Status */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Current Enrollment</h4>
                <span className="text-sm text-blue-700">
                  {selectedStudents.size} / {offering.maxStudents} students
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    selectedStudents.size >= offering.maxStudents ? 'bg-red-500' :
                    selectedStudents.size >= offering.maxStudents * 0.8 ? 'bg-yellow-500' :
                    'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min((selectedStudents.size / offering.maxStudents) * 100, 100)}%` }}
                />
              </div>
              {selectedStudents.size >= offering.maxStudents && (
                <p className="text-sm text-red-700 mt-2">⚠️ Class is at maximum capacity</p>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Students List */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Available Students</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableStudents.map((student) => {
                  const isSelected = selectedStudents.has(student.id);
                  const isAtCapacity = selectedStudents.size >= offering.maxStudents && !isSelected;
                  
                  return (
                    <div
                      key={student.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        isSelected 
                          ? 'border-indigo-300 bg-indigo-50' 
                          : isAtCapacity
                          ? 'border-gray-200 bg-gray-50 opacity-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{student.email}</span>
                              </div>
                              {student.grade && (
                                <span>Grade {student.grade}</span>
                              )}
                              {student.instrument && (
                                <span>{student.instrument}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleStudentToggle(student.id)}
                          disabled={isAtCapacity}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            isSelected
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : isAtCapacity
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={
                            isSelected 
                              ? 'Remove from class' 
                              : isAtCapacity
                              ? 'Class is at capacity'
                              : 'Add to class'
                          }
                        >
                          {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {availableStudents.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No students found matching your search.' : 'No active students available.'}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Students Summary */}
            {selectedStudents.size > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3">
                  Selected Students ({selectedStudents.size})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedStudents).map(studentId => {
                    const student = studentMap.get(studentId);
                    return student ? (
                      <span
                        key={studentId}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center space-x-2"
                      >
                        <span>{student.firstName} {student.lastName}</span>
                        <button
                          onClick={() => handleStudentToggle(studentId)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
            {` (${offering.maxStudents - selectedStudents.size} spots remaining)`}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentScheduleModal;