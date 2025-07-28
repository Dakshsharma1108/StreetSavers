import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    role: 'Vendor',
    image: null,
  });

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        return resolve(null);
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          });
        },
        (err) => {
          console.warn("Location access denied");
          resolve(null); // Graceful fallback
        }
      );
    });
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return '';

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ml_default');
    data.append('cloud_name', 'dlpzs4eyw');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dlpzs4eyw/image/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      return result.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const location = await getLocation();

      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }

        const result = await login(formData.email, formData.password, location);
        if (result?.token) {
          alert('Login successful!');
          navigate('/dashboard');
        } else {
          throw new Error('Login failed - no valid response received');
        }
      } else {
        if (!formData.email || !formData.password || !formData.username || !formData.phone) {
          throw new Error('All fields are required for registration');
        }

        const imageUrl = await uploadToCloudinary(formData.image);

        if (!location || !location.type || !location.coordinates || location.coordinates.length !== 2) {
          throw new Error('Location access failed. Please enable location and try again.');
        }


        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          bio: '',
          imageUrl,
          location,
        });

        alert('Account created! Please log in.');
        setIsLogin(true);
        setFormData(prev => ({
          ...prev,
          username: '',
          phone: '',
          role: 'Vendor',
          image: null
        }));
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(
        error.message === 'Network Error'
          ? 'Cannot connect to server. Please check your connection.'
          : error.message || 'Authentication failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-orange-50 px-4">
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">StreetSaver</span>
            </Link>
            <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg mt-16">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
          
        {isLogin && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
            <strong>Note:</strong> Please enable site and device location
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="flex items-center border rounded px-3">
                <User className="text-orange-500 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 outline-none"
                  required
                />
              </div>
              <div className="flex items-center border rounded px-3">
                <Phone className="text-orange-500 mr-2" size={20} />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 outline-none"
                  required
                />
              </div>
              <div className="flex items-center border rounded px-3">
                <ShieldCheck className="text-orange-500 mr-2" size={20} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 outline-none"
                >
                  <option value="Vendor">Vendor</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>

              <div className="flex items-center border rounded px-3 py-2">
                <label className="w-full text-sm text-gray-600">
                  Upload Profile Picture:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="w-full mt-1 text-sm text-gray-600"
                  />
                </label>
              </div>

              {formData.image && (
                <div className="text-center">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-full mx-auto mb-2"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center border rounded px-3">
            <Mail className="text-orange-500 mr-2" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 outline-none"
              required
            />
          </div>

          <div className="flex items-center border rounded px-3">
            <Lock className="text-orange-500 mr-2" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-sm text-orange-600 hover:underline text-center"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
