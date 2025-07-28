import { Link, useNavigate } from 'react-router-dom';
import {
  ChefHat, User, Mail, Phone, MapPin, Calendar, Star,
  TrendingUp, Users, ShoppingCart, Pencil, LogOut, Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAddressFromCoordinates = async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || "Address not found";
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, { headers });

        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const profileJson = await profileRes.json();
        
        if (profileJson.success) {
          const user = profileJson.user;
          setProfileData({
            name: user.username,
            email: user.email,
            phone: user.phone,
            location: user.location?.coordinates ? 
              await getAddressFromCoordinates(user.location.coordinates[1], user.location.coordinates[0]) : 'Unknown location',
            businessName: user.businessName || 'Not specified',
            businessType: user.businessType || 'Not specified',
            joinedDate: new Date(user.joinedDate).toLocaleDateString(),
            bio: user.bio || 'No bio provided',
            image: user.imageUrl,
            rating: user.rating,
            wallet: user.wallet,
            role: user.role
          });
        } else {
          throw new Error('Failed to load profile data');
        }
      } catch (err) {
        console.error("API error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/auth');
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={profileData.image || 'https://placehold.co/200x200'} 
                    alt={profileData.name} 
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                  <p className="text-gray-500">{profileData.role}</p>
                  {profileData.businessName && (
                    <p className="mt-1 text-gray-600">{profileData.businessName}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Mail className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{profileData.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{profileData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{profileData.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-sm text-gray-900">{profileData.joinedDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <p className="text-sm text-gray-900">{profileData.rating}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Wallet Balance</p>
                    <p className="text-sm text-gray-900">₹{profileData.wallet}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Business Information</h3>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Type</p>
                  <p className="text-sm text-gray-900 mt-1">{profileData.businessType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Name</p>
                  <p className="text-sm text-gray-900 mt-1">{profileData.businessName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">About</p>
                  <p className="text-sm text-gray-900 mt-1">{profileData.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
