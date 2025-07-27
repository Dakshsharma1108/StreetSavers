import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingCart, TrendingUp, Star, ChefHat, MapPin, Clock, Shield, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">StreetSaver</span>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button 
                className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-500 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <a href="#how-it-works" className="text-gray-700 hover:text-orange-500 transition-colors">How It Works</a>
              <Link to="/marketplace" className="text-gray-700 hover:text-orange-500 transition-colors">Marketplace</Link>
              <Link to="/about" className="text-gray-700 hover:text-orange-500 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition-colors">Contact</Link>
              {isAuthenticated && <Link to="/nearby" className="text-gray-700 hover:text-orange-500 transition-colors">Nearby</Link>}
              {isAuthenticated && <Link to="/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">Dashboard</Link>}
              {!isAuthenticated && (
                <Link to="/auth" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
                  Get Started
                </Link>
              )}
              {isAuthenticated && (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <Link 
                        to="/" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a 
                href="#how-it-works" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <Link 
                to="/marketplace" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link 
                to="/about" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/nearby" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nearby
                </Link>
              )}
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {!isAuthenticated && (
                <Link 
                  to="/auth" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-orange-500 hover:bg-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
              {isAuthenticated && (
                <div className="pt-4 pb-2 border-t border-gray-200">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.name || 'User'}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/" 
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Save More,
                  <span className="text-orange-500 block">Grow Together</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Join thousands of street food vendors who are saving money and growing their businesses through our collaborative platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link to="/auth" className="bg-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg text-center">
                      Join a Savings Pool
                    </Link>
                    <Link to="/auth" className="border-2 border-orange-500 text-orange-500 px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200 text-center">
                      Become a Supplier
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/create-pool" className="bg-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg text-center">
                      Create a Pool
                    </Link>
                    <Link to="/marketplace" className="border-2 border-orange-500 text-orange-500 px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200 text-center">
                      Browse Products
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:space-x-8 pt-2 md:pt-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">5,000+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Active Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">₹2.5M</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-xs sm:text-sm text-gray-600">User Rating</div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative z-10">
                <img 
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Street food vendor" 
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-orange-200 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 sm:w-48 sm:h-48 bg-amber-200 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">How StreetSaver Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to start saving money and growing your street food business
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center group p-4 md:p-6 bg-orange-50 rounded-xl">
              <div className="bg-orange-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-orange-200 transition-colors">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Join a Pool</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Connect with other vendors in your area to form buying groups and increase your purchasing power.
              </p>
            </div>

            <div className="text-center group p-4 md:p-6 bg-orange-50 rounded-xl">
              <div className="bg-orange-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-orange-200 transition-colors">
                <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Bulk Purchase</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Access wholesale prices on ingredients, packaging, and equipment through our verified supplier network.
              </p>
            </div>

            <div className="text-center group p-4 md:p-6 bg-orange-50 rounded-xl">
              <div className="bg-orange-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-orange-200 transition-colors">
                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Grow Together</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Share knowledge, collaborate on marketing, and grow your business with community support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 md:py-20 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Why Choose StreetSaver?</h2>
            <p className="text-lg sm:text-xl text-orange-100 max-w-3xl mx-auto">
              Discover the benefits that make us the preferred choice for street food vendors
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all duration-200">
              <Shield className="h-10 w-10 md:h-12 md:w-12 text-white mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Secure Payments</h3>
              <p className="text-orange-100 text-xs md:text-sm">Protected transactions with escrow service</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all duration-200">
              <MapPin className="h-10 w-10 md:h-12 md:w-12 text-white mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Local Network</h3>
              <p className="text-orange-100 text-xs md:text-sm">Connect with vendors in your neighborhood</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all duration-200">
              <Clock className="h-10 w-10 md:h-12 md:w-12 text-white mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Quick Delivery</h3>
              <p className="text-orange-100 text-xs md:text-sm">Fast and reliable supply chain management</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all duration-200">
              <Star className="h-10 w-10 md:h-12 md:w-12 text-white mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Quality Assured</h3>
              <p className="text-orange-100 text-xs md:text-sm">Verified suppliers with quality guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Success Stories</h2>
            <p className="text-lg sm:text-xl text-gray-600">Hear from vendors who transformed their businesses</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-gray-50 rounded-xl p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3 md:mb-4">
                <img 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150" 
                  alt="Vendor" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3 md:mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">Rajesh Kumar</h4>
                  <p className="text-xs md:text-sm text-gray-600">Chaat Vendor, Delhi</p>
                </div>
              </div>
              <p className="text-gray-700 italic text-sm md:text-base">
                "Joining StreetSaver helped me save 30% on ingredients. Now I can offer better prices to my customers and still make more profit!"
              </p>
              <div className="flex text-yellow-400 mt-3 md:mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3 md:mb-4">
                <img 
                  src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150" 
                  alt="Vendor" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3 md:mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">Priya Sharma</h4>
                  <p className="text-xs md:text-sm text-gray-600">Dosa Stall, Mumbai</p>
                </div>
              </div>
              <p className="text-gray-700 italic text-sm md:text-base">
                "The community support is amazing. We share tips, help each other, and even collaborate on events. It's like having a business family!"
              </p>
              <div className="flex text-yellow-400 mt-3 md:mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3 md:mb-4">
                <img 
                  src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150" 
                  alt="Vendor" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3 md:mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">Mohammed Ali</h4>
                  <p className="text-xs md:text-sm text-gray-600">Biryani Cart, Hyderabad</p>
                </div>
              </div>
              <p className="text-gray-700 italic text-sm md:text-base">
                "From struggling to make ends meet to expanding to 3 locations - StreetSaver made it possible by reducing my costs significantly."
              </p>
              <div className="flex text-yellow-400 mt-3 md:mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 md:mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 md:mb-8">
            Join thousands of vendors who are already saving money and growing together
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
            <button 
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold transition-all duration-200 text-sm md:text-base ${
                activeTab === 'vendors' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('vendors')}
            >
              I'm a Vendor
            </button>
            <button 
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold transition-all duration-200 text-sm md:text-base ${
                activeTab === 'suppliers' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('suppliers')}
            >
              I'm a Supplier
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 md:p-8 mb-6 md:mb-8">
            {activeTab === 'vendors' ? (
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 md:mb-4">For Vendors</h3>
                <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
                  Start saving money today by joining a savings pool in your area
                </p>
                {!isAuthenticated ? (
                  <Link to="/auth" className="bg-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 inline-block">
                    Join a Savings Pool
                  </Link>
                ) : (
                  <Link to="/create-pool" className="bg-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 inline-block">
                    Create a Pool
                  </Link>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 md:mb-4">For Suppliers</h3>
                <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
                  Expand your business by connecting with vendor communities
                </p>
                {!isAuthenticated ? (
                  <Link to="/auth" className="bg-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 inline-block">
                    Register as Supplier
                  </Link>
                ) : (
                  <Link to="/marketplace" className="bg-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 inline-block">
                    Browse Products
                  </Link>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-400 text-xs md:text-sm">
            No setup fees • Cancel anytime • 24/7 support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <ChefHat className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                <span className="text-lg md:text-xl font-bold text-white">StreetSaver</span>
              </div>
              <p className="text-gray-400 mb-4 text-xs md:text-sm">
                Empowering street food vendors through collaborative savings and community support.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="hover:text-orange-500 transition-colors text-xs md:text-sm">How It Works</a></li>
                <li><Link to="/marketplace" className="hover:text-orange-500 transition-colors text-xs md:text-sm">Marketplace</Link></li>
                <li><Link to="/dashboard" className="hover:text-orange-500 transition-colors text-xs md:text-sm">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-orange-500 transition-colors text-xs md:text-sm">About</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500 transition-colors text-xs md:text-sm">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Account</h4>
              <ul className="space-y-2">
                {!isAuthenticated ? (
                  <li><Link to="/auth" className="hover:text-orange-500 transition-colors text-xs md:text-sm">Sign In</Link></li>
                ) : (
                  <li><Link to="/profile" className="hover:text-orange-500 transition-colors text-xs md:text-sm">Profile</Link></li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-xs md:text-sm">
              © 2024 StreetSaver. All rights reserved. Made with ❤️ for street food vendors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;