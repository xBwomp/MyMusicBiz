import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Clock, MapPin, User, Users, ChevronDown, ChevronUp, View } from 'lucide-react';
import { Teacher } from '../../../types/admin';
import { Offering, Student } from '../../../types/program';
import { teacherService } from '../../../services/adminService';
import { offeringService, studentService } from '../../../services/programService';
import StudentScheduleModal from '../modals/StudentScheduleModal';
import ScheduleCalendar from '../ScheduleCalendar';
import { generateCalendarEvents } from '../../../utils/calendarUtils';
import { EventClickArg } from '@fullcalendar/core';

const SchedulesTab = () => {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);
  const [expandedOfferings, setExpandedOfferings] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [offeringsData, teachersData, studentsData] = await Promise.all([
        offeringService.getOfferings(),
        teacherService.getTeachers(),
        studentService.getStudents()
      ]);
      setOfferings(offeringsData);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfferings = offerings.filter(offering => {
    const searchLower = searchTerm.toLowerCase();
    const teacher = getTeacher(offering.teacherId);
    
    return (
      offering.className.toLowerCase().includes(searchLower) ||
      (offering.location && offering.location.toLowerCase().includes(searchLower)) ||
      (teacher && `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchLower)) ||
      offering.term.toLowerCase().includes(searchLower)
    );
  });

  const getTeacher = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  const getEnrolledStudents = (offeringId: string) => {
    return students.filter(student => 
      student.enrolledOfferings.includes(offeringId)
    );
  };

  const toggleOfferingExpansion = (offeringId: string) => {
    const newExpanded = new Set(expandedOfferings);
    if (newExpanded.has(offeringId)) {
      newExpanded.delete(offeringId);
    } else {
      newExpanded.add(offeringId);
    }
    setExpandedOfferings(newExpanded);
  };

  const calendarEvents = useMemo(() => {
    const events = [];
    for (const offering of offerings) {
      if (offering.isActive) {
        events.push(...generateCalendarEvents(offering));
      }
    }
    return events;
  }, [offerings]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const offeringId = clickInfo.event.extendedProps.offering.id;
    setSelectedOfferingId(offeringId);
    setShowStudentModal(true);
  };

  const handleManageStudents = (offeringId: string) => {
    setSelectedOfferingId(offeringId);
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

  const formatDaysOfWeek = (daysOfWeek: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek
      .sort((a, b) => a - b)
      .map(day => dayNames[day])
      .join(', ');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Schedules</h2>
          <p className="text-gray-600">View and manage class schedules and student enrollments</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
          >
            <View className="h-4 w-4" />
            <span>{viewMode === 'list' ? 'Calendar View' : 'List View'}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes by name, location, teacher, or term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <ScheduleCalendar events={calendarEvents} onEventClick={handleEventClick} />
      ) : (
        <div className="grid gap-6">
          {filteredOfferings.map((offering) => {
            const teacher = getTeacher(offering.teacherId);
            const enrolledStudents = getEnrolledStudents(offering.id);
            const isExpanded = expandedOfferings.has(offering.id);
            const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
            const spotsAvailable = offering.maxStudents - enrolledStudents.length;
            
            return (
              <div key={offering.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {offering.className}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{offering.term}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDaysOfWeek(offering.daysOfWeek)} • {formatTime(offering.startTime)} - {formatTime(offering.endTime)}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            offering.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {offering.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Location</div>
                          <div className="text-sm text-gray-600">
                            {offering.deliveryMethod === 'virtual' ? 'Virtual' : offering.location || 'On Site'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Instructor</div>
                          <div className="text-sm text-gray-600">
                            {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Enrollment</div>
                          <div className="text-sm text-gray-600">
                            {enrolledStudents.length} / {offering.maxStudents} students
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Duration</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(offering.startDate)} - {formatDate(offering.stopDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enrollment Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Class Capacity</span>
                        <span className="text-sm text-gray-600">
                          {spotsAvailable} spot{spotsAvailable !== 1 ? 's' : ''} available
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            enrolledStudents.length >= offering.maxStudents ? 'bg-red-500' :
                            enrolledStudents.length >= offering.maxStudents * 0.8 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((enrolledStudents.length / offering.maxStudents) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-3 mb-4">
                      <button
                        onClick={() => handleManageStudents(offering.id)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                      >
                        Manage Students ({enrolledStudents.length})
                      </button>
                      <button
                        onClick={() => toggleOfferingExpansion(offering.id)}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 pt-4 space-y-4">
                        {/* Class Details */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Class Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Total Fees:</span>
                              <span className="ml-2 text-gray-600">{formatCurrency(totalFees)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Registration:</span>
                              <span className="ml-2 text-gray-600">{formatCurrency(offering.registrationFee)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Materials:</span>
                              <span className="ml-2 text-gray-600">{formatCurrency(offering.materialsFee)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Instruction:</span>
                              <span className="ml-2 text-gray-600">{formatCurrency(offering.instructionalFee)}</span>
                            </div>
                            {offering.ageRange && (
                              <div>
                                <span className="font-medium text-gray-900">Age Range:</span>
                                <span className="ml-2 text-gray-600">{offering.ageRange}</span>
                              </div>
                            )}
                            {offering.prerequisites && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-gray-900">Prerequisites:</span>
                                <span className="ml-2 text-gray-600">{offering.prerequisites}</span>
                              </div>
                            )}
                          </div>
                          {offering.description && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="font-medium text-gray-900">Description:</span>
                              <p className="text-gray-600 mt-1">{offering.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Enrolled Students */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Enrolled Students</h4>
                            <button
                              onClick={() => handleManageStudents(offering.id)}
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
                                onClick={() => handleManageStudents(offering.id)}
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredOfferings.length === 0 && viewMode === 'list' && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No class schedules found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Create class offerings in the Programs tab to see schedules here.'
            }
          </p>
          <button
            onClick={() => window.location.href = '/admin?tab=programs'}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Go to Programs
          </button>
        </div>
      )}

      {/* Student Schedule Modal */}
      {showStudentModal && selectedOfferingId && (
        <StudentScheduleModal
          offeringId={selectedOfferingId}
          offering={offerings.find(o => o.id === selectedOfferingId)!}
          students={students}
          enrolledStudents={getEnrolledStudents(selectedOfferingId)}
          onClose={() => setShowStudentModal(false)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
};

export default SchedulesTab;