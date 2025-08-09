import React from 'react';
import { Calendar, Users, BookOpen, Award, Clock, Heart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Book lessons at times that work for your family schedule with easy online booking.',
    },
    {
      icon: Users,
      title: 'Group & Private Lessons',
      description: 'Choose between one-on-one instruction or collaborative group learning experiences.',
    },
    {
      icon: BookOpen,
      title: 'Homeschool Integration',
      description: 'Music education that seamlessly integrates with your homeschool curriculum.',
    },
    {
      icon: Award,
      title: 'Performance Opportunities',
      description: 'Regular recitals and band performances to showcase student progress.',
    },
    {
      icon: Clock,
      title: 'Progress Tracking',
      description: 'Detailed progress reports and practice logs to monitor musical development.',
    },
    {
      icon: Heart,
      title: 'Personalized Approach',
      description: 'Tailored instruction that adapts to each student\'s learning style and goals.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Choose Hunicker Institute?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive music education with a personal touch, 
            designed to inspire and nurture musical talent at every level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-600 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;