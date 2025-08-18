import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Users } from 'lucide-react';
import { Program, Offering } from '../../types/program';
import { programService, offeringService } from '../../services/programService';

const ProgramManager = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'offerings'>('programs');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Program Management</h1>
        
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
      </div>

      {activeTab === 'programs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Programs</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Program</span>
            </button>
          </div>

          <div className="grid gap-6">
            {programs.map((program) => (
              <div key={program.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                    <p className="text-gray-600 mt-1">{program.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        program.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {program.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {program.category.replace('-', ' ')}
                      </span>
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
                
                <div className="text-sm text-gray-500">
                  {offerings.filter(o => o.programId === program.id).length} class offerings
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'offerings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Class Offerings</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Class Offering</span>
            </button>
          </div>

          <div className="grid gap-6">
            {offerings.map((offering) => {
              const program = programs.find(p => p.id === offering.programId);
              const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
              
              return (
                <div key={offering.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{offering.className}</h3>
                      <p className="text-sm text-gray-600">{program?.name} • {offering.term}</p>
                      {offering.description && (
                        <p className="text-gray-600 mt-1">{offering.description}</p>
                      )}
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Start Date</div>
                        <div className="text-sm text-gray-600">{formatDate(offering.startDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">End Date</div>
                        <div className="text-sm text-gray-600">{formatDate(offering.stopDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Total Fees</div>
                        <div className="text-sm text-gray-600">{formatCurrency(totalFees)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Enrollment</div>
                        <div className="text-sm text-gray-600">
                          {offering.currentEnrollment || 0}
                          {offering.maxStudents && ` / ${offering.maxStudents}`}
                        </div>
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
                    {offering.classDates.length > 0 && (
                      <div>Class Dates: {offering.classDates.map(formatDate).join(', ')}</div>
                    )}
                    <div>Recurring: {offering.isRecurring ? 'Yes' : 'No'}</div>
                    <div>
                      Delivery: {offering.deliveryMethod === 'virtual' ? 'Virtual' : `On Site${offering.location ? ` - ${offering.location}` : ''}`}
                    </div>
                    <div>Instructor: {offering.instructor}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offering.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offering.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;