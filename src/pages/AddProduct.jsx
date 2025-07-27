import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { productService } from '../services/apiServices.js';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Redirect if user is not a supplier
  useEffect(() => {
    if (user && user.role !== 'Supplier') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Vegetables', // Default category
    pricePerKg: '',
    minOrderQuantity: 1,
    availableQuantity: '',
    imageUrl: '' // Optional
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (['pricePerKg', 'minOrderQuantity', 'availableQuantity'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Math.max(0, Number(value))
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate form inputs
      if (!formData.name || !formData.pricePerKg || !formData.availableQuantity) {
        throw new Error('Please fill all required fields');
      }
      
      // Create product data object
      const productData = {
        ...formData,
        // Convert string numbers to actual numbers
        pricePerKg: Number(formData.pricePerKg),
        minOrderQuantity: Number(formData.minOrderQuantity),
        availableQuantity: Number(formData.availableQuantity)
      };
      
      // Call API to create product
      await productService.createProduct(productData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form after 2 seconds and navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Categories for dropdown
  const categories = [
    'Vegetables',
    'Fruits',
    'Grains',
    'Dairy',
    'Meat',
    'Spices',
    'Packaged Food',
    'Beverages',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">StreetSaver</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-600 mt-1">
              Add a new product to your inventory for vendors to purchase
            </p>
          </div>
          
          {/* Success message */}
          {success && (
            <div className="bg-green-50 p-4 border-l-4 border-green-500">
              <div className="flex">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <p className="text-green-800 font-medium">Product added successfully!</p>
                  <p className="text-green-700 text-sm mt-1">Redirecting to dashboard...</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 p-4 border-l-4 border-red-500">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your product..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="pricePerKg" className="block text-sm font-medium text-gray-700">
                    Price per Kg (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="pricePerKg"
                    name="pricePerKg"
                    min="0"
                    step="0.01"
                    value={formData.pricePerKg}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minOrderQuantity" className="block text-sm font-medium text-gray-700">
                    Minimum Order Quantity (kg)
                  </label>
                  <input
                    type="number"
                    id="minOrderQuantity"
                    name="minOrderQuantity"
                    min="1"
                    value={formData.minOrderQuantity}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
                    Available Quantity (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="availableQuantity"
                    name="availableQuantity"
                    min="0"
                    value={formData.availableQuantity}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://example.com/product-image.jpg"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
