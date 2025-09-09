import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Users, Clock, MapPin, X, Save } from 'lucide-react';
import { Program, Offering } from '../../../types/program';
import { Teacher } from '../../../types/admin';
import { programService, offeringService } from '../../../services/programService';
import { teacherService } from '../../../services/adminService';
import { formatDaysOfWeek, formatTime, calculateTotalSessions } from '../../../utils/calendarUtils';

const ProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'offerings'>('programs');
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());

  // Offering form state
  const [offeringForm, setOfferingForm] = useState({
    programId: '',
    className: '',
    term: '',
    teacherId: '',
    registrationFee: 0,
    materialsFee: 0,
    instructionalFee: 0,
    startDate: '',
    stopDate: '',
    daysOfWeek: [] as number[],
    startTime: '09:00',
    endTime: '10:00',
    deliveryMethod: 'onsite' as 'onsite' | 'virtual',
    maxStudents: 10,
    location: '',
    ageRange: '',
    prerequisites: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [programsData, offeringsData, teachersData] = await Promise.all([
        programService.getPrograms(),
        offeringService.getOfferings(),
        teacherService.getTeachers()
      ]);
      setPrograms(programsData);
      setOfferings(offeringsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetOfferingForm = () => {
    setOfferingForm({
      programId: '',
      className: '',
      term: '',
      teacherId: '',
      registrationFee: 0,
      materialsFee: 0,
      instructionalFee: 0,
      startDate: '',
      stopDate: '',
      daysOfWeek: [],
      startTime: '09:00',
      endTime: '10:00',
      deliveryMethod: 'onsite',
      maxStudents: 10,
      location: '',
      ageRange: '',
      prerequisites: '',
      description: '',
      isActive: true,
    });
  };

  const handleAddOffering = () => {
    resetOfferingForm();
    setEditingOffering(null);
    setShowOfferingModal(true);
  };

  const handleEditOffering = (offering: Offering) => {
    setOfferingForm({
      programId: offering.programId,
      className: offering.className,
      term: offering.term,
      teacherId: offering.teacherId,
      registrationFee: offering.registrationFee,
      materialsFee: offering.materialsFee,
      instructionalFee: offering.instructionalFee,
      startDate: offering.startDate.toISOString().split('T')[0],
      stopDate: offering.stopDate.toISOString().split('T')[0],
      daysOfWeek: offering.daysOfWeek,
      startTime: offering.startTime,
      endTime: offering.endTime,
      deliveryMethod: offering.deliveryMethod,
      maxStudents: offering.maxStudents,
      location: offering.location || '',
      ageRange: offering.ageRange || '',
      prerequisites: offering.prerequisites || '',
      description: offering.description || '',
      isActive: offering.isActive,
    });
    setEditingOffering(offering);
    setShowOfferingModal(true);
  };

  const handleSaveOffering = async () => {
    try {
      const offeringData = {
        ...offeringForm,
        startDate: new Date(offeringForm.startDate),
        stopDate: new Date(offeringForm.stopDate),
        location: offeringForm.deliveryMethod === 'onsite' ? offeringForm.location : undefined,
      };

      if (editingOffering) {
        await offeringService.updateOffering(editingOffering.id, offeringData);
      } else {
        await offeringService.createOffering(offeringData);
      }

      await loadData();
      setShowOfferingModal(false);
      resetOfferingForm();
      setEditingOffering(null);
    } catch (error) {
      console.error('Error saving offering:', error);
    }
  };

  const handleDeleteOffering = async (offeringId: string) => {
    if (confirm('Are you sure you want to delete this class offering?')) {
      try {
        await offeringService.deleteOffering(offeringId);
        await loadData();
      } catch (error) {
        console.error('Error deleting offering:', error);
      }
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const newDays = offeringForm.daysOfWeek.includes(day)
      ? offeringForm.daysOfWeek.filter(d => d !== day)
      : [...offeringForm.daysOfWeek, day].sort();
    setOfferingForm({ ...offeringForm, daysOfWeek: newDays });
  };

  const toggleProgramExpansion = (programId: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedPrograms(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getTeacher = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getSchedulePreview = () => {
    if (offeringForm.daysOfWeek.length === 0 || !offeringForm.startDate || !offeringForm.stopDate) {
      return 'Select days and dates to see schedule preview';
    }

    const mockOffering = {
      ...offeringForm,
      id: 'preview',
      startDate: new Date(offeringForm.startDate),
      stopDate: new Date(offeringForm.stopDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const totalSessions = calculateTotalSessions(mockOffering);
    const daysText = formatDaysOfWeek(offeringForm.daysOfWeek);
    const timeText = `${formatTime(offeringForm.startTime)} - ${formatTime(offeringForm.endTime)}`;

    return `${daysText} • ${timeText} • ${totalSessions} sessions total`;
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
          <h2 className="text-2xl font-bold text-gray-900">Programs & Classes</h2>
          <p className="text-gray-600">Manage educational programs and class offerings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('programs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'programs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Programs ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('offerings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offerings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Class Offerings ({offerings.length})
          </button>
        </nav>
      </div>

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Programs</h3>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Program</span>
            </button>
          </div>

          <div className="grid gap-6">
            {programs.map((program) => {
              const programOfferings = offerings.filter(o => o.programId === program.id);
              const isExpanded = expandedPrograms.has(program.id);

              return (
                <div key={program.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{program.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          program.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {program.category.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{program.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {programOfferings.length} class offering{programOfferings.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => toggleProgramExpansion(program.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {isExpanded ? 'Hide Classes' : 'Show Classes'}
                        </button>
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

                  {/* Program's Class Offerings */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium text-gray-900">Class Offerings</h5>
                        <button
                          onClick={handleAddOffering}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 text-sm"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Class</span>
                        </button>
                      </div>
                      
                      {programOfferings.length > 0 ? (
                        <div className="space-y-3">
                          {programOfferings.map((offering) => {
                            const teacher = getTeacher(offering.teacherId);
                            const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
                            
                            return (
                              <div key={offering.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h6 className="font-medium text-gray-900">{offering.className}</h6>
                                      <span className="text-sm text-gray-600">{offering.term}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        offering.isActive 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {offering.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <span className="text-gray-600">
                                          {formatDate(offering.startDate)} - {formatDate(offering.stopDate)}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        <span className="text-gray-600">
                                          {formatDaysOfWeek(offering.daysOfWeek)} • {formatTime(offering.startTime)} - {formatTime(offering.endTime)}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Users className="h-3 w-3 text-gray-400" />
                                        <span className="text-gray-600">
                                          {offering.currentEnrollment || 0} / {offering.maxStudents} students
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <DollarSign className="h-3 w-3 text-gray-400" />
                                        <span className="text-gray-600">{formatCurrency(totalFees)}</span>
                                      </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Teacher:</span> {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}
                                      {offering.deliveryMethod === 'virtual' ? (
                                        <span className="ml-4"><span className="font-medium">Delivery:</span> Virtual</span>
                                      ) : (
                                        offering.location && <span className="ml-4"><span className="font-medium">Location:</span> {offering.location}</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditOffering(offering)}
                                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                                      title="Edit offering"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteOffering(offering.id)}
                                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                                      title="Delete offering"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No class offerings for this program yet.</p>
                          <button
                            onClick={handleAddOffering}
                            className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            Add the first class offering
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Class Offerings Tab */}
      {activeTab === 'offerings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Class Offerings</h3>
            <button
              onClick={handleAddOffering}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Class Offering</span>
            </button>
          </div>

          <div className="grid gap-6">
            {offerings.map((offering) => {
              const program = programs.find(p => p.id === offering.programId);
              const teacher = getTeacher(offering.teacherId);
              const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
              const totalSessions = calculateTotalSessions(offering);
              
              return (
                <div key={offering.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{offering.className}</h4>
                        <span className="text-sm text-gray-600">{program?.name} • {offering.term}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          offering.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {offering.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {offering.description && (
                        <p className="text-gray-600 mb-3">{offering.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Duration</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(offering.startDate)} - {formatDate(offering.stopDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Schedule</div>
                            <div className="text-sm text-gray-600">
                              {formatDaysOfWeek(offering.daysOfWeek)} • {formatTime(offering.startTime)} - {formatTime(offering.endTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Capacity</div>
                            <div className="text-sm text-gray-600">
                              {offering.currentEnrollment || 0} / {offering.maxStudents} students
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Total Fees</div>
                            <div className="text-sm text-gray-600">{formatCurrency(totalFees)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Registration:</span>
                          <span className="ml-1 text-gray-600">{formatCurrency(offering.registrationFee)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Materials:</span>
                          <span className="ml-1 text-gray-600">{formatCurrency(offering.materialsFee)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Instruction:</span>
                          <span className="ml-1 text-gray-600">{formatCurrency(offering.instructionalFee)}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-900">Instructor:</span>
                            <span className="ml-1">{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Location:</span>
                            <span className="ml-1">
                              {offering.deliveryMethod === 'virtual' ? 'Virtual' : offering.location || 'On Site'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Total Sessions:</span>
                            <span className="ml-1">{totalSessions}</span>
                          </div>
                          {offering.ageRange && (
                            <div>
                              <span className="font-medium text-gray-900">Age Range:</span>
                              <span className="ml-1">{offering.ageRange}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditOffering(offering)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                        title="Edit offering"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffering(offering.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete offering"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Offering Modal */}
      {showOfferingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingOffering ? 'Edit Class Offering' : 'Add Class Offering'}
              </h3>
              <button
                onClick={() => setShowOfferingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                    <select
                      value={offeringForm.programId}
                      onChange={(e) => setOfferingForm({ ...offeringForm, programId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a program</option>
                      {programs.filter(p => p.isActive).map(program => (
                        <option key={program.id} value={program.id}>{program.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                    <input
                      type="text"
                      value={offeringForm.className}
                      onChange={(e) => setOfferingForm({ ...offeringForm, className: e.target.value })}
                      required
                      placeholder="e.g., Beginner Piano, Advanced Band"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
                    <input
                      type="text"
                      value={offeringForm.term}
                      onChange={(e) => setOfferingForm({ ...offeringForm, term: e.target.value })}
                      required
                      placeholder="e.g., Fall 2024, Spring 2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teacher *</label>
                    <select
                      value={offeringForm.teacherId}
                      onChange={(e) => setOfferingForm({ ...offeringForm, teacherId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.filter(t => t.isActive).map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName} 
                          {teacher.specialties.length > 0 && ` (${teacher.specialties.join(', ')})`}
                          {teacher.hourlyRate && ` - $${teacher.hourlyRate}/hr`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-4">Schedule Configuration</h4>
                
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={offeringForm.startDate}
                      onChange={(e) => setOfferingForm({ ...offeringForm, startDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={offeringForm.stopDate}
                      onChange={(e) => setOfferingForm({ ...offeringForm, stopDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Days of Week Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Class Days *</label>
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDayOfWeek(index)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          offeringForm.daysOfWeek.includes(index)
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={offeringForm.startTime}
                      onChange={(e) => setOfferingForm({ ...offeringForm, startTime: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input
                      type="time"
                      value={offeringForm.endTime}
                      onChange={(e) => setOfferingForm({ ...offeringForm, endTime: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Schedule Preview */}
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Schedule Preview:</span>
                    <span className="ml-2 text-gray-600">{getSchedulePreview()}</span>
                  </div>
                </div>
              </div>

              {/* Location & Delivery */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-4">Location & Delivery</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method *</label>
                    <select
                      value={offeringForm.deliveryMethod}
                      onChange={(e) => setOfferingForm({ ...offeringForm, deliveryMethod: e.target.value as 'onsite' | 'virtual' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="onsite">On Site</option>
                      <option value="virtual">Virtual</option>
                    </select>
                  </div>
                  {offeringForm.deliveryMethod === 'onsite' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={offeringForm.location}
                        onChange={(e) => setOfferingForm({ ...offeringForm, location: e.target.value })}
                        placeholder="e.g., Music Room A, Studio 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Students *</label>
                    <input
                      type="number"
                      value={offeringForm.maxStudents}
                      onChange={(e) => setOfferingForm({ ...offeringForm, maxStudents: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="50"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-4">Pricing Structure</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee</label>
                    <input
                      type="number"
                      value={offeringForm.registrationFee}
                      onChange={(e) => setOfferingForm({ ...offeringForm, registrationFee: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materials Fee</label>
                    <input
                      type="number"
                      value={offeringForm.materialsFee}
                      onChange={(e) => setOfferingForm({ ...offeringForm, materialsFee: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructional Fee</label>
                    <input
                      type="number"
                      value={offeringForm.instructionalFee}
                      onChange={(e) => setOfferingForm({ ...offeringForm, instructionalFee: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-900">Total Fees:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(offeringForm.registrationFee + offeringForm.materialsFee + offeringForm.instructionalFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                    <input
                      type="text"
                      value={offeringForm.ageRange}
                      onChange={(e) => setOfferingForm({ ...offeringForm, ageRange: e.target.value })}
                      placeholder="e.g., 6-12 years, All ages"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                    <input
                      type="text"
                      value={offeringForm.prerequisites}
                      onChange={(e) => setOfferingForm({ ...offeringForm, prerequisites: e.target.value })}
                      placeholder="e.g., Basic music reading, None"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={offeringForm.description}
                    onChange={(e) => setOfferingForm({ ...offeringForm, description: e.target.value })}
                    rows={3}
                    placeholder="Describe what students will learn in this class..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="offering-active"
                    checked={offeringForm.isActive}
                    onChange={(e) => setOfferingForm({ ...offeringForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="offering-active" className="text-sm font-medium text-gray-700">
                    Active (available for enrollment)
                  </label>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-900 mb-3">Schedule Preview</h4>
                <div className="text-sm text-indigo-800">
                  {getSchedulePreview()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowOfferingModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOffering}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingOffering ? 'Update Offering' : 'Create Offering'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsTab;