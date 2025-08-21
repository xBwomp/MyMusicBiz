import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, Users, Clock, MapPin } from 'lucide-react';
import { Program, Offering } from '../../../types/program';
import { programService, offeringService } from '../../../services/programService';

const ProgramBrowser = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const [programsData, offeringsData] = await Promise.all([
        programService.getActivePrograms(),
        offeringService.getActiveOfferings()
      ]);
      setPrograms(programsData);
      setOfferings(offeringsData);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || program.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getProgramOfferings = (programId: string) => {
    return offerings.filter(o => o.programId === programId);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Programs</h1>
        <p className="text-gray-600">Discover the perfect musical program for your child</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="private-lessons">Private Lessons</option>
                <option value="homeschool">Homeschool</option>
                <option value="band">Band</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid gap-6">
        {filteredPrograms.map((program) => {
          const programOfferings = getProgramOfferings(program.id);
          const minPrice = programOfferings.length > 0 
            ? Math.min(...programOfferings.map(o => o.instructionalFee))
            : 0;

          return (
            <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{program.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                      {program.category.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {programOfferings.length} class offering{programOfferings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {minPrice > 0 ? `From ${formatCurrency(minPrice)}` : 'Contact for pricing'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {programOfferings.reduce((sum, o) => sum + (o.currentEnrollment || 0), 0)} enrolled
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedProgram(selectedProgram?.id === program.id ? null : program)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  {selectedProgram?.id === program.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Program Details */}
              {selectedProgram?.id === program.id && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Available Classes</h4>
                  {programOfferings.length > 0 ? (
                    <div className="grid gap-4">
                      {programOfferings.map((offering) => {
                        const totalFees = offering.registrationFee + offering.materialsFee + offering.instructionalFee;
                        const spotsAvailable = offering.maxStudents ? offering.maxStudents - (offering.currentEnrollment || 0) : null;
                        
                        return (
                          <div key={offering.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-medium text-gray-900">{offering.className}</h5>
                                <p className="text-sm text-gray-600">{offering.term}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(totalFees)}
                                </div>
                                <div className="text-xs text-gray-500">Total fees</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900">Start Date</div>
                                  <div className="text-gray-600">{formatDate(offering.startDate)}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900">Duration</div>
                                  <div className="text-gray-600">
                                    {Math.ceil((offering.stopDate.getTime() - offering.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900">Location</div>
                                  <div className="text-gray-600">
                                    {offering.deliveryMethod === 'virtual' ? 'Virtual' : offering.location || 'On Site'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900">Availability</div>
                                  <div className="text-gray-600">
                                    {spotsAvailable !== null 
                                      ? `${spotsAvailable} spots left`
                                      : 'Open enrollment'
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Instructor:</span> {offering.instructor}
                              </div>
                              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                                Enroll Now
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No classes currently available for this program.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or browse all available programs.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgramBrowser;