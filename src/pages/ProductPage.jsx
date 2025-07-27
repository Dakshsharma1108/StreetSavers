import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChefHat, ArrowLeft, AlertCircle, Check, Trash, Edit, Clock, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { productService } from '../services/apiServices.js';

const ProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    pricePerKg: '',
    minOrderQuantity: '',
    availableQuantity: '',
    imageUrl: ''
  });

  // Check if current user is the product owner (a supplier)
  const isProductOwner = (product) => {
    if (!user || !product) return false;
    
    // Get the product's supplierId (could be an object or string)
    const productSupplierId = typeof product.supplierId === 'object' 
      ? product.supplierId?._id 
      : product.supplierId;
      
    return user.role === 'Supplier' && productSupplierId === user._id;
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      const productData = data.product;
      
      setProduct(productData);
      
      // Initialize form data with product details
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        category: productData.category || 'Vegetables',
        pricePerKg: productData.pricePerKg || '',
        minOrderQuantity: productData.minOrderQuantity || 1,
        availableQuantity: productData.availableQuantity || '',
        imageUrl: productData.imageUrl || ''
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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

  // Handle form submission for editing product
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
      
      // Call API to update product
      const response = await productService.updateProduct(productId, productData);
      
      // Update local product data
      setProduct({
        ...product,
        ...productData
      });
      
      // Show success message
      setActionMessage({
        type: 'success',
        message: 'Product updated successfully!'
      });
      
      // Exit edit mode
      setEditMode(false);
      
    } catch (err) {
      setActionMessage({
        type: 'error',
        message: err.message || 'Failed to update product'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    try {
      setLoading(true);
      await productService.deleteProduct(productId);
      
      // Show success message
      setActionMessage({
        type: 'success',
        message: 'Product deleted successfully! Redirecting to dashboard...'
      });
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setActionMessage({
        type: 'error',
        message: err.message || 'Failed to delete product'
      });
      setDeleteConfirm(false);
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

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        
        {/* Notification Messages */}
        {actionMessage.type && (
          <div className={`mb-6 p-4 border-l-4 rounded-md ${
            actionMessage.type === 'success' 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex">
              {actionMessage.type === 'success' ? (
                <Check className={`h-6 w-6 text-green-500 mr-3`} />
              ) : (
                <AlertCircle className={`h-6 w-6 text-red-500 mr-3`} />
              )}
              <p className={`text-sm ${
                actionMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {actionMessage.message}
              </p>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Delete Product</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 p-4 border-l-4 border-red-500 rounded-md mb-6">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Product Display or Edit Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {!editMode ? (
            /* Display Mode */
            <>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
                {isProductOwner(product) && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditMode(true)}
                      className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="px-6 py-6">
                {/* Product details layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left column - Main product info */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Product name and category */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{product?.name}</h2>
                      <span className="inline-block mt-2 px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full">
                        {product?.category || 'Uncategorized'}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                      <p className="text-gray-700">
                        {product?.description || 'No description provided.'}
                      </p>
                    </div>
                    
                    {/* Product price and details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Price per kg</p>
                          <p className="font-semibold text-lg">₹{product?.pricePerKg}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Minimum Order</p>
                          <p className="font-semibold">{product?.minOrderQuantity} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Available Quantity</p>
                          <p className="font-semibold">{product?.availableQuantity} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Sold</p>
                          <p className="font-semibold">{product?.totalSold || 0} kg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column - Image and stats */}
                  <div className="space-y-6">
                    {/* Product image */}
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center h-48 overflow-hidden">
                      {product?.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <ShoppingCart className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Product stats */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Product Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created</span>
                          <span className="text-gray-700 font-medium">
                            {product?.createdAt ? formatDate(product.createdAt) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Updated</span>
                          <span className="text-gray-700 font-medium">
                            {product?.updatedAt ? formatDate(product.updatedAt) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ID</span>
                          <span className="text-gray-700 font-medium text-xs truncate max-w-[120px]" title={product?._id}>
                            {product?._id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Orders (placeholder) */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 text-center">
                      <Clock className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No recent orders for this product</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Edit Mode */
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Update your product details
                </p>
              </div>
              
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
                      onClick={() => setEditMode(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mr-3"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
