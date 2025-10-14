import React, { useEffect, useState } from 'react';
import  Header  from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getCurrentUserProfile, changePassword } from '../services/api';

export const Profile = () => {
  const [staff, setStaff] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
  // ✅ FIXED: Use useAuth hook to get current user
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('🔍 Profile: Fetching user profile from MongoDB');
        
        // Fetch current user profile from MongoDB
        const userData = await getCurrentUserProfile();
        console.log('🔍 Profile: User data received:', userData);
        
        setStaff(userData);
      } catch (error) {
        console.error('❌ Profile: Error fetching user profile:', error);
        
        // Fallback to user from context if available
        if (user) {
          console.log('🔍 Profile: Using fallback user from context:', user);
          setStaff(user);
        }
      }
    };

    // Only fetch if user is authenticated
    if (user || localStorage.getItem('token')) {
      fetchUserProfile();
    }
  }, [user]);

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (passwordMessage.text) {
      setPasswordMessage({ type: '', text: '' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All fields are required' });
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 3) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 3 characters long' });
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage({ type: '', text: '' });
      }, 2000);

    } catch (error) {
      console.error('Password change error:', error);
      setPasswordMessage({ 
        type: 'error', 
        text: error.message || 'Failed to change password' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMessage({ type: '', text: '' });
  };

  // ✅ ENHANCED: Better loading/error states
  if (!user && !localStorage.getItem('user')) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 dark:text-gray-400 text-xl">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ No user logged in</div>
          <div className="text-sm">Please log in to view profile</div>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 dark:text-gray-400 text-xl">
        <div className="text-center">
          <div className="text-yellow-500 mb-2">⚠️ No staff data found</div>
          <div className="text-sm">Staff profile information is unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 h-screen dark:bg-gray-900 overflow-auto">
      <Header />
      <div className="max-w-4xl mx-auto mt-12 bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-blue-100 dark:border-gray-700">

        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-400 dark:from-blue-700 dark:to-cyan-500 p-8 flex flex-col md:flex-row items-center gap-6 rounded-t-3xl">
          <img
            src={staff.img_url}
            alt={staff.t_name}
            className="w-34 h-32 rounded-md border-2 border-white shadow-lg object-cover"
          />
          <div className="flex-1 flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-bold text-white mb-1">{staff.t_name || staff.name}</h2>
            <p className="text-indigo-100 dark:text-indigo-200 text-lg font-medium mb-1">{staff.design}</p>
            <p className="text-blue-100 dark:text-blue-200 text-sm">{staff.dep}</p>
            <div className="flex gap-2 mt-3">
              {staff.linked_in_id && (
                <a
                  href={`https://${staff.linked_in_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-blue-700 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-blue-50 dark:hover:bg-gray-600 transition"
                >
                  LinkedIn
                </a>
              )}
              <a
                href={`mailto:${staff.email}`}
                className="bg-white text-blue-700 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-blue-50 dark:hover:bg-gray-600 transition"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-8 pt-10 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 text-gray-700 dark:text-gray-300 text-base bg-white dark:bg-gray-800">
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Full Name</p>
            <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.t_name || staff.name}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Email Address</p>
            <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.email}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Department</p>
            <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.dep}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Designation</p>
            <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.design}</p>
          </div>
          {staff.phone && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Phone</p>
              <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.phone}</p>
            </div>
          )}
          {staff.qual && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Qualification</p>
              <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.qual}</p>
            </div>
          )}
          {staff.exp && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Experience</p>
              <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.exp}</p>
            </div>
          )}
          {staff.username && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Username</p>
              <p className="text-indigo-800 dark:text-indigo-300 font-semibold">{staff.username}</p>
            </div>
          )}
        </div>

        {/* Bio Section */}
        {staff.bio && (
          <div className="px-8 pb-8">
            <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-2">Bio</h3>
            <p className="text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-gray-700 rounded-xl p-4 shadow">{staff.bio}</p>
          </div>
        )}

        {/* ✅ FIXED: Completed the button className */}
        <div className="px-8 py-6 flex justify-end gap-4 bg-white dark:bg-gray-800 rounded-b-3xl">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 dark:from-red-600 dark:to-pink-600 dark:hover:from-red-700 dark:hover:to-pink-700 text-white text-sm  px-6 py-3 rounded-lg shadow font-semibold transition"
          >
            Change Password
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-blue-700 dark:to-cyan-600 dark:hover:from-blue-800 dark:hover:to-cyan-700 text-white text-sm px-8 py-3 rounded-lg shadow font-semibold transition">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Change Password</h3>
              <button 
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {/* Message Display */}
              {passwordMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
                    : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg font-medium transition"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
