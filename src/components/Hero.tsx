import React from 'react';
import { Play, Calendar, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-20 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Band and Beyond
                <span className="text-indigo-600 block">Musical Excellence</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Comprehensive music education through homeschool instruction, private lessons, 
                and band programs at Hunicker Institute. Personalized learning that grows with your musical journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Schedule a Lesson
              </button>
              <button className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200 font-semibold text-lg">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">150+</div>
                <div className="text-sm text-gray-600">Students Taught</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">20+</div>
                <div className="text-sm text-gray-600">Years of Teaching Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">Group | Private</div>
                <div className="text-sm text-gray-600">Lessons</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 shadow-2xl">
              <img
                src="https://images.pexels.com/photos/7520745/pexels-photo-7520745.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Music lesson in progress"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-gray-900">What's Your Next Lesson?</div>
                    <div className="text-sm text-gray-600">Piano - Friday - 3:00 PM</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Band Practice</div>
                    <div className="text-sm text-gray-600">15+ Students and Growing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;