import React, { useEffect, useState } from 'react';
import  Header  from '../components/Header';
import { useAuth } from '../context/AuthContext';
import staffData from '../../public/data/Staff.json';

export const Profile = () => {
  const [staff, setStaff] = useState(null);
  
  // ✅ FIXED: Use useAuth hook to get current user
  const { user } = useAuth();

  useEffect(() => {
    console.log('🔍 Profile: Current user from context:', user);
    
    // ✅ METHOD 1: Use user from AuthContext (PREFERRED)
    if (user && user.username) {
      console.log('🔍 Profile: Looking for staff with username:', user.username);
      const found = staffData.find(
        (s) => s.username === user.username || s.t_id === user.username || s.id === user.username
      );
      console.log('🔍 Profile: Found staff:', found);
      setStaff(found);
      return;
    }

    // ✅ METHOD 2: Fallback to localStorage (if AuthContext fails)
    const storedUser = localStorage.getItem('user');
    const currentStaffUsername = localStorage.getItem('currentStaffUsername');
    
    console.log('🔍 Profile: Stored user:', storedUser);
    console.log('🔍 Profile: Current staff username:', currentStaffUsername);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('🔍 Profile: Parsed user data:', userData);
        
        // Try to find by username from stored user data
        const found = staffData.find(
          (s) => s.username === userData.username || 
                 s.username === userData._id ||
                 s.t_id === userData.username ||
                 s.id === userData.username
        );
        
        console.log('🔍 Profile: Found staff from stored user:', found);
        setStaff(found);
      } catch (error) {
        console.error('❌ Profile: Error parsing stored user:', error);
      }
    } else if (currentStaffUsername) {
      // Try with currentStaffUsername
      const found = staffData.find(
        (s) => s.username === currentStaffUsername || 
               s.t_id === currentStaffUsername ||
               s.id === currentStaffUsername
      );
      
      console.log('🔍 Profile: Found staff from username:', found);
      setStaff(found);
    }
  }, [user]);

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
        <div className="px-8 py-6 flex justify-end bg-white dark:bg-gray-800 rounded-b-3xl">
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-blue-700 dark:to-cyan-600 dark:hover:from-blue-800 dark:hover:to-cyan-700 text-white text-sm px-8 py-3 rounded-lg shadow font-semibold transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
