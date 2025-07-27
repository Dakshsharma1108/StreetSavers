import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import toast from 'react-hot-toast';

const containerStyle = {
  width: '100%',
  height: '450px',
};

// Reverse geocode using OpenStreetMap
const getAddressFromCoordinates = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await response.json();
  return data.display_name || 'Address not found';
};

// Calculate distance using Haversine formula
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // returns distance in km
};

const Nearby = () => {
  const [location, setLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [userAddresses, setUserAddresses] = useState({});
  const [distances, setDistances] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');

  const fetchNearbyUsers = async (lat, lng) => {
    try {
      const vendorRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/distance/nearby?lat=${lat}&lng=${lng}&role=Vendor`);
      const supplierRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/distance/nearby?lat=${lat}&lng=${lng}&role=Supplier`);

      const vendorData = await vendorRes.json();
      const supplierData = await supplierRes.json();

      const combinedUsers = [...(vendorData.users || []), ...(supplierData.users || [])];
      setUsers(combinedUsers);

      // Get addresses and distances
      const addrMap = {};
      const distMap = {};
      for (const user of combinedUsers) {
        const [lng2, lat2] = user.location.coordinates;
        const addr = await getAddressFromCoordinates(lat2, lng2);
        addrMap[user._id] = addr;
        distMap[user._id] = calculateDistanceKm(lat, lng, lat2, lng2);
      }

      setUserAddresses(addrMap);
      setDistances(distMap);
    } catch (error) {
      toast.error('Error fetching vendors/suppliers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const userLocation = { lat: latitude, lng: longitude };
          setLocation(userLocation);
          fetchNearbyUsers(latitude, longitude);

          // Update address of user
          try {
            const displayAddress = await getAddressFromCoordinates(latitude, longitude);
            setAddress(displayAddress);
          } catch (e) {
            console.error('Failed to get address', e);
          }

          // Send location to backend
          try {
            const token = localStorage.getItem('token');
            await fetch('${import.meta.env.}/auth/update-location', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });
          } catch (err) {
            console.error('Failed to update location:', err);
          }
        },
        (err) => {
          toast.error('Location access denied');
          console.error(err);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <div className="p-6 md:p-10 text-black dark:text-white bg-gray-100 dark:bg-[#121212] min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-orange-600">Nearby Vendors & Suppliers</h2>

      {location && (
        <>
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">📍 Your Location:</span> {address}
          </div>

          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={14}>
              <Marker
                position={location}
                label="You"
                icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
              />

              {users.map((user, idx) => (
                <Marker
                  key={idx}
                  position={{
                    lat: user.location.coordinates[1],
                    lng: user.location.coordinates[0],
                  }}
                  onClick={() => setSelectedUser(user)}
                  label={user.role === 'Vendor' ? 'V' : 'S'}
                  icon={{
                    url:
                      user.role === 'Vendor'
                        ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  }}
                />
              ))}

              {selectedUser && (
                <InfoWindow
                  position={{
                    lat: selectedUser.location.coordinates[1],
                    lng: selectedUser.location.coordinates[0],
                  }}
                  onCloseClick={() => setSelectedUser(null)}
                >
                  <div className="text-sm text-gray-800">
                    <strong>{selectedUser.username}</strong>
                    <p>📞 {selectedUser.phone}</p>
                    <p className="italic text-xs">{selectedUser.businessType}</p>
                    <p className="text-xs">Role: {selectedUser.role}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      📍 {userAddresses[selectedUser._id]}
                    </p>
                    <p className="text-xs mt-1 text-gray-500">
                      📏 {distances[selectedUser._id]} km away
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </>
      )}

      {/* Card List */}
      <div className="mt-8">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">🔄 Loading nearby people...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 italic">No vendors or suppliers nearby found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {users.map((u, i) => (
              <div
                key={i}
                className="border dark:border-gray-700 bg-white dark:bg-[#1f1f1f] p-5 rounded-xl shadow transition hover:scale-[1.01]"
              >
                <h3 className="text-xl font-semibold mb-1">{u.username}</h3>
                <p className="text-gray-600 dark:text-gray-300">📍 {userAddresses[u._id]}</p>
                <p className="text-gray-600 dark:text-gray-300">📞 {u.phone}</p>
                <p className="text-gray-500 text-sm">🏢 {u.businessType}</p>
                <p className="text-sm text-gray-500">📏 {distances[u._id]} km away</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                    u.role === 'Vendor' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Nearby;
