import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Users, Search } from 'lucide-react';
import { Program, Offering } from '../../../types/program';
import { programService, offeringService } from '../../../services/programService';

const ProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [programsData, offeringsData] = await Promise.all([
        programService.getPrograms(),
        offeringService.getOfferings()
      ]);
      setPrograms(programsData);
      setOfferings(offeringsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || program.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
          <p className="text-gray-600">Manage your music programs and class offerings</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
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
          const programOfferings = offerings.filter(o => o.programId === program.id);
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
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200">
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
                      
                      return (
                        <div key={offering.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
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
                                  <span className="font-medium">Enrolled:</span> {offering.currentEnrollment || 0}
                                  {offering.maxStudents && ` / ${offering.maxStudents}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button className="p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200">
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
                    <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors duration-200 flex items-center space-x-2">
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
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto">
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
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>Create First Program</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgramsTab;