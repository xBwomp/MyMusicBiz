import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Schedule } from '../../../types/admin';
import { scheduleService } from '../../../services/adminService';

const SchedulesTab = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const schedulesData = await scheduleService.getSchedules();
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase();
    return (
      schedule.location.toLowerCase().includes(searchLower) ||
      schedule.offeringId.toLowerCase().includes(searchLower)
    );
  });

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
          <p className="text-gray-600">Manage class schedules and time slots</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search schedules by location or offering..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Schedules Grid */}
      <div className="grid gap-6">
        {filteredSchedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {getDayName(schedule.dayOfWeek)} Schedule
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{schedule.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Teacher ID: {schedule.teacherId.slice(-6)}</span>
                  </div>
                  {schedule.maxStudents && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Max Students:</span>
                      <span className="text-sm text-gray-600">{schedule.maxStudents}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Start Date:</span>
                    <span className="ml-2 text-sm text-gray-600">{formatDate(schedule.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">End Date:</span>
                    <span className="ml-2 text-sm text-gray-600">{formatDate(schedule.endDate)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Recurring Weeks:</span>
                    <span className="ml-2 text-sm text-gray-600">{schedule.recurringWeeks}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Offering ID:</span>
                    <span className="ml-2 text-sm text-gray-600">{schedule.offeringId.slice(-6)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created: {formatDate(schedule.createdAt)}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200">
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
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>Create First Schedule</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;