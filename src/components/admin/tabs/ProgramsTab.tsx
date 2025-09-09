import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Users, Search, Clock, MapPin, User } from 'lucide-react';
import { Program, Offering } from '../../../types/program';
import { Teacher } from '../../../types/admin';
import { programService, offeringService } from '../../../services/programService';
import { teacherService } from '../../../services/adminService';

const ProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [programForm, setProgramForm] = useState<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    category: 'private-lessons',
    isActive: true,
  });
  const [newOffering, setNewOffering] = useState<Omit<Offering, 'id' | 'createdAt' | 'updatedAt'>>({
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

  const getTeacher = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProgram) {
        await programService.updateProgram(editingProgram.id, programForm);
      } else {
        await programService.createProgram(programForm);
      }
      setIsModalOpen(false);
      setEditingProgram(null);
      setProgramForm({
        name: '',
        description: '',
        category: 'private-lessons',
        isActive: true,
      });
      await loadData();
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const openOfferingModal = (programId: string, offering?: Offering) => {
    if (offering) {
      const { id, createdAt, updatedAt, ...rest } = offering;
      void id; void createdAt; void updatedAt;
      setNewOffering(rest);
      setEditingOffering(offering);
    } else {
      setNewOffering({
        programId,
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
      setEditingOffering(null);
    }
    setIsOfferingModalOpen(true);
  };

  const handleSaveOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOffering) {
        await offeringService.updateOffering(editingOffering.id, newOffering);
      } else {
        await offeringService.createOffering(newOffering);
      }
      setIsOfferingModalOpen(false);
      setEditingOffering(null);
      await loadData();
    } catch (error) {
      console.error('Error saving offering:', error);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const currentDays = [...newOffering.daysOfWeek];
    const dayExists = currentDays.includes(dayIndex);
    
    if (dayExists) {
      setNewOffering({
        ...newOffering,
        daysOfWeek: currentDays.filter(d => d !== dayIndex)
      });
    } else {
      setNewOffering({
        ...newOffering,
        daysOfWeek: [...currentDays, dayIndex].sort()
      });
    }
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
            <p className="text-gray-600">Manage your music programs and class offerings with integrated scheduling</p>
          </div>
          <button
            onClick={() => {
              setEditingProgram(null);
              setProgramForm({
                name: '',
                description: '',
                category: 'private-lessons',
                isActive: true,
              });
              setIsModalOpen(true);
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
                          {programOfferings.length} total offerings
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {activeOfferings.length} active classes
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
                      onClick={() => {
                        setEditingProgram(program);
                        setProgramForm({
                          name: program.name,
                          description: program.description,
                          category: program.category,
                          isActive: program.isActive,
                        });
                        setIsModalOpen(true);
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

                {/* Class Offerings */}
                {programOfferings.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Class Offerings</h4>
                    <div className="grid gap-3">
                      {programOfferings.slice(0, 3).map((offering) => {
                        const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
                        const teacher = getTeacher(offering.teacherId);
                        
                        return (
                          <div key={offering.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="font-medium text-gray-900">{offering.className}</h5>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDaysOfWeek(offering.daysOfWeek)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>{formatTime(offering.startTime)} - {formatTime(offering.endTime)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>
                                      {offering.deliveryMethod === 'virtual' ? 'Virtual' : offering.location || 'On Site'}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Start:</span> {formatDate(offering.startDate)}
                                  </div>
                                  <div>
                                    <span className="font-medium">End:</span> {formatDate(offering.stopDate)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Total Fees:</span> {formatCurrency(totalFees)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Enrolled:</span> {offering.currentEnrollment || 0} / {offering.maxStudents}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>
                                      <span className="font-medium">Instructor:</span> {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}
                                    </span>
                                  </div>
                                  {offering.ageRange && (
                                    <div>
                                      <span className="font-medium">Age Range:</span> {offering.ageRange}
                                    </div>
                                  )}
                                </div>

                                {offering.description && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    <span className="font-medium">Description:</span> {offering.description}
                                  </div>
                                )}

                                {offering.prerequisites && (
                                  <div className="mt-1 text-sm text-gray-600">
                                    <span className="font-medium">Prerequisites:</span> {offering.prerequisites}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => openOfferingModal(offering.programId, offering)}
                                  className="p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {programOfferings.length > 3 && (
                        <div className="text-center">
                          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View {programOfferings.length - 3} more offerings
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => openOfferingModal(program.id)}
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Class Offering</span>
                      </button>
                    </div>
                  </div>
                )}

                {programOfferings.length === 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-3">No class offerings yet</p>
                      <button
                        onClick={() => openOfferingModal(program.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add First Class Offering</span>
                      </button>
                    </div>
                  </div>
                )}
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
                setProgramForm({
                  name: '',
                  description: '',
                  category: 'private-lessons',
                  isActive: true,
                });
                setIsModalOpen(true);
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingProgram ? 'Edit Program' : 'Add Program'}
            </h3>
            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={programForm.name}
                  onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={programForm.category}
                  onChange={(e) => setProgramForm({ ...programForm, category: e.target.value as Program['category'] })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                  id="isActive"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={programForm.isActive}
                  onChange={(e) => setProgramForm({ ...programForm, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProgram(null);
                    setProgramForm({
                      name: '',
                      description: '',
                      category: 'private-lessons',
                      isActive: true,
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Offering Modal */}
      {isOfferingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingOffering ? 'Edit Class Offering' : 'Add Class Offering'}
              </h3>
              <form onSubmit={handleSaveOffering} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                    <input
                      type="text"
                      value={newOffering.className}
                      onChange={(e) => setNewOffering({ ...newOffering, className: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
                    <input
                      type="text"
                      value={newOffering.term}
                      onChange={(e) => setNewOffering({ ...newOffering, term: e.target.value })}
                      placeholder="e.g., Fall 2024, Spring 2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Teacher Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor *</label>
                  <select
                    value={newOffering.teacherId}
                    onChange={(e) => setNewOffering({ ...newOffering, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select an instructor</option>
                    {teachers.filter(t => t.isActive).map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                        {teacher.specialties.length > 0 && ` (${teacher.specialties.join(', ')})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schedule Setup */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Class Schedule</h4>
                  
                  {/* Days of Week */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Class Days *</label>
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDayToggle(index)}
                          className={`p-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                            newOffering.daysOfWeek.includes(index)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    {newOffering.daysOfWeek.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">Please select at least one day</p>
                    )}
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                      <input
                        type="time"
                        value={newOffering.startTime}
                        onChange={(e) => setNewOffering({ ...newOffering, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                      <input
                        type="time"
                        value={newOffering.endTime}
                        onChange={(e) => setNewOffering({ ...newOffering, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={newOffering.startDate.toISOString().split('T')[0]}
                        onChange={(e) => setNewOffering({ ...newOffering, startDate: new Date(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                      <input
                        type="date"
                        value={newOffering.stopDate.toISOString().split('T')[0]}
                        onChange={(e) => setNewOffering({ ...newOffering, stopDate: new Date(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method *</label>
                    <select
                      value={newOffering.deliveryMethod}
                      onChange={(e) => setNewOffering({ ...newOffering, deliveryMethod: e.target.value as 'onsite' | 'virtual' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="onsite">On Site</option>
                      <option value="virtual">Virtual</option>
                    </select>
                  </div>
                  {newOffering.deliveryMethod === 'onsite' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={newOffering.location}
                        onChange={(e) => setNewOffering({ ...newOffering, location: e.target.value })}
                        placeholder="e.g., Studio A, Main Hall"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Pricing</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee</label>
                      <input
                        type="number"
                        value={newOffering.registrationFee}
                        onChange={(e) => setNewOffering({ ...newOffering, registrationFee: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Materials Fee</label>
                      <input
                        type="number"
                        value={newOffering.materialsFee}
                        onChange={(e) => setNewOffering({ ...newOffering, materialsFee: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructional Fee *</label>
                      <input
                        type="number"
                        value={newOffering.instructionalFee}
                        onChange={(e) => setNewOffering({ ...newOffering, instructionalFee: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Total: {formatCurrency(newOffering.registrationFee + newOffering.materialsFee + newOffering.instructionalFee)}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Students *</label>
                    <input
                      type="number"
                      value={newOffering.maxStudents}
                      onChange={(e) => setNewOffering({ ...newOffering, maxStudents: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                    <input
                      type="text"
                      value={newOffering.ageRange}
                      onChange={(e) => setNewOffering({ ...newOffering, ageRange: e.target.value })}
                      placeholder="e.g., 8-12 years"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                  <input
                    type="text"
                    value={newOffering.prerequisites}
                    onChange={(e) => setNewOffering({ ...newOffering, prerequisites: e.target.value })}
                    placeholder="e.g., Basic music reading skills"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newOffering.description}
                    onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
                    rows={3}
                    placeholder="Detailed description of the class..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="offeringActive"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={newOffering.isActive}
                    onChange={(e) => setNewOffering({ ...newOffering, isActive: e.target.checked })}
                  />
                  <label htmlFor="offeringActive" className="ml-2 block text-sm text-gray-700">Active</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsOfferingModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newOffering.daysOfWeek.length === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {editingOffering ? 'Save Changes' : 'Create Offering'}
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