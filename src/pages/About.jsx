import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Users, Heart, Target, Award, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">StreetSaver</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">Home</Link>
              <Link to="/marketplace" className="text-gray-700 hover:text-orange-500 transition-colors">Marketplace</Link>
              <Link to="/about" className="text-orange-500 font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition-colors">Contact</Link>
              <Link to="/auth" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Empowering Street Food
              <span className="text-orange-500 block">Vendors Together</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We believe that every street food vendor deserves access to affordable supplies and a supportive community. 
              StreetSaver is more than a platform – it's a movement to transform how vendors do business.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To democratize access to wholesale pricing and create a thriving ecosystem where street food vendors 
                can reduce costs, increase profits, and build lasting business relationships.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We started StreetSaver because we saw talented vendors struggling with high supply costs and limited 
                bargaining power. By bringing vendors together, we're leveling the playing field and creating 
                opportunities for sustainable growth.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Street food vendors working together" 
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Users className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community First</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in the power of community. When vendors work together, everyone benefits from shared knowledge, 
                resources, and collective bargaining power.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Heart className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                We maintain complete transparency in pricing, processes, and partnerships. No hidden fees, 
                no surprise charges – just honest, fair business practices.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Target className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Impact Driven</h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature we build and partnership we form is designed to create measurable positive impact 
                on vendors' businesses and livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-orange-100">Real numbers, real change</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5,000+</div>
              <div className="text-orange-100">Active Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">₹2.5M</div>
              <div className="text-orange-100">Total Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-orange-100">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-orange-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Passionate people working to empower vendors</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300" 
                alt="Team member" 
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Arjun Patel</h3>
              <p className="text-orange-500 mb-2">Founder & CEO</p>
              <p className="text-gray-600 text-sm">Former street vendor turned entrepreneur, passionate about empowering the community</p>
            </div>

            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=300" 
                alt="Team member" 
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Priya Sharma</h3>
              <p className="text-orange-500 mb-2">Head of Operations</p>
              <p className="text-gray-600 text-sm">Supply chain expert with 10+ years experience in vendor relations</p>
            </div>

            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300" 
                alt="Team member" 
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rahul Singh</h3>
              <p className="text-orange-500 mb-2">Technology Lead</p>
              <p className="text-gray-600 text-sm">Building scalable solutions to connect vendors and suppliers efficiently</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be part of the movement that's transforming street food businesses across India
          </p>
          <Link 
            to="/auth" 
            className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-8 w-8 text-orange-500" />
                <span className="text-xl font-bold text-white">StreetSaver</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering street food vendors through collaborative savings and community support.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
                <li><Link to="/marketplace" className="hover:text-orange-500 transition-colors">Marketplace</Link></li>
                <li><Link to="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/auth" className="hover:text-orange-500 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 StreetSaver. All rights reserved. Made with ❤️ for street food vendors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;