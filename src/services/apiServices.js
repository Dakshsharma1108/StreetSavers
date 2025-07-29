import api from './api.js';

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },  

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },
  
  // Purchase a product using wallet funds
  purchaseProduct: async (productId, quantity) => {
    try {
      const response = await api.post('/products/purchase', { productId, quantity });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to purchase product');
    }
  },
};

export const poolService = {
  // Get all pools
  getAllPools: async () => {
    try {
      const response = await api.get('/pools');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pools');
    }
  },

  // Get pool by ID
  getPoolById: async (id) => {
    try {
      const response = await api.get(`/pools/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pool');
    }
  },

  // Create new pool
  createPool: async (poolData) => {
    try {
      const response = await api.post('/pools', poolData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create pool');
    }
  },

  // Join pool
  joinPool: async (poolId, quantity) => {
    try {
      const response = await api.post(`/pools/${poolId}/join`, { quantity });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join pool');
    }
  },

  // End pool (only for pool creator)
  endPool: async (poolId) => {
    try {
      const response = await api.patch(`/pools/${poolId}/end`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to end pool');
    }
  },
};

export const profileService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const response = await api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Get user stats
  getUserStats: async () => {
    try {
      const response = await api.get('/profile/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user stats');
    }
  },

  // Get user activity
  getUserActivity: async () => {
    try {
      const response = await api.get('/profile/activity');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user activity');
    }
  },
};

export const walletService = {
  // Get wallet balance
  getWalletBalance: async () => {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet balance');
    }
  },

  // Get transaction history
  getTransactionHistory: async () => {
    try {
      const response = await api.get('/wallet/transactions');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  // Add money to wallet
  addMoney: async (amount) => {
    try {
      const response = await api.post('/wallet/add', { amount });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add money');
    }
  },
};

export const paymentService = {
  // Create payment order
  createOrder: async (amount) => {
    try {
      const response = await api.post('/payment/order', { amount });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post('/payment/verify', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  },

  // Create wallet order
  createWalletOrder: async (amount) => {
    try {
      console.log('Creating wallet order with amount:', amount);
      const response = await api.post('/payment/wallet/order', { amount });
      console.log('Wallet order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Wallet order error details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create wallet payment order');
    }
  },

  // Verify wallet payment
  verifyWalletPayment: async (paymentData) => {
    try {
      const response = await api.post('/payment/wallet/verify', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Wallet payment verification failed');
    }
  },
};
