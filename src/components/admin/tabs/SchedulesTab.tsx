import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Clock, MapPin, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Schedule } from '../../../types/admin';
import { Teacher } from '../../../types/admin';
import { Offering } from '../../../types/program';
import { Student } from '../../../types/program';
import { scheduleService } from '../../../services/adminService';
import { teacherService } from '../../../services/adminService';
import { offeringService, studentService } from '../../../services/programService';
import ScheduleModal from '../modals/ScheduleModal';
import StudentScheduleModal from '../modals/StudentScheduleModal';

const SchedulesTab = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [schedulesData, teachersData, offeringsData, studentsData] = await Promise.all([
        scheduleService.getSchedules(),
        teacherService.getTeachers(),
        offeringService.getOfferings(),
        studentService.getStudents()
      ]);
      setSchedules(schedulesData);
      setTeachers(teachersData);
      setOfferings(offeringsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase();
    const teacher = teachers.find(t => t.id === schedule.teacherId);
    const offering = offerings.find(o => o.id === schedule.offeringId);
    
    return (
      schedule.location.toLowerCase().includes(searchLower) ||
      (teacher && `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchLower)) ||
      (offering && offering.className.toLowerCase().includes(searchLower))
    );
  });

  const getTeacher = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  const getOffering = (offeringId: string) => {
    return offerings.find(o => o.id === offeringId);
  };

  const getEnrolledStudents = (scheduleId: string) => {
    // In a real implementation, you'd have a junction table for schedule-student relationships
    // For now, we'll simulate this based on offering enrollments
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return [];
    
    return students.filter(student => 
      student.enrolledOfferings.includes(schedule.offeringId)
    );
  };

  const toggleScheduleExpansion = (scheduleId: string) => {
    const newExpanded = new Set(expandedSchedules);
    if (newExpanded.has(scheduleId)) {
      newExpanded.delete(scheduleId);
    } else {
      newExpanded.add(scheduleId);
    }
    setExpandedSchedules(newExpanded);
  };

  const handleManageStudents = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setShowStudentModal(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
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
          <h2 className="text-2xl font-bold text-gray-900">Schedules</h2>
          <p className="text-gray-600">Manage class schedules and student assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingSchedule(null);
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Schedule</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search schedules by location, teacher, or class name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Schedules Grid */}
      <div className="grid gap-6">
        {filteredSchedules.map((schedule) => {
          const teacher = getTeacher(schedule.teacherId);
          const offering = getOffering(schedule.offeringId);
          const enrolledStudents = getEnrolledStudents(schedule.id);
          const isExpanded = expandedSchedules.has(schedule.id);
          
          return (
            <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {offering?.className || 'Unknown Class'} - {getDayName(schedule.dayOfWeek)}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Location</div>
                        <div className="text-sm text-gray-600">{schedule.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Instructor</div>
                        <div className="text-sm text-gray-600">
                          {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Enrollment</div>
                        <div className="text-sm text-gray-600">
                          {enrolledStudents.length}
                          {schedule.maxStudents && ` / ${schedule.maxStudents}`} students
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Duration</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-3 mb-4">
                    <button
                      onClick={() => handleManageStudents(schedule.id)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Manage Students ({enrolledStudents.length})
                    </button>
                    <button
                      onClick={() => toggleScheduleExpansion(schedule.id)}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 pt-4 space-y-4">
                      {/* Schedule Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Schedule Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Recurring Weeks:</span>
                            <span className="ml-2 text-gray-600">{schedule.recurringWeeks}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Class ID:</span>
                            <span className="ml-2 text-gray-600">{schedule.offeringId.slice(-8)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Created:</span>
                            <span className="ml-2 text-gray-600">{formatDate(schedule.createdAt)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Last Updated:</span>
                            <span className="ml-2 text-gray-600">{formatDate(schedule.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Enrolled Students */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Enrolled Students</h4>
                          <button
                            onClick={() => handleManageStudents(schedule.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Add/Remove Students
                          </button>
                        </div>
                        {enrolledStudents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {enrolledStudents.map((student) => (
                              <div key={student.id} className="flex items-center space-x-3 bg-white rounded-lg p-3">
                                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 font-semibold text-sm">
                                    {student.firstName[0]}{student.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {student.grade && `Grade ${student.grade} • `}
                                    {student.instrument || 'No instrument specified'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No students enrolled yet</p>
                            <button
                              onClick={() => handleManageStudents(schedule.id)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Add Students
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingSchedule(schedule);
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
          );
        })}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Get started by creating your first class schedule.'
            }
          </p>
          <button
            onClick={() => {
              setEditingSchedule(null);
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Create First Schedule</span>
          </button>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <ScheduleModal
          schedule={editingSchedule || undefined}
          teachers={teachers}
          offerings={offerings}
          onClose={() => setShowModal(false)}
          onSaved={loadData}
        />
      )}

      {/* Student Schedule Modal */}
      {showStudentModal && selectedScheduleId && (
        <StudentScheduleModal
          scheduleId={selectedScheduleId}
          schedule={schedules.find(s => s.id === selectedScheduleId)!}
          students={students}
          enrolledStudents={getEnrolledStudents(selectedScheduleId)}
          onClose={() => setShowStudentModal(false)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
};

export default SchedulesTab;