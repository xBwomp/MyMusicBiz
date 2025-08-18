import React from 'react';
import { useState, useEffect } from 'react';
import { Piano, Users, GraduationCap, Star } from 'lucide-react';
import { Program, Offering } from '../types/program';
import { programService, offeringService } from '../services/programService';

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);

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
      // Silently fallback to static data if Firebase query fails
      // This can happen when Firestore indexes haven't been deployed yet
      setPrograms([]);
      setOfferings([]);
    }
  };

  const staticPrograms = [
    {
      icon: Piano,
      title: 'Private Lessons',
      description: 'One-on-one instruction tailored to your individual goals and learning pace.',
      features: ['Piano', 'Guitar', 'Voice', 'Violin', 'Flute'],
      price: 'Starting at $60/lesson',
      popular: false,
    },
    {
      icon: GraduationCap,
      title: 'Homeschool Music',
      description: 'Comprehensive music education integrated with your homeschool curriculum.',
      features: ['Music Theory', 'History', 'Composition', 'Performance', 'Ear Training'],
      price: 'Starting at $80/month',
      popular: true,
    },
    {
      icon: Users,
      title: 'Band Program',
      description: 'Collaborative ensemble experience for intermediate and advanced students.',
      features: ['Concert Band', 'Jazz Ensemble', 'Chamber Groups', 'Performances', 'Competitions'],
      price: 'Starting at $120/month',
      popular: false,
    },
  ];

  // Use dynamic data if available, otherwise fall back to static data
  const displayPrograms = programs.length > 0 ? programs.map(program => {
    const programOfferings = offerings.filter(o => o.programId === program.id);
    const minPrice = programOfferings.length > 0 
      ? Math.min(...programOfferings.map(o => o.instructionalFee))
      : 0;
    
    return {
      icon: program.category === 'private-lessons' ? Piano : 
            program.category === 'homeschool' ? GraduationCap : Users,
      title: program.name,
      description: program.description,
      features: programOfferings.map(o => o.className).slice(0, 5),
      price: minPrice > 0 ? `Starting at $${minPrice}` : 'Contact for pricing',
      popular: program.category === 'homeschool',
    };
  }) : staticPrograms;

  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Programs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect program to match your musical journey and educational needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayPrograms.map((program, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                program.popular
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                  : 'bg-white text-gray-900'
              }`}
            >
              {program.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center space-y-6">
                <div className={`inline-flex p-4 rounded-2xl ${
                  program.popular ? 'bg-white/20' : 'bg-indigo-100'
                }`}>
                  <program.icon className={`h-8 w-8 ${
                    program.popular ? 'text-white' : 'text-indigo-600'
                  }`} />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">{program.title}</h3>
                  <p className={`${
                    program.popular ? 'text-indigo-100' : 'text-gray-600'
                  }`}>
                    {program.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {program.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className={`flex items-center justify-center space-x-2 ${
                        program.popular ? 'text-indigo-100' : 'text-gray-600'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        program.popular ? 'bg-white' : 'bg-indigo-600'
                      }`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-200/20">
                  <div className="text-2xl font-bold mb-4">{program.price}</div>
                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    program.popular
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;