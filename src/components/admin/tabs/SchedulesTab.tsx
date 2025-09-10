import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Clock, MapPin, User, Users, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Teacher } from '../../../types/admin';
import { Offering, Student } from '../../../types/program';
import { teacherService } from '../../../services/adminService';
import { offeringService, studentService } from '../../../services/programService';
import StudentScheduleModal from '../modals/StudentScheduleModal';
import ScheduleCalendar from '../ScheduleCalendar';
import { generateCalendarEvents, formatDaysOfWeek, formatTime } from '../../../utils/calendarUtils';
import { EventClickArg } from '@fullcalendar/core';

const SchedulesTab = () => {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);
  const [expandedOfferings, setExpandedOfferings] = useState<Set<string>>(new Set());
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
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
      setError('Failed to load schedule data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTeacher = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  const getEnrolledStudents = (offeringId: string) => {
    return students.filter(student => 
      student.enrolledOfferings.includes(offeringId)
    );
  };

  const filteredOfferings = useMemo(() => {
    return offerings.filter(offering => {
      const searchLower = searchTerm.toLowerCase();
      const teacher = getTeacher(offering.teacherId);
      
      const matchesSearch = offering.className.toLowerCase().includes(searchLower) ||
                           (offering.location && offering.location.toLowerCase().includes(searchLower)) ||
                           (teacher && `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchLower)) ||
                           offering.term.toLowerCase().includes(searchLower);
      
      const matchesTeacher = filterTeacher === 'all' || offering.teacherId === filterTeacher;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && offering.isActive) ||
                           (filterStatus === 'inactive' && !offering.isActive);
      
      return matchesSearch && matchesTeacher && matchesStatus;
    });
  }, [offerings, searchTerm, filterTeacher, filterStatus, teachers]);

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
    try {
      const events = [];
      for (const offering of filteredOfferings) {
        if (offering.isActive && offering.daysOfWeek && offering.daysOfWeek.length > 0) {
          events.push(...generateCalendarEvents(offering));
        }
      }
      return events;
    } catch (error) {
      console.error('Error generating calendar events:', error);
      return [];
    }
  }, [filteredOfferings]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Schedules</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Schedules</h2>
          <p className="text-gray-600">View class offerings and manage student enrollments</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{viewMode === 'list' ? 'Calendar View' : 'List View'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
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
          <div className="flex gap-4">
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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
            const utilizationPercentage = (enrolledStudents.length / offering.maxStudents) * 100;
            
            return (
              <div key={offering.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-indigo-600" />
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offering.isActive)}`}>
                            {offering.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Information Grid */}
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
                            {formatDate(new Date(offering.startDate))} - {formatDate(new Date(offering.stopDate))}
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
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            utilizationPercentage >= 100 ? 'bg-red-500' :
                            utilizationPercentage >= 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>{Math.round(utilizationPercentage)}% full</span>
                        <span>{offering.maxStudents}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-3 mb-4">
                      <button
                        onClick={() => handleManageStudents(offering.id)}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium flex items-center space-x-2"
                      >
                        <Users className="h-4 w-4" />
                        <span>Manage Students ({enrolledStudents.length})</span>
                      </button>
                      <button
                        onClick={() => toggleOfferingExpansion(offering.id)}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 pt-4 space-y-4">
                        {/* Pricing Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Pricing Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Registration:</span>
                              <div className="text-gray-600">{formatCurrency(offering.registrationFee)}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Materials:</span>
                              <div className="text-gray-600">{formatCurrency(offering.materialsFee)}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Instruction:</span>
                              <div className="text-gray-600">{formatCurrency(offering.instructionalFee)}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Total:</span>
                              <div className="text-gray-900 font-semibold">{formatCurrency(totalFees)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Class Information */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Class Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {offering.ageRange && (
                              <div>
                                <span className="font-medium text-gray-900">Age Range:</span>
                                <span className="ml-2 text-gray-600">{offering.ageRange}</span>
                              </div>
                            )}
                            {offering.prerequisites && (
                              <div>
                                <span className="font-medium text-gray-900">Prerequisites:</span>
                                <span className="ml-2 text-gray-600">{offering.prerequisites}</span>
                              </div>
                            )}
                            {teacher && (
                              <div>
                                <span className="font-medium text-gray-900">Teacher Specialties:</span>
                                <span className="ml-2 text-gray-600">{teacher.specialties.join(', ')}</span>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-900">Delivery Method:</span>
                              <span className="ml-2 text-gray-600 capitalize">{offering.deliveryMethod}</span>
                            </div>
                          </div>
                          {offering.description && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <span className="font-medium text-gray-900">Description:</span>
                              <p className="text-gray-600 mt-1">{offering.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Enrolled Students */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Enrolled Students ({enrolledStudents.length})</h4>
                            <button
                              onClick={() => handleManageStudents(offering.id)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Add/Remove Students
                            </button>
                          </div>
                          {enrolledStudents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                    <div className="text-xs text.ts-gray-500">
                                      {student.grade && `Grade ${student.grade}`}
                                      {student.grade && student.instrument && ' • '}
                                      {student.instrument}
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
                                className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
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
            {searchTerm || filterTeacher !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
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