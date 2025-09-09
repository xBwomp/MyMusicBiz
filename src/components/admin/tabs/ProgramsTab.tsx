import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Users, Search, Clock, MapPin, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Program, Offering } from '../../../types/program';
import { Teacher } from '../../../types/admin';
import { programService, offeringService } from '../../../services/programService';
import { teacherService } from '../../../services/adminService';
import { formatDaysOfWeek, formatTime } from '../../../utils/calendarUtils';

const ProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const [programForm, setProgramForm] = useState<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    category: 'private-lessons',
    isActive: true,
  });

  const [offeringForm, setOfferingForm] = useState<Omit<Offering, 'id' | 'createdAt' | 'updatedAt'>>({
    programId: '',
    className: '',
    term: '',
    teacherId: '',
    registrationFee: 0,
    materialsFee: 0,
    instructionalFee: 0,
    startDate: new Date(),
    stopDate: new Date(),
    daysOfWeek: [],
    startTime: '09:00',
    endTime: '10:00',
    deliveryMethod: 'onsite',
    maxStudents: 10,
    currentEnrollment: 0,
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

  const offeringsByProgram = useMemo(() => {
    const map: Record<string, Offering[]> = {};
    for (const o of offerings) {
      (map[o.programId] ||= []).push(o);
    }
    return map;
  }, [offerings]);

  const filteredPrograms = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return programs.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(s) ||
                           program.description.toLowerCase().includes(s);
      const matchesCategory = filterCategory === 'all' || program.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [programs, searchTerm, filterCategory]);

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

  const toggleProgramExpansion = (programId: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedPrograms(newExpanded);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProgram) {
        await programService.updateProgram(editingProgram.id, programForm);
      } else {
        await programService.createProgram(programForm);
      }
      setIsProgramModalOpen(false);
      setEditingProgram(null);
      resetProgramForm();
      await loadData();
    } catch (error) {
      console.error('Error saving program:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetProgramForm = () => {
    setProgramForm({
      name: '',
      description: '',
      category: 'private-lessons',
      isActive: true,
    });
  };

  const openOfferingModal = (programId: string, offering?: Offering) => {
    if (offering) {
      const { id, createdAt, updatedAt, ...rest } = offering;
      void id; void createdAt; void updatedAt;
      setOfferingForm(rest);
      setEditingOffering(offering);
    } else {
      setOfferingForm({
        programId,
        className: '',
        term: '',
        teacherId: '',
        registrationFee: 0,
        materialsFee: 0,
        instructionalFee: 0,
        startDate: new Date(),
        stopDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        daysOfWeek: [],
        startTime: '09:00',
        endTime: '10:00',
        deliveryMethod: 'onsite',
        maxStudents: 10,
        currentEnrollment: 0,
        location: '',
        ageRange: '',
        prerequisites: '',
        description: '',
        isActive: true,
      });
      setEditingOffering(null);
    }
    setIsOfferingModalOpen(true);
  };

  const handleSaveOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingOffering) {
        await offeringService.updateOffering(editingOffering.id, offeringForm);
      } else {
        await offeringService.createOffering(offeringForm);
      }
      setIsOfferingModalOpen(false);
      setEditingOffering(null);
      await loadData();
    } catch (error) {
      console.error('Error saving offering:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const currentDays = [...offeringForm.daysOfWeek];
    const dayExists = currentDays.includes(dayIndex);
    
    if (dayExists) {
      setOfferingForm({
        ...offeringForm,
        daysOfWeek: currentDays.filter(d => d !== dayIndex)
      });
    } else {
      setOfferingForm({
        ...offeringForm,
        daysOfWeek: [...currentDays, dayIndex].sort()
      });
    }
  };

  const calculateWeeksBetweenDates = (startDate: Date, endDate: Date) => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
  };

  const calculateTotalSessions = () => {
    if (offeringForm.daysOfWeek.length === 0) return 0;
    const weeks = calculateWeeksBetweenDates(offeringForm.startDate, offeringForm.stopDate);
    return weeks * offeringForm.daysOfWeek.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Programs & Classes</h2>
            <p className="text-gray-600">Manage your music programs and create scheduled class offerings</p>
          </div>
          <button
            onClick={() => {
              setEditingProgram(null);
              resetProgramForm();
              setIsProgramModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Program</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="private-lessons">Private Lessons</option>
              <option value="homeschool">Homeschool</option>
              <option value="band">Band</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid gap-6">
          {filteredPrograms.map((program) => {
            const programOfferings = offeringsByProgram[program.id] || [];
            const activeOfferings = programOfferings.filter(o => o.isActive);
            const isExpanded = expandedPrograms.has(program.id);
            
            return (
              <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{program.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        program.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {program.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                        {program.category.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {programOfferings.length} class offering{programOfferings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {activeOfferings.length} active classe{activeOfferings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {programOfferings.length > 0 
                            ? `From ${formatCurrency(Math.min(...programOfferings.map(o => o.instructionalFee)))}`
                            : 'No pricing set'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleProgramExpansion(program.id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProgram(program);
                        setProgramForm({
                          name: program.name,
                          description: program.description,
                          category: program.category,
                          isActive: program.isActive,
                        });
                        setIsProgramModalOpen(true);
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

                {/* Class Offerings - Always show summary, expand for details */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Class Offerings ({programOfferings.length})
                    </h4>
                    <button
                      onClick={() => openOfferingModal(program.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Class</span>
                    </button>
                  </div>

                  {programOfferings.length > 0 ? (
                    <div className="space-y-3">
                      {/* Summary view - always visible */}
                      {!isExpanded && (
                        <div className="grid gap-2">
                          {programOfferings.slice(0, 2).map((offering) => {
                            const teacher = getTeacher(offering.teacherId);
                            const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
                            
                            return (
                              <div key={offering.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-gray-900">{offering.className}</h5>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <span>{offering.term}</span>
                                      <span>{formatDaysOfWeek(offering.daysOfWeek)}</span>
                                      <span>{formatTime(offering.startTime)} - {formatTime(offering.endTime)}</span>
                                      <span>{formatCurrency(totalFees)}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      offering.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {offering.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {offering.currentEnrollment || 0}/{offering.maxStudents}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {programOfferings.length > 2 && (
                            <div className="text-center">
                              <button
                                onClick={() => toggleProgramExpansion(program.id)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                Show {programOfferings.length - 2} more offerings
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Detailed view - when expanded */}
                      {isExpanded && (
                        <div className="grid gap-4">
                          {programOfferings.map((offering) => {
                            const teacher = getTeacher(offering.teacherId);
                            const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
                            const utilizationPercentage = ((offering.currentEnrollment || 0) / offering.maxStudents) * 100;
                            
                            return (
                              <div key={offering.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h5 className="text-lg font-medium text-gray-900">{offering.className}</h5>
                                      <span className="text-sm text-gray-500">• {offering.term}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        offering.isActive 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {offering.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>

                                    {/* Schedule Information */}
                                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                      <h6 className="text-sm font-medium text-blue-900 mb-2">Class Schedule</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center space-x-2">
                                          <Calendar className="h-4 w-4 text-blue-600" />
                                          <span className="text-blue-800">{formatDaysOfWeek(offering.daysOfWeek)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Clock className="h-4 w-4 text-blue-600" />
                                          <span className="text-blue-800">{formatTime(offering.startTime)} - {formatTime(offering.endTime)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <MapPin className="h-4 w-4 text-blue-600" />
                                          <span className="text-blue-800">
                                            {offering.deliveryMethod === 'virtual' ? 'Virtual' : offering.location || 'On Site'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="mt-2 text-xs text-blue-700">
                                        Classes run from {formatDate(offering.startDate)} to {formatDate(offering.stopDate)}
                                      </div>
                                    </div>

                                    {/* Enrollment Status */}
                                    <div className="mb-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Enrollment Status</span>
                                        <span className="text-sm text-gray-600">
                                          {offering.currentEnrollment || 0} / {offering.maxStudents} students
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full transition-all duration-300 ${
                                            utilizationPercentage >= 100 ? 'bg-red-500' :
                                            utilizationPercentage >= 80 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                          }`}
                                          style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                                        />
                                      </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                      <div>
                                        <span className="font-medium text-gray-900">Instructor:</span>
                                        <span className="ml-2">
                                          {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-900">Total Fees:</span>
                                        <span className="ml-2">{formatCurrency(totalFees)}</span>
                                      </div>
                                      {offering.ageRange && (
                                        <div>
                                          <span className="font-medium text-gray-900">Age Range:</span>
                                          <span className="ml-2">{offering.ageRange}</span>
                                        </div>
                                      )}
                                      {offering.prerequisites && (
                                        <div>
                                          <span className="font-medium text-gray-900">Prerequisites:</span>
                                          <span className="ml-2">{offering.prerequisites}</span>
                                        </div>
                                      )}
                                    </div>

                                    {offering.description && (
                                      <div className="mt-3 pt-3 border-t border-gray-200">
                                        <span className="text-sm font-medium text-gray-900">Description:</span>
                                        <p className="text-sm text-gray-600 mt-1">{offering.description}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => openOfferingModal(offering.programId, offering)}
                                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                                      title="Edit offering"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
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
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No class offerings yet</p>
                      <button
                        onClick={() => openOfferingModal(program.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create First Class</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first music program.'
              }
            </p>
            <button
              onClick={() => {
                setEditingProgram(null);
                resetProgramForm();
                setIsProgramModalOpen(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create First Program</span>
            </button>
          </div>
        )}
      </div>

      {/* Program Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingProgram ? 'Edit Program' : 'Add Program'}
              </h3>
              <button 
                onClick={() => {
                  setIsProgramModalOpen(false);
                  setEditingProgram(null);
                  resetProgramForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                <input
                  type="text"
                  value={programForm.name}
                  onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={programForm.category}
                  onChange={(e) => setProgramForm({ ...programForm, category: e.target.value as Program['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="private-lessons">Private Lessons</option>
                  <option value="homeschool">Homeschool</option>
                  <option value="band">Band</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  id="programActive"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={programForm.isActive}
                  onChange={(e) => setProgramForm({ ...programForm, isActive: e.target.checked })}
                />
                <label htmlFor="programActive" className="ml-2 block text-sm text-gray-700">
                  Active Program
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsProgramModalOpen(false);
                    setEditingProgram(null);
                    resetProgramForm();
                  }}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProgram ? 'Save Changes' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Offering Modal with Scheduling */}
      {isOfferingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingOffering ? 'Edit Class Offering' : 'Create Class Offering'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Set up a scheduled class with recurring sessions and student capacity
                  </p>
                </div>
                <button 
                  onClick={() => setIsOfferingModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveOffering} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                      <input
                        type="text"
                        value={offeringForm.className}
                        onChange={(e) => setOfferingForm({ ...offeringForm, className: e.target.value })}
                        placeholder="e.g., Beginner Piano, Advanced Band"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
                      <input
                        type="text"
                        value={offeringForm.term}
                        onChange={(e) => setOfferingForm({ ...offeringForm, term: e.target.value })}
                        placeholder="e.g., Fall 2024, Spring 2025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Description</label>
                    <textarea
                      value={offeringForm.description}
                      onChange={(e) => setOfferingForm({ ...offeringForm, description: e.target.value })}
                      rows={3}
                      placeholder="Describe what students will learn in this class..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Teacher Assignment */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Instructor Assignment</span>
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Instructor *</label>
                    <select
                      value={offeringForm.teacherId}
                      onChange={(e) => setOfferingForm({ ...offeringForm, teacherId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Choose an instructor</option>
                      {teachers.filter(t => t.isActive).map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                          {teacher.specialties.length > 0 && ` - ${teacher.specialties.join(', ')}`}
                          {teacher.hourlyRate && ` ($${teacher.hourlyRate}/hr)`}
                        </option>
                      ))}
                    </select>
                    {teachers.filter(t => t.isActive).length === 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        No active teachers available. Please add teachers first.
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Schedule Setup */}
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <span>Class Schedule</span>
                  </h4>
                  
                  {/* Days of Week Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Class Days * <span className="text-gray-500">(Select one or more days)</span>
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDayToggle(index)}
                          className={`p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                            offeringForm.daysOfWeek.includes(index)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
                          }`}
                        >
                          <div className="text-xs">{day.slice(0, 3)}</div>
                          <div className="text-xs mt-1">{day.slice(3)}</div>
                        </button>
                      ))}
                    </div>
                    {offeringForm.daysOfWeek.length === 0 && (
                      <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>Please select at least one day for the class</span>
                      </p>
                    )}
                    {offeringForm.daysOfWeek.length > 0 && (
                      <p className="text-sm text-indigo-600 mt-2 flex items-center space-x-1">
                        <span>✓</span>
                        <span>Class will meet on: {formatDaysOfWeek(offeringForm.daysOfWeek)}</span>
                      </p>
                    )}
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                      <input
                        type="time"
                        value={offeringForm.startTime}
                        onChange={(e) => setOfferingForm({ ...offeringForm, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                      <input
                        type="time"
                        value={offeringForm.endTime}
                        onChange={(e) => setOfferingForm({ ...offeringForm, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class Start Date *</label>
                      <input
                        type="date"
                        value={offeringForm.startDate.toISOString().split('T')[0]}
                        onChange={(e) => setOfferingForm({ ...offeringForm, startDate: new Date(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class End Date *</label>
                      <input
                        type="date"
                        value={offeringForm.stopDate.toISOString().split('T')[0]}
                        onChange={(e) => setOfferingForm({ ...offeringForm, stopDate: new Date(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Schedule Preview */}
                  {offeringForm.daysOfWeek.length > 0 && offeringForm.startTime && offeringForm.endTime && (
                    <div className="p-4 bg-indigo-100 rounded-lg">
                      <h5 className="text-sm font-medium text-indigo-900 mb-2">📅 Schedule Preview</h5>
                      <div className="space-y-1 text-sm text-indigo-800">
                        <p>
                          <strong>When:</strong> {formatDaysOfWeek(offeringForm.daysOfWeek)} from {formatTime(offeringForm.startTime)} to {formatTime(offeringForm.endTime)}
                        </p>
                        <p>
                          <strong>Duration:</strong> {formatDate(offeringForm.startDate)} to {formatDate(offeringForm.stopDate)}
                        </p>
                        <p>
                          <strong>Total Sessions:</strong> Approximately {calculateTotalSessions()} classes
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Delivery */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <span>Location & Delivery</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method *</label>
                      <select
                        value={offeringForm.deliveryMethod}
                        onChange={(e) => setOfferingForm({ ...offeringForm, deliveryMethod: e.target.value as 'onsite' | 'virtual' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="onsite">On Site (In-Person)</option>
                        <option value="virtual">Virtual (Online)</option>
                      </select>
                    </div>
                    {offeringForm.deliveryMethod === 'onsite' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Physical Location</label>
                        <input
                          type="text"
                          value={offeringForm.location}
                          onChange={(e) => setOfferingForm({ ...offeringForm, location: e.target.value })}
                          placeholder="e.g., Studio A, Main Hall, Room 101"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacity & Requirements */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-yellow-600" />
                    <span>Capacity & Requirements</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Students *</label>
                      <input
                        type="number"
                        value={offeringForm.maxStudents}
                        onChange={(e) => setOfferingForm({ ...offeringForm, maxStudents: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                      <input
                        type="text"
                        value={offeringForm.ageRange}
                        onChange={(e) => setOfferingForm({ ...offeringForm, ageRange: e.target.value })}
                        placeholder="e.g., 8-12 years, All ages"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                      <input
                        type="text"
                        value={offeringForm.prerequisites}
                        onChange={(e) => setOfferingForm({ ...offeringForm, prerequisites: e.target.value })}
                        placeholder="e.g., Basic music reading"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <span>Pricing Structure</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={offeringForm.registrationFee}
                          onChange={(e) => setOfferingForm({ ...offeringForm, registrationFee: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Materials Fee</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={offeringForm.materialsFee}
                          onChange={(e) => setOfferingForm({ ...offeringForm, materialsFee: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructional Fee *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={offeringForm.instructionalFee}
                          onChange={(e) => setOfferingForm({ ...offeringForm, instructionalFee: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-purple-900">Total per student:</span>
                      <span className="text-lg font-bold text-purple-900">
                        {formatCurrency(offeringForm.registrationFee + offeringForm.materialsFee + offeringForm.instructionalFee)}
                      </span>
                    </div>
                    {calculateTotalSessions() > 0 && (
                      <div className="text-xs text-purple-700 mt-1">
                        Approximately {formatCurrency((offeringForm.instructionalFee) / calculateTotalSessions())} per session
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Class Status</h4>
                    <p className="text-sm text-gray-600">Active classes are visible to families for enrollment</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      id="offeringActive"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={offeringForm.isActive}
                      onChange={(e) => setOfferingForm({ ...offeringForm, isActive: e.target.checked })}
                    />
                    <label htmlFor="offeringActive" className="text-sm font-medium text-gray-700">
                      Active (visible for enrollment)
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsOfferingModalOpen(false)}
                    className="px-6 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={offeringForm.daysOfWeek.length === 0 || saving}
                    className="px-6 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {saving ? 'Saving...' : editingOffering ? 'Save Changes' : 'Create Class Offering'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProgramsTab;