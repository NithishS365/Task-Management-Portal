import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { getCurrentUserProfile, changePassword } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

export const ProfileHod = () => {
  const { user } = useAuth();
  const [hodData, setHodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch HOD profile data from MongoDB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching HOD profile data...');
        const profileData = await getCurrentUserProfile();
        console.log('✅ HOD Profile data received:', profileData);
        setHodData(profileData);
      } catch (error) {
        console.error('❌ Error fetching HOD profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) {
      fetchProfile();
    }
  }, [user]);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="h-screen">
        <Header />
        <div className="bg-gray-100 dark:bg-gray-900 h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!hodData) {
    return (
      <div className="h-screen">
        <Header />
        <div className="bg-gray-100 dark:bg-gray-900 h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300">Profile data not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Header />
      <div className="bg-gray-100 dark:bg-gray-900 h-[calc(100vh-5rem)] flex flex-col items-center py-6 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-700 p-8 flex flex-col items-center max-w-4xl w-full">
          {/* Profile Image */}
          <img
            src={hodData.img_url || hodData.image_url || '/default-avatar.png'}
            alt={hodData.t_name || hodData.name}
            className="w-36 h-38 rounded-md border-4 border-indigo-300 shadow mb-4"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          
          {/* Basic Info */}
          <h2 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300 mb-1">
            {hodData.t_name || hodData.name}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-1">
            {hodData.design || hodData.designation}
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-2">
            {hodData.dep || hodData.department}
          </p>

          {/* Change Password Button */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Change Password
          </button>
          
          {/* Details Section */}
          <div className="w-full border-t dark:border-gray-700 pt-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-semibold">Email:</span>{" "}
                  <a 
                    href={`mailto:${hodData.email}`} 
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {hodData.email}
                  </a>
                </p>
                {hodData.username && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Username:</span> {hodData.username}
                  </p>
                )}
                {hodData.phone && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Phone:</span> {hodData.phone}
                  </p>
                )}
                {hodData.spec && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Specialization:</span> {hodData.spec}
                  </p>
                )}
              </div>
              <div>
                {hodData.dob && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Date of Birth:</span> {hodData.dob}
                  </p>
                )}
                {hodData.exp && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Experience:</span> {hodData.exp}
                  </p>
                )}
                {hodData.linked_in_id && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">LinkedIn:</span>{" "}
                    <a
                      href={hodData.linked_in_id}
                      target="_blank"      
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {hodData.linked_in_id}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Bio Section */}
          {hodData.bio && (
            <div className="w-full mt-8 bg-indigo-50 dark:bg-gray-700 rounded-xl p-4 shadow">
              <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-2">About</h3>
              <p className="text-gray-700 dark:text-gray-300">{hodData.bio}</p>
            </div>
          )}
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
