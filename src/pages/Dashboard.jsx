import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Users, ShoppingCart, TrendingUp, AlertCircle, CheckCircle, X, Package, Plus, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { poolService, walletService, productService } from '../services/apiServices.js';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [pools, setPools] = useState([]);
  const [userPools, setUserPools] = useState([]);
  const [otherPools, setOtherPools] = useState([]);
  const [createdPools, setCreatedPools] = useState([]);
  const [endedPools, setEndedPools] = useState([]);
  const [products, setProducts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [joinQuantity, setJoinQuantity] = useState(1);
  const [joinStatus, setJoinStatus] = useState(null); // 'success', 'error', or null
  const [joinMessage, setJoinMessage] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine if user is a supplier
  const isSupplier = user?.role === 'Supplier';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Only fetch data if user is available
    if (user && user._id) {
      fetchDashboardData();
    } else if (user === null) {
      // User is explicitly null (not logged in)
      setError('Please log in to view dashboard');
      setLoading(false);
    }
    // If user is undefined, we're still loading auth state
  }, [user]);

  const retryFetch = () => {
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors

      // Check if user is properly authenticated
      if (!user || !user._id) {
        setError('User not properly authenticated. Please log out and log in again.');
        setLoading(false);
        return;
      }

      // Always get wallet balance for both roles
      const walletData = await walletService.getWalletBalance().catch((err) => {
        console.error("Failed to fetch wallet balance:", err);
        return { balance: 0 };
      });
      setWalletBalance(walletData.balance || 0);

      if (isSupplier) {
        const productsData = await productService.getAllProducts().catch((err) => {
          console.error("Error fetching products:", err);
          setError(`Failed to load products: ${err.message || 'Unknown error'}`);
          return { products: [] };
        });

        const supplierProducts = (productsData.products || []).filter(product => {
          const productSupplierId = typeof product.supplierId === 'object'
            ? product.supplierId?._id
            : product.supplierId;
          return productSupplierId === user?._id;
        });

        const transformedProducts = supplierProducts.map(product => ({
          _id: product._id,
          id: product._id,
          name: product.name || 'Product',
          price: product.pricePerKg || 0,
          minOrderQuantity: product.minOrderQuantity || 1,
          description: `Min order: ${product.minOrderQuantity || 1}kg • ₹${product.pricePerKg || 0}/kg`,
          totalSold: product.totalSold || 0,
          category: product.category || 'Other',
          createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
          supplierName: product.supplier?.name || 'Unknown',
          supplierLocation: product.supplier?.location || []
        }));

        setProducts(transformedProducts);

      } else {
        const poolsData = await poolService.getAllPools().catch((err) => {
          console.error("Failed to fetch pools:", err);
          setError(`Failed to load pools: ${err.message || 'Unknown error'}`);
          return { pools: [] };
        });

        const transformedPools = (poolsData.pools || []).map(pool => {
          const currentQuantity = pool.joinedVendors?.reduce((sum, vendor) => sum + vendor.quantity, 0) || 0;
          const pricePerKg = pool.productId?.pricePerKg || 25;
          const progressPercent = Math.round((currentQuantity / pool.totalRequiredQuantity) * 100);
          
          // Determine pool status more comprehensively
          let status = 'active';
          if (pool.isClosed) {
            status = 'closed';
          } else if (progressPercent >= 100) {
            status = 'completed';
          } else if (pool.isExpired) {
            status = 'expired';
          }

          const isUserJoined = pool.joinedVendors?.some(vendor => {
            if (!vendor || !vendor.vendorId || !user?._id) return false;
            const vendorId = typeof vendor.vendorId === 'object' ? vendor.vendorId?._id : vendor.vendorId;
            return vendorId === user._id;
          }) || false;

          const isUserCreated = (() => {
            if (!pool.createdBy || !user?._id) return false;
            const createdById = typeof pool.createdBy === 'object' ? pool.createdBy?._id : pool.createdBy;
            return createdById === user._id;
          })();

          return {
            _id: pool._id,
            id: pool._id,
            name: pool.productId?.name ? `${pool.productId.name} Pool` : 'Product Pool',
            status: status,
            memberCount: pool.joinedVendors?.length || 0,
            description: `${currentQuantity}/${pool.totalRequiredQuantity}kg • ${pool.joinedVendors?.length || 0} members`,
            targetAmount: pool.totalRequiredQuantity * pricePerKg,
            currentQuantity: currentQuantity,
            progressPercent: progressPercent,
            productName: pool.productId?.name || 'Unknown Product',
            totalRequiredQuantity: pool.totalRequiredQuantity,
            isUserJoined: isUserJoined,
            isUserCreated: isUserCreated,
            userQuantity: isUserJoined
              ? (() => {
                  const vendor = pool.joinedVendors?.find(vendor => {
                    if (!vendor || !vendor.vendorId || !user?._id) return false;
                    const vendorId = typeof vendor.vendorId === 'object' ? vendor.vendorId?._id : vendor.vendorId;
                    return vendorId === user._id;
                  });
                  return vendor?.quantity || 0;
                })()
              : 0
          };
        });

        const userJoinedPools = transformedPools.filter(pool => 
          pool.isUserJoined && pool.status === 'active'
        );
        const userCreatedPools = transformedPools.filter(pool => 
          pool.isUserCreated && pool.status === 'active'
        );
        const availablePools = transformedPools.filter(pool =>
          !pool.isUserJoined && pool.status === 'active'
        );
        const endedPools = transformedPools.filter(pool =>
          pool.isUserCreated && pool.status !== 'active'
        );

        setPools(transformedPools);
        setUserPools(userJoinedPools);
        setCreatedPools(userCreatedPools);
        setOtherPools(availablePools);
        setEndedPools(endedPools);

      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load dashboard data';
      if (err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log out and log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You may not have permission to view this data.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const openJoinPoolModal = (pool) => {
    setSelectedPool(pool);
    const defaultQuantity = 1;
    setJoinQuantity(defaultQuantity);
    setShowJoinModal(true);
    setJoinStatus(null);
  };

  const handleJoinPool = async () => {
    if (!selectedPool || !joinQuantity || joinQuantity <= 0) return;

    setJoinLoading(true);
    setJoinStatus(null);

    try {
      // Calculate the cost to join the pool
      const pricePerKg = selectedPool.targetAmount / selectedPool.totalRequiredQuantity || 25;
      const cost = pricePerKg * joinQuantity;

      if (walletBalance < cost) {
        setJoinStatus('error');
        setJoinMessage('Insufficient wallet balance. Please add funds to your wallet.');
        setJoinLoading(false);
        return;
      }

      // Join the pool (backend handles wallet deduction and transaction recording)
      const result = await poolService.joinPool(selectedPool._id, joinQuantity);

      // Update wallet balance from backend response if available
      if (result.transaction && typeof result.transaction.balance === 'number') {
        setWalletBalance(result.transaction.balance);
      } else {
        // Fallback: refresh wallet balance from backend
        try {
          const walletData = await walletService.getWalletBalance();
          setWalletBalance(walletData.balance || 0);
        } catch (walletError) {
          console.warn('Failed to refresh wallet balance:', walletError);
          // Last resort: update locally
          setWalletBalance(prevBalance => Math.max(0, prevBalance - cost));
        }
      }

      setJoinStatus('success');
      setJoinMessage(result.message || 'Successfully joined the pool!');

      // Refresh pools data to show updated information
      fetchDashboardData();

      // Only auto-close modal if pool is still active
      // For ended pools, let user manually close the modal
      if (selectedPool.status === 'active') {
        // After 3 seconds, close the modal for active pools
        setTimeout(() => {
          setShowJoinModal(false);
          setJoinStatus(null);
        }, 3000);
      }
    } catch (err) {
      setJoinStatus('error');
      setJoinMessage(err.message || 'Failed to join pool. Please check your wallet balance and try again.');
    } finally {
      setJoinLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">StreetSaver</span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link to="/marketplace" className="text-gray-600 hover:text-orange-500 transition-colors">
                Marketplace
              </Link>
              <Link to="/nearby" className="text-gray-600 hover:text-orange-500 transition-colors">
                Nearby
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user?.username || 'User'}</span>
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
                      to="/wallet"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Wallet
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-600">
            {isSupplier
              ? "Here's what's happening with your products and sales today."
              : "Here's what's happening with your savings pools today."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {isSupplier ? (
                <>
                  <Link
                    to="/add-product"
                    className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-center"
                  >
                    Add New Product
                  </Link>
                  <Link
                    to="/marketplace"
                    className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    View Marketplace
                  </Link>
                  <Link
                    to="/wallet"
                    className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Manage Wallet
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/create-pool"
                    className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-center"
                  >
                    Create New Pool
                  </Link>
                  <Link
                    to="/marketplace"
                    className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Browse Marketplace
                  </Link>
                  <Link
                    to="/wallet"
                    className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Manage Wallet
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={retryFetch}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 gap-6 mb-8 ${isSupplier ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {isSupplier ? (
            // Supplier stats
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Products</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '...' : products.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ₹{loading ? '...' : walletBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '...' : products.reduce((sum, product) => sum + (product.totalSold || 0), 0)}kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ₹{loading ? '...' : products.reduce((sum, product) => sum + ((product.totalSold || 0) * (product.price || product.pricePerKg || 0)), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Vendor stats
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Your Pools</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '...' : userPools.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ₹{loading ? '...' : walletBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Created Pools</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '...' : createdPools.length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isSupplier ? (
            // Supplier Content
            <>
              {/* Products Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
                    <Link
                      to="/add-product"
                      className="inline-flex items-center text-sm bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Link>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="border rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
                        <p className="text-gray-600 mb-4">Add your first product to start selling to vendors</p>
                        <Link to="/add-product" className="text-orange-600 hover:text-orange-700 font-medium">
                          Add Your First Product →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {products.map(product => (
                          <div key={product._id || product.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">{product.name || 'Product'}</h3>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {product.category || 'Other'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{product.description || 'No description'}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Total sold: {product.totalSold || 0}kg
                              </span>
                              <Link
                                to={`/product/${product._id || product.id}`}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                              >
                                Manage Product
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Supplier Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                      <p className="text-gray-600">Your recent sales and product updates will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Vendor Content
            <>
              {/* Pools Section - Four columns side by side */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                  {/* Joined Pools */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Joined Pools</h2>
                      <p className="text-sm text-gray-600">Pools you participate in</p>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2].map(i => (
                            <div key={i} className="border rounded-lg p-3 animate-pulse">
                              <div className="h-3 bg-gray-200 rounded mb-2"></div>
                              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : userPools.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No Joined Pools</h3>
                          <p className="text-xs text-gray-600">You haven't joined any pools yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userPools.slice(0, 4).map(pool => (
                            <div key={pool._id || pool.id} className="border rounded-lg p-3 bg-green-50 border-green-200">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900 text-sm">{pool.name || 'Pool'}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  pool.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  pool.status === 'closed' ? 'bg-red-100 text-red-800' :
                                  pool.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {pool.status === 'completed' ? 'Completed' :
                                   pool.status === 'closed' ? 'Closed' :
                                   pool.status === 'expired' ? 'Expired' : 'Joined'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                Your: {pool.userQuantity}kg
                              </p>
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{pool.progressPercent}%</span>
                                  <span>{pool.currentQuantity}/{pool.totalRequiredQuantity}kg</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-green-500 h-1.5 rounded-full"
                                    style={{ width: `${pool.progressPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                              <Link
                                to={`/pool/${pool._id || pool.id}`}
                                className="text-green-600 hover:text-green-700 text-xs font-medium"
                              >
                                View Details →
                              </Link>
                            </div>
                          ))}
                          {userPools.length > 4 && (
                            <div className="text-center pt-2">
                              <Link to="/marketplace" className="text-green-600 hover:text-green-700 text-xs font-medium">
                                View All ({userPools.length}) →
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Pools */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Available Pools</h2>
                      <p className="text-sm text-gray-600">Pools you can join</p>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2].map(i => (
                            <div key={i} className="border rounded-lg p-3 animate-pulse">
                              <div className="h-3 bg-gray-200 rounded mb-2"></div>
                              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : otherPools.length === 0 ? (
                        <div className="text-center py-6">
                          <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No Available Pools</h3>
                          <p className="text-xs text-gray-600 mb-2">No new pools to join</p>
                          <Link to="/create-pool" className="text-orange-600 hover:text-orange-700 font-medium text-xs">
                            Create Pool →
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {otherPools.slice(0, 4).map(pool => (
                            <div key={pool._id || pool.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900 text-sm">{pool.name || 'Pool'}</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  Available
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {pool.memberCount || 0} vendors • ₹{pool.targetAmount?.toLocaleString() || '0'}
                              </p>
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() => openJoinPoolModal(pool)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded"
                                >
                                  Join
                                </button>
                                <Link
                                  to={`/pool/${pool._id || pool.id}`}
                                  className="text-orange-600 hover:text-orange-700 text-xs font-medium"
                                >
                                  Details →
                                </Link>
                              </div>
                            </div>
                          ))}
                          {otherPools.length > 4 && (
                            <div className="text-center pt-2">
                              <Link to="/marketplace" className="text-orange-600 hover:text-orange-700 text-xs font-medium">
                                View All ({otherPools.length}) →
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Created Pools */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Created Pools</h2>
                      <p className="text-sm text-gray-600">Pools you created</p>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2].map(i => (
                            <div key={i} className="border rounded-lg p-3 animate-pulse">
                              <div className="h-3 bg-gray-200 rounded mb-2"></div>
                              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : createdPools.length === 0 ? (
                        <div className="text-center py-6">
                          <Plus className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No Created Pools</h3>
                          <p className="text-xs text-gray-600 mb-2">You haven't created any pools yet</p>
                          <Link to="/create-pool" className="text-orange-600 hover:text-orange-700 font-medium text-xs">
                            Create First Pool →
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {createdPools.slice(0, 4).map(pool => (
                            <div key={pool._id || pool.id} className="border rounded-lg p-3 bg-purple-50 border-purple-200">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900 text-sm">{pool.name || 'Pool'}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  pool.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  pool.status === 'closed' ? 'bg-red-100 text-red-800' :
                                  pool.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                                  pool.isUserJoined ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {pool.status === 'completed' ? 'Completed' :
                                   pool.status === 'closed' ? 'Closed' :
                                   pool.status === 'expired' ? 'Expired' :
                                   pool.isUserJoined ? 'Created & Joined' : 'Created'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {pool.memberCount || 0} members • {pool.progressPercent}% complete
                              </p>
                              <div className="mb-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-purple-500 h-1.5 rounded-full"
                                    style={{ width: `${pool.progressPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                {!pool.isUserJoined && pool.status === 'active' ? (
                                  <button
                                    onClick={() => openJoinPoolModal(pool)}
                                    className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 rounded"
                                  >
                                    Join Own Pool
                                  </button>
                                ) : pool.isUserJoined ? (
                                  <span className="text-xs text-purple-600 font-medium">
                                    Joined ({pool.userQuantity}kg)
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">Pool Ended</span>
                                )}
                                <Link
                                  to={`/pool/${pool._id || pool.id}`}
                                  className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                                >
                                  Manage Pool →
                                </Link>
                              </div>
                            </div>
                          ))}
                          {createdPools.length > 4 && (
                            <div className="text-center pt-2">
                              <Link to="/marketplace" className="text-purple-600 hover:text-purple-700 text-xs font-medium">
                                View All ({createdPools.length}) →
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ended Pools */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Ended Pools</h2>
                      <p className="text-sm text-gray-600">Your completed pool history</p>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2].map(i => (
                            <div key={i} className="border rounded-lg p-3 animate-pulse">
                              <div className="h-3 bg-gray-200 rounded mb-2"></div>
                              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : endedPools.length === 0 ? (
                        <div className="text-center py-6">
                          <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No Ended Pools</h3>
                          <p className="text-xs text-gray-600">Your completed pools will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {endedPools.slice(0, 4).map(pool => (
                            <div key={pool._id || pool.id} className={`border rounded-lg p-3 ${
                              pool.status === 'completed' ? 'bg-blue-50 border-blue-200' :
                              pool.status === 'closed' ? 'bg-red-50 border-red-200' :
                              'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900 text-sm">{pool.name || 'Pool'}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  pool.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  pool.status === 'closed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {pool.status === 'completed' ? 'Completed' :
                                   pool.status === 'closed' ? 'Closed' : 'Expired'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {pool.isUserCreated && pool.isUserJoined ? `Created & Joined (${pool.userQuantity}kg)` :
                                 pool.isUserCreated ? 'Created by you' :
                                 `Your contribution: ${pool.userQuantity}kg`}
                              </p>
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{pool.progressPercent}%</span>
                                  <span>{pool.currentQuantity}/{pool.totalRequiredQuantity}kg</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      pool.status === 'completed' ? 'bg-blue-500' :
                                      pool.status === 'closed' ? 'bg-red-500' :
                                      'bg-gray-500'
                                    }`}
                                    style={{ width: `${pool.progressPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                              <Link
                                to={`/pool/${pool._id || pool.id}`}
                                className={`text-xs font-medium ${
                                  pool.status === 'completed' ? 'text-blue-600 hover:text-blue-700' :
                                  pool.status === 'closed' ? 'text-red-600 hover:text-red-700' :
                                  'text-gray-600 hover:text-gray-700'
                                }`}
                              >
                                View Details →
                              </Link>
                            </div>
                          ))}
                          {endedPools.length > 4 && (
                            <div className="text-center pt-2">
                              <Link to="/marketplace" className="text-gray-600 hover:text-gray-700 text-xs font-medium">
                                View All ({endedPools.length}) →
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Join Pool Modal - Only shown for vendors */}
      {!isSupplier && showJoinModal && selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Join Pool</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {joinStatus === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">{joinMessage}</p>
              </div>
            ) : joinStatus === 'error' ? (
              <div className="text-center py-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600">{joinMessage}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="bg-orange-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedPool.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedPool.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Progress:</span>
                      <span className="font-medium">{selectedPool.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
                      <div
                        className="bg-orange-500 h-2.5 rounded-full"
                        style={{ width: `${selectedPool.progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">₹{selectedPool.targetAmount?.toLocaleString() || '0'}</span> target
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{selectedPool.memberCount}</span> members
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 bg-blue-50 p-3 rounded-lg">
                    <span className="text-blue-800">Your Wallet Balance:</span>
                    <span className="font-semibold text-blue-800">₹{walletBalance.toLocaleString()}</span>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-600 mb-2">Quantity to Order (kg):</label>
                    <input
                      type="number"
                      min="1"
                      value={joinQuantity}
                      onChange={(e) => setJoinQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-orange-200"
                    />
                    {selectedPool && selectedPool.targetAmount && selectedPool.totalRequiredQuantity && (
                      <p className="text-xs text-gray-500 mt-1">
                        Price per kg: ₹{(selectedPool.targetAmount / selectedPool.totalRequiredQuantity).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between font-semibold text-lg mb-6 pt-2 border-t">
                    <span>Total Cost:</span>
                    {selectedPool && selectedPool.targetAmount && selectedPool.totalRequiredQuantity ? (
                      <span>₹{(joinQuantity * (selectedPool.targetAmount / selectedPool.totalRequiredQuantity)).toFixed(2)}</span>
                    ) : (
                      <span>₹{(joinQuantity * 25).toFixed(2)}</span>
                    )}
                  </div>

                  {selectedPool && selectedPool.targetAmount && selectedPool.totalRequiredQuantity &&
                    walletBalance < (joinQuantity * (selectedPool.targetAmount / selectedPool.totalRequiredQuantity)) && (
                      <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
                        <AlertCircle className="inline-block mr-2 h-4 w-4" />
                        Insufficient wallet balance. Please add funds to your wallet.
                      </div>
                    )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={joinLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinPool}
                    disabled={joinLoading || (selectedPool && selectedPool.targetAmount && selectedPool.totalRequiredQuantity &&
                      walletBalance < (joinQuantity * (selectedPool.targetAmount / selectedPool.totalRequiredQuantity)))}
                    className={`flex-1 py-2 rounded-lg text-white ${joinLoading || (selectedPool && selectedPool.targetAmount && selectedPool.totalRequiredQuantity &&
                        walletBalance < (joinQuantity * (selectedPool.targetAmount / selectedPool.totalRequiredQuantity)))
                        ? 'bg-orange-300'
                        : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                  >
                    {joinLoading ? 'Processing...' : 'Join Pool'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;