import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChefHat, Users, Clock, TrendingUp, MapPin, Star, CheckCircle } from 'lucide-react';
import { poolService } from '../services/apiServices.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const PoolPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState('');
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [isJoined, setIsJoined] = useState(false);
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [endingPool, setEndingPool] = useState(false);

  useEffect(() => {
    fetchPoolData();
  }, [id]);

  const fetchPoolData = async () => {
    try {
      setLoading(true);
      const data = await poolService.getPoolById(id);
      const pool = data.pool;
      
      if (pool) {
        console.log('Pool data:', pool);
        console.log('Current user:', user);
        console.log('Pool createdBy:', pool.createdBy);
        console.log('User ID:', user?.id);
        console.log('User _id:', user?._id);
        
        // Check if current user is already in the pool
        const userIsJoined = pool.joinedVendors?.some(vendor => 
          vendor.vendorId?._id === user?.id || vendor.vendorId === user?.id ||
          vendor.vendorId?._id === user?._id || vendor.vendorId === user?._id
        );
        setIsJoined(userIsJoined);
        
        // Check if current user is the creator of the pool - Fixed logic
        let userIsCreator = false;
        if (pool.createdBy && user) {
          // Handle different ID field variations
          const userId = user.id || user._id;
          const creatorId = typeof pool.createdBy === 'object' ? pool.createdBy._id : pool.createdBy;
          
          userIsCreator = creatorId === userId;
          console.log('Creator check - CreatorId:', creatorId, 'UserId:', userId, 'IsCreator:', userIsCreator);
        }
        setIsCreator(userIsCreator);
        
        setPoolData(pool);
      } else {
        setPoolData(mockPoolData);
        setIsCreator(false);
      }
    } catch (err) {
      setError('Failed to load pool data');
      console.error('Pool error:', err);
      // Use mock data as fallback
      setPoolData(mockPoolData);
      setIsCreator(false);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    if (!user) {
      alert('Please login to join a pool');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (!quantityNum || quantityNum <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (quantityNum < (poolData?.minOrder || mockPoolData.minOrder)) {
      alert(`Minimum order is ${poolData?.minOrder || mockPoolData.minOrder}kg`);
      return;
    }

    try {
      const result = await poolService.joinPool(id, quantityNum);
      console.log('Join pool result:', result);
      
      // Clear the quantity input
      setQuantity('');
      
      alert(result.message || 'Successfully joined the pool!');
      
      // Refresh pool data to get updated information
      await fetchPoolData();
    } catch (err) {
      console.error('Join pool error:', err);
      alert(err.message || 'Failed to join pool. Please try again.');
    }
  };

  const handleEndPool = async () => {
    if (!user || !isCreator) {
      alert('Only the pool creator can end this pool');
      return;
    }

    if (poolData?.isClosed) {
      alert('This pool is already closed');
      return;
    }

    const confirmEnd = window.confirm('Are you sure you want to end this pool? This action cannot be undone.');
    if (!confirmEnd) return;

    try {
      setEndingPool(true);
      const result = await poolService.endPool(id);
      console.log('End pool result:', result);
      
      alert(result.message || 'Pool has been successfully ended!');
      
      // Refresh data to show updated status
      await fetchPoolData();
    } catch (err) {
      console.error('End pool error:', err);
      alert(err.message || 'Failed to end pool. Please try again.');
    } finally {
      setEndingPool(false);
    }
  };

  // Calculate progress percentage and current quantity
  const currentQuantity = poolData?.joinedVendors?.reduce((sum, vendor) => sum + vendor.quantity, 0) || poolData?.currentQuantity || 0;
  const targetQuantity = poolData?.totalRequiredQuantity || poolData?.targetQuantity || 500;
  const progressPercentage = Math.min((currentQuantity / targetQuantity) * 100, 100);
  
  // Determine if pool has ended
  const isPoolEnded = poolData?.isClosed || poolData?.isExpired || progressPercentage >= 100;

  const mockPoolData = {
    title: 'Fresh Vegetables Bulk Order',
    description: 'Weekly bulk order for fresh vegetables including onions, potatoes, tomatoes, and seasonal produce.',
    targetQuantity: 500,
    currentQuantity: 320,
    pricePerKg: 25,
    originalPrice: 35,
    savings: 29,
    minOrder: 10,
    supplier: 'Fresh Farms Co.',
    supplierRating: 4.8,
    location: 'Mumbai Central Market',
    deliveryDate: 'March 15, 2024',
    organizer: {
      name: 'Rajesh Kumar',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.9,
      poolsOrganized: 24
    }
  };

  const contributors = [
    {
      id: 1,
      name: 'Priya Sharma',
      quantity: 25,
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
      joinedDate: '2 days ago'
    },
    {
      id: 2,
      name: 'Mohammed Ali',
      quantity: 40,
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      joinedDate: '3 days ago'
    },
    {
      id: 3,
      name: 'Anita Patel',
      quantity: 30,
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      joinedDate: '4 days ago'
    },
    {
      id: 4,
      name: 'Vikram Singh',
      quantity: 35,
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      joinedDate: '5 days ago'
    }
  ];

  // Countdown timer effect - only run for active pools
  useEffect(() => {
    // Don't start timer if pool has ended
    if (isPoolEnded) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPoolEnded]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
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
              <Link to="/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">Dashboard</Link>
              <Link to="/marketplace" className="text-gray-700 hover:text-orange-500 transition-colors">Marketplace</Link>
              <Link to="/nearby" className="text-gray-700 hover:text-orange-500 transition-colors">Nearby</Link>
              <Link to="/wallet" className="text-gray-700 hover:text-orange-500 transition-colors">Wallet</Link>
              <Link to="/profile" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/dashboard" className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-6">
          ← Back to Dashboard
        </Link>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : poolData ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
            {/* Pool Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {poolData.productId?.name ? `${poolData.productId.name} Pool` : poolData.title || 'Pool'}
                  </h1>
                  <p className="text-gray-600">
                    {poolData.description || `Bulk order for ${poolData.productId?.name || 'product'}`}
                  </p>
                </div>
                {isJoined && (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Joined</span>
                  </div>
                )}
                {isCreator && (
                  <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Creator</span>
                  </div>
                )}
                {poolData.isClosed && (
                  <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Closed</span>
                  </div>
                )}
              </div>

              {/* Price Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-orange-500">
                  ₹{poolData.productId?.pricePerKg || poolData.pricePerKg || 25}/kg
                </div>
                <div className="text-lg text-gray-500 line-through">
                  ₹{poolData.originalPrice || ((poolData.productId?.pricePerKg || 25) * 1.4)}/kg
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                  Save {poolData.savings || 29}%
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                    {currentQuantity}/{targetQuantity} kg
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {Math.round(progressPercentage)}% complete
                </div>
              </div>

              {/* Pool Details */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{poolData.location || 'Mumbai Central Market'}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Min order: {poolData.minOrder || poolData.productId?.minOrderQuantity || 10} kg</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Delivery: {poolData.deliveryDate || 'Within 3-5 days'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{poolData.joinedVendors?.length || contributors.length} contributors</span>
                </div>
              </div>
            </div>

            {/* Contributors List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Contributors</h3>
              <div className="space-y-3">
                {poolData.joinedVendors && poolData.joinedVendors.length > 0 ? (
                  poolData.joinedVendors.map((vendor, index) => (
                    <div key={vendor.vendorId?._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {vendor.vendorId?.username || `Vendor ${index + 1}`}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {vendor.vendorId?.email || 'Email not available'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{vendor.quantity} kg</div>
                        <div className="text-xs text-gray-500">Joined recently</div>
                      </div>
                    </div>
                  ))
                ) : (
                  contributors.map(contributor => (
                    <div key={contributor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={contributor.image}
                          alt={contributor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{contributor.name}</h4>
                          <p className="text-sm text-gray-500">{contributor.joinedDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{contributor.quantity} kg</div>
                        <div className="text-xs text-gray-500">₹{contributor.quantity * (poolData?.productId?.pricePerKg || 25)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pool organizer info - fallback since API doesn't have this yet */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Organizer</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">System Pool</h4>
                  <div className="flex items-center mt-1">
                    {renderStars(4.8)}
                    <span className="text-sm text-gray-600 ml-1">(4.8)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Automated pool creation</p>
                </div>
              </div>
            </div>

            {/* Countdown Timer - Only show for active pools */}
            {!isPoolEnded && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Remaining</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="bg-orange-100 rounded-lg p-3 mb-2">
                      <div className="text-2xl font-bold text-orange-600">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Hours</div>
                  </div>
                  <div>
                    <div className="bg-orange-100 rounded-lg p-3 mb-2">
                      <div className="text-2xl font-bold text-orange-600">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div>
                    <div className="bg-orange-100 rounded-lg p-3 mb-2">
                      <div className="text-2xl font-bold text-orange-600">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Seconds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pool Status - Show for ended pools */}
            {isPoolEnded && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Status</h3>
                <div className="text-center py-4">
                  {poolData?.isClosed && (
                    <div className="flex items-center justify-center text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-medium">Pool Closed</span>
                    </div>
                  )}
                  {poolData?.isExpired && !poolData?.isClosed && (
                    <div className="flex items-center justify-center text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-medium">Pool Expired</span>
                    </div>
                  )}
                  {progressPercentage >= 100 && !poolData?.isClosed && !poolData?.isExpired && (
                    <div className="flex items-center justify-center text-blue-600 bg-blue-50 px-4 py-3 rounded-lg">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Pool Completed</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Join Pool - Only show for active pools where user hasn't joined and isn't creator */}
            {!isJoined && !isPoolEnded && !isCreator && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Join This Pool</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      min={poolData.minOrder || poolData.productId?.minOrderQuantity || 10}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={`Min ${poolData.minOrder || poolData.productId?.minOrderQuantity || 10} kg`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  {quantity && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span>Quantity:</span>
                        <span>{quantity} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price per kg:</span>
                        <span>₹{poolData.productId?.pricePerKg || poolData.pricePerKg || 25}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span>₹{quantity * (poolData.productId?.pricePerKg || poolData.pricePerKg || 25)}</span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        You save ₹{quantity * ((poolData.originalPrice || (poolData.productId?.pricePerKg || 25) * 1.4) - (poolData.productId?.pricePerKg || poolData.pricePerKg || 25))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleJoinPool}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Join Pool
                  </button>
                </div>
              </div>
            )}

            {/* End Pool - Only for creators of active pools */}
            {isCreator && !isPoolEnded && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Management</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      As the pool creator, you can end this pool at any time. This will close it to new members.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleEndPool}
                    disabled={endingPool}
                    className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-red-300"
                  >
                    {endingPool ? 'Ending Pool...' : 'End Pool'}
                  </button>
                </div>
              </div>
            )}

            {/* Supplier Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier</h3>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {poolData.productId?.supplierId?.username || poolData.supplier || 'Verified Supplier'}
                </h4>
                <div className="flex items-center mt-1">
                  {renderStars(poolData.supplierRating || 4.5)}
                  <span className="text-sm text-gray-600 ml-1">({poolData.supplierRating || 4.5})</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Trusted supplier with verified quality and timely delivery
                </p>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pool not found</h3>
            <p className="text-gray-600">The pool you're looking for doesn't exist or has been removed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolPage;