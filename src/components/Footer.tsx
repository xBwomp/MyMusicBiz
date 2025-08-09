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
              <img 
                src="https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-6/446998267_390822577278912_1249827645745068948_n.png?_nc_cat=106&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=y-u-Mz78OY4Q7kNvwHueQVa&_nc_oc=Adm6ExywDwIP8-gKSfykLIL42D5xY5uVvehSe4QT41D9UWN-XfZ1_Qnolpj_87Zd3dQ&_nc_zt=23&_nc_ht=scontent-atl3-1.xx&_nc_gid=zz9Di8SNbHNxiofU_GGUiQ&oh=00_AfXZYd-shHv1jZIgu3EIoWL9TcCarVEPc6-f-C6gvGoKzA&oe=689D9B83"
                alt="Hunicker Institute Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold">Hunicker Institute</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Band and Beyond - Nurturing musical excellence through personalized instruction, 
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
                <span>info@hunickerinstitute.com</span>
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
          <p>&copy; {currentYear} Hunicker Institute: Band and Beyond. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;