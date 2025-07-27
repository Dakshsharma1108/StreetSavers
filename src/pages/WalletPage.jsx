import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { walletService, paymentService } from '../services/apiServices.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getWalletBalance().catch(() => ({ balance: 0 })),
        walletService.getTransactionHistory().catch(() => ({ transactions: [] }))
      ]);
      
      setBalance(balanceData.balance || 0);
      setTransactions(transactionsData.transactions || []);
    } catch (err) {
      setError('Failed to load wallet data');
      console.error('Wallet error:', err);
      setBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Add Funds', icon: Plus, action: () => setShowAddFunds(true), color: 'bg-green-500' }
  ];

  const handleAddFunds = async () => {
    if (!addAmount || addAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const amount = parseFloat(addAmount);
    
    try {
      console.log('Adding funds with amount:', amount);
      
      // Step 1: Create an order on the server
      const orderData = await paymentService.createWalletOrder(amount);
      console.log('Order created successfully:', orderData);
      
      // Step 2: Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_OWSQc20OQGeF58", // Use env variable with fallback
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StreetSaver",
        description: "Wallet Funding",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Add amount to the payload for updating the wallet
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount
            };
            
            // Step 3: Verify the payment on server and update wallet
            const result = await paymentService.verifyWalletPayment(paymentData);
            
            alert(result.message || `₹${amount} added to your wallet successfully!`);
            setAddAmount('');
            setShowAddFunds(false);
            
            // Refresh wallet data
            fetchWalletData();
          } catch (err) {
            console.error('Payment verification error:', err);
            alert(err.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#F97316"
        }
      };
      
      // Step 4: Initialize Razorpay
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
      
    } catch (err) {
      console.error('Add funds error:', err);
      alert('Failed to add funds: ' + (err.message || 'Unknown error. Please try again.'));
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
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
              <Link to="/wallet" className="text-orange-500 font-medium">Wallet</Link>
              <Link to="/profile" onClick={logout} className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.username}'s Wallet
          </h1>
          <p className="text-gray-600">Manage your funds and track your transactions</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-orange-100 text-sm">Current Balance</p>
                  <h2 className="text-4xl font-bold">
                    {loading ? '...' : `₹${balance.toLocaleString()}`}
                  </h2>
                </div>
                <Wallet className="h-12 w-12 text-orange-200" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Account Status</p>
                  <p className="font-semibold">Active</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-100 text-sm">Last Updated</p>
                  <p className="font-semibold">Just now</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions yet</p>
                    <p className="text-gray-400 text-sm">Your transaction history will appear here</p>
                  </div>
                ) : (
                  transactions.map(transaction => {
                    const Icon = getTransactionIcon(transaction.type);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Icon className={`h-5 w-5 ${getTransactionColor(transaction.type)}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{transaction.title}</h4>
                            <p className="text-gray-600 text-sm">{transaction.description}</p>
                            <p className="text-gray-500 text-xs">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'credit' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{transaction.status}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center space-y-2`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{action.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Funds Modal */}
            {showAddFunds && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Funds</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setAddAmount(amount.toString())}
                        className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddFunds}
                      className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                      Add Funds
                    </button>
                    <button
                      onClick={() => setShowAddFunds(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;