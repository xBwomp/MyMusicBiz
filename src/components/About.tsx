import React from 'react';
import { Award, Music, Heart, Users } from 'lucide-react';

const About = () => {
  const achievements = [
    {
      icon: Award,
      title: 'Certified Instructor',
      description: 'Master\'s in Music Education with 10+ years of teaching experience',
    },
    {
      icon: Music,
      title: 'Multi-Instrumentalist',
      description: 'Proficient in piano, guitar, voice, violin, and flute instruction',
    },
    {
      icon: Heart,
      title: 'Passionate Educator',
      description: 'Dedicated to nurturing each student\'s unique musical potential',
    },
    {
      icon: Users,
      title: 'Community Builder',
      description: 'Creating supportive musical communities for students and families',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Meet Your Instructor
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                With over a decade of experience in music education, I'm passionate about 
                helping students discover their musical voice and develop their talents in 
                a supportive, encouraging environment.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                My approach combines traditional music education with modern teaching methods, 
                ensuring that each student receives personalized instruction that matches their 
                learning style and musical interests. Whether you're a complete beginner or 
                looking to refine advanced techniques, I'm here to guide your musical journey.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                As a homeschooling parent myself, I understand the unique needs of homeschool 
                families and work closely with parents to integrate music education seamlessly 
                into their curriculum.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <achievement.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8">
              <img
                src="https://images.pexels.com/photos/7520745/pexels-photo-7520745.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Music instructor teaching"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">150+</div>
                  <div className="text-sm text-gray-600">Happy Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;