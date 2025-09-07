import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Minus, Search, User, Mail } from 'lucide-react';
import { Schedule } from '../../../types/admin';
import { Student } from '../../../types/program';
import { studentService } from '../../../services/programService';

interface StudentScheduleModalProps {
  scheduleId: string;
  schedule: Schedule;
  students: Student[];
  enrolledStudents: Student[];
  onClose: () => void;
  onUpdated: () => void;
}

const StudentScheduleModal: React.FC<StudentScheduleModalProps> = ({
  scheduleId,
  schedule,
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

  const availableStudents = students.filter(student => 
    student.isActive && 
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
      if (schedule.maxStudents && newSelected.size >= schedule.maxStudents) {
        alert(`Maximum capacity of ${schedule.maxStudents} students reached`);
        return;
      }
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each student's enrolled offerings
      const currentlyEnrolled = new Set(enrolledStudents.map(s => s.id));
      const newlySelected = new Set(selectedStudents);

      // Students to add to the schedule
      const studentsToAdd = Array.from(newlySelected).filter(id => !currentlyEnrolled.has(id));
      
      // Students to remove from the schedule
      const studentsToRemove = Array.from(currentlyEnrolled).filter(id => !newlySelected.has(id));

      // Add students to offering
      for (const studentId of studentsToAdd) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const updatedOfferings = [...student.enrolledOfferings];
          if (!updatedOfferings.includes(schedule.offeringId)) {
            updatedOfferings.push(schedule.offeringId);
            await studentService.updateStudent(studentId, {
              enrolledOfferings: updatedOfferings
            });
          }
        }
      }

      // Remove students from offering
      for (const studentId of studentsToRemove) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const updatedOfferings = student.enrolledOfferings.filter(id => id !== schedule.offeringId);
          await studentService.updateStudent(studentId, {
            enrolledOfferings: updatedOfferings
          });
        }
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating student enrollments:', error);
    } finally {
      setSaving(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Students</h3>
            <p className="text-sm text-gray-600">
              {getDayName(schedule.dayOfWeek)} • {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} • {schedule.location}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Current Enrollment Status */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Current Enrollment</h4>
                <span className="text-sm text-blue-700">
                  {selectedStudents.size}
                  {schedule.maxStudents && ` / ${schedule.maxStudents}`} students
                </span>
              </div>
              {schedule.maxStudents && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((selectedStudents.size / schedule.maxStudents) * 100, 100)}%` }}
                  />
                </div>
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
                  const isAtCapacity = schedule.maxStudents && selectedStudents.size >= schedule.maxStudents && !isSelected;
                  
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
                              ? 'Remove from schedule' 
                              : isAtCapacity
                              ? 'Class is at capacity'
                              : 'Add to schedule'
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
                    const student = students.find(s => s.id === studentId);
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
            {schedule.maxStudents && ` (${schedule.maxStudents - selectedStudents.size} spots remaining)`}
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