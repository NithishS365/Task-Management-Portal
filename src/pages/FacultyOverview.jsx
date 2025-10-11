import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export const FacultyOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");

  // Fetch faculty data from MongoDB
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/users/faculty', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setFacultyData(data.data);
        } else {
          setFacultyData([]);
          toast.error('Failed to fetch faculty data');
        }
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setError(error.message);
        setFacultyData([]);
        toast.error(`Failed to load faculty data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role === 'hod') {
      fetchFacultyData();
    }
  }, [user]);

  // Get unique departments and designations for filters (with safety checks)
  const departments = facultyData && Array.isArray(facultyData) ? 
    [...new Set(facultyData.map(staff => staff.department).filter(Boolean))] : [];
  const designations = facultyData && Array.isArray(facultyData) ? 
    [...new Set(facultyData.map(staff => staff.designation).filter(Boolean))] : [];

  // Filter faculty based on search and filters (with safety checks)
  const filteredFaculty = (facultyData && Array.isArray(facultyData)) ? facultyData.filter(staff => {
    const matchesSearch = staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || staff.department === departmentFilter;
    const matchesDesignation = designationFilter === "all" || staff.designation === designationFilter;
    return matchesSearch && matchesDepartment && matchesDesignation;
  }) : [];

  // Access control for HOD only
  if (user && user.role !== 'hod') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">Only HOD can access faculty overview.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 overflow-y-auto">
      <Header />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 mt-2 px-6">
        <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-4">
          Staff Profiles
        </h1>
        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search faculty by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            
            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            {/* Designation Filter */}
            <div>
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Designations</option>
                {designations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Faculty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-7xl mx-auto">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center animate-pulse">
                <div className="w-28 h-36 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Faculty Grid */}
            {filteredFaculty.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-7xl mx-auto">
                {filteredFaculty.map((staff) => (
                  <div
                    key={staff._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center cursor-pointer"
                    onClick={() => navigate(`/HodDash/faculty_overview/staff/${staff._id}`, { state: { staff } })}
                  >
                    <img
                      src={staff.profileImage || staff.imageUrl || 'https://via.placeholder.com/150'}
                      alt={staff.fullName || staff.name}
                      className="w-28 h-36 border-4 mb-4 shadow object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <h2 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-1">
                      {staff.fullName || staff.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                      {staff.designation || 'Faculty'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                      {staff.department || 'Department N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Faculty Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">No faculty members match your current search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('all');
                    setDesignationFilter('all');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >Clear Filters</button>
              </div>
            )}
          </>
        )}
    
       
      </div>
    </div>
  );
};
