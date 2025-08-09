import React from 'react';
import { Music, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold">Harmony Academy</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Nurturing musical excellence through personalized instruction, 
              homeschool integration, and community building.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Programs</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Private Lessons</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Homeschool Music</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Band Program</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Performance Opportunities</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Instruments</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Piano</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Guitar</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Voice</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Violin</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Flute</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@harmonyacademy.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Home Studio & Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Harmony Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;