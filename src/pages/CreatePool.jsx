import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft, Users, Package, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { poolService, productService } from '../services/apiServices.js';

const CreatePool = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    totalRequiredQuantity: '',
    minQuantityPerVendor: '',
    maxQuantityPerVendor: '',
    deadline: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  
  // Redirect if user is not a vendor
  useEffect(() => {
    if (user && user.role !== 'Vendor') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await productService.getAllProducts();
      console.log('Fetched products:', data); // Debug log to see actual structure
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]); // Set empty array instead of mock data
    } finally {
      setProductsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }
    if (!formData.totalRequiredQuantity || formData.totalRequiredQuantity <= 0) {
      newErrors.totalRequiredQuantity = 'Please enter a valid total quantity';
    }
    if (!formData.minQuantityPerVendor || formData.minQuantityPerVendor <= 0) {
      newErrors.minQuantityPerVendor = 'Please enter a valid minimum quantity';
    }
    if (formData.maxQuantityPerVendor && formData.maxQuantityPerVendor <= formData.minQuantityPerVendor) {
      newErrors.maxQuantityPerVendor = 'Maximum quantity should be greater than minimum';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Please select a deadline';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.deadline = 'Deadline should be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const poolData = {
        productId: formData.productId,
        totalRequiredQuantity: parseInt(formData.totalRequiredQuantity),
        minQuantityPerVendor: parseInt(formData.minQuantityPerVendor),
        maxQuantityPerVendor: formData.maxQuantityPerVendor ? parseInt(formData.maxQuantityPerVendor) : null,
        deadline: formData.deadline,
        description: formData.description
      };

      const response = await poolService.createPool(poolData);
      alert('Pool created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Create pool error:', err);
      alert('Failed to create pool. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p._id === formData.productId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">StreetSaver</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.username}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Pool</h1>
          <p className="text-gray-600">Start a new bulk purchasing pool to save money with other vendors</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="h-4 w-4 inline mr-2" />
                    Select Product
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    disabled={productsLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                      errors.productId ? 'border-red-500' : 'border-gray-300'
                    } ${productsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {productsLoading ? 'Loading products...' : 'Choose a product...'}
                    </option>
                    {!productsLoading && products.length === 0 && (
                      <option value="" disabled>No products available</option>
                    )}
                    {!productsLoading && products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ₹{product.pricePerKg || product.price || 0}/kg
                        {product.supplierId?.username && ` by ${product.supplierId.username}`}
                      </option>
                    ))}
                  </select>
                  {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
                  {!productsLoading && products.length === 0 && (
                    <p className="text-amber-600 text-sm mt-1">
                      No products available. Suppliers need to add products first.
                    </p>
                  )}
                </div>

                {/* Quantities */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="h-4 w-4 inline mr-2" />
                      Total Required Quantity (kg)
                    </label>
                    <input
                      type="number"
                      name="totalRequiredQuantity"
                      value={formData.totalRequiredQuantity}
                      onChange={handleChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors.totalRequiredQuantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 500"
                    />
                    {errors.totalRequiredQuantity && <p className="text-red-500 text-sm mt-1">{errors.totalRequiredQuantity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Quantity per Vendor (kg)
                    </label>
                    <input
                      type="number"
                      name="minQuantityPerVendor"
                      value={formData.minQuantityPerVendor}
                      onChange={handleChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors.minQuantityPerVendor ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 10"
                    />
                    {errors.minQuantityPerVendor && <p className="text-red-500 text-sm mt-1">{errors.minQuantityPerVendor}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Quantity per Vendor (kg) - Optional
                    </label>
                    <input
                      type="number"
                      name="maxQuantityPerVendor"
                      value={formData.maxQuantityPerVendor}
                      onChange={handleChange}
                      min={formData.minQuantityPerVendor || 1}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors.maxQuantityPerVendor ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 50"
                    />
                    {errors.maxQuantityPerVendor && <p className="text-red-500 text-sm mt-1">{errors.maxQuantityPerVendor}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Pool Deadline
                    </label>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors.deadline ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="Add any additional details about this pool..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Pool...' : 'Create Pool'}
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Preview</h3>
              
              {selectedProduct ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.supplierId?.username || selectedProduct.supplier || 'Unknown Supplier'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Category: {selectedProduct.category || 'Other'}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Price per kg:</span>
                      <span className="font-semibold text-orange-600">
                        ₹{selectedProduct.pricePerKg || selectedProduct.price || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Order Quantity:</span>
                      <span className="font-semibold">
                        {selectedProduct.minOrderQuantity || 'Not specified'} kg
                      </span>
                    </div>
                    {selectedProduct.description && (
                      <div className="pt-2 border-t">
                        <span className="text-gray-600 text-xs">Description:</span>
                        <p className="text-gray-700 text-sm">{selectedProduct.description}</p>
                      </div>
                    )}
                  </div>

                  {formData.totalRequiredQuantity && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span>Total Quantity:</span>
                        <span className="font-semibold">{formData.totalRequiredQuantity} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Estimated Total Cost:</span>
                        <span className="font-semibold text-orange-600">
                          ₹{((selectedProduct.pricePerKg || selectedProduct.price || 0) * formData.totalRequiredQuantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select a product to see preview</p>
              )}
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <h4 className="font-semibold text-orange-900 mb-2">💡 Tips for Successful Pools</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Set realistic quantity targets</li>
                <li>• Choose popular, high-demand products</li>
                <li>• Set appropriate minimum orders</li>
                <li>• Give vendors enough time to join</li>
                <li>• Communicate delivery details clearly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePool;
