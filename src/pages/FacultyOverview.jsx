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

  // UI state for Add/Delete modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', username: '', email: '', password: '', department: '', designation: '' });
  const [deleteId, setDeleteId] = useState('');
  const [selectedDeleteStaff, setSelectedDeleteStaff] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refreshFaculty = async () => {
    // Reuse existing fetch logic by calling the endpoint directly
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/faculty', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setFacultyData(data.data);
    } catch (err) {
      console.error('Error refreshing faculty:', err);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    console.log('handleAddStaff called', newStaff);
    setActionLoading(true);
    // Basic client-side validation
    if (!newStaff.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaff.email)) {
      toast.error('Please enter a valid email address');
      setActionLoading(false);
      return;
    }
    if (!newStaff.password || newStaff.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setActionLoading(false);
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newStaff)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Staff added successfully');
        setShowAddModal(false);
        setSelectedDeleteStaff(null);
        setNewStaff({ name: '', username: '', email: '', password: '', department: '', designation: '' });
        await refreshFaculty();
      } else {
        toast.error(data.message || 'Failed to add staff');
      }
    } catch (err) {
      console.error('Add staff error:', err);
      toast.error('Error adding staff');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = async (e) => {
    e.preventDefault();
    console.log('handleDeleteStaff called', { selectedDeleteStaff, deleteId });
    // Determine which id to delete: selected staff (from card) or manual id input
    const idToDelete = (selectedDeleteStaff && selectedDeleteStaff._id) || deleteId;
    if (!idToDelete) return toast.error('Please select a staff to delete');
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${idToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Staff deleted successfully');
        setShowDeleteModal(false);
        setDeleteId('');
        setSelectedDeleteStaff(null);
        await refreshFaculty();
      } else {
        toast.error(data.message || 'Failed to delete staff');
      }
    } catch (err) {
      console.error('Delete staff error:', err);
      toast.error('Error deleting staff');
    } finally {
      setActionLoading(false);
    }
  };

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
        <div className="relative mb-4 py-2">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 text-center">
            Staff Profiles
          </h1>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Staff
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Staff
            </button>
          </div>
        </div>
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
                      src={staff.profileImage || staff.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                      alt={staff.fullName || staff.name}
                      className="w-28 h-36 border-4 mb-4 shadow object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
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

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-4">Add New Staff</h2>
              <form onSubmit={handleAddStaff} className="space-y-3">
                <input required value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} placeholder="Full name" className="w-full px-3 py-2 border rounded" />
                <input required value={newStaff.username} onChange={(e) => setNewStaff({...newStaff, username: e.target.value})} placeholder="Username" className="w-full px-3 py-2 border rounded" />
                <input required value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} placeholder="Email" type="email" className="w-full px-3 py-2 border rounded" />
                <input required value={newStaff.password} onChange={(e) => setNewStaff({...newStaff, password: e.target.value})} placeholder="Password" type="password" className="w-full px-3 py-2 border rounded" />
                <input value={newStaff.department} onChange={(e) => setNewStaff({...newStaff, department: e.target.value})} placeholder="Department" className="w-full px-3 py-2 border rounded" />
                <input value={newStaff.designation} onChange={(e) => setNewStaff({...newStaff, designation: e.target.value})} placeholder="Designation" className="w-full px-3 py-2 border rounded" />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded">
                    {actionLoading ? 'Adding...' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Staff Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-4">Delete Staff</h2>
              <form onSubmit={handleDeleteStaff} className="space-y-3">
                {selectedDeleteStaff ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">You are about to delete:</p>
                    <div className="p-3 border rounded">
                      <p className="font-semibold">{selectedDeleteStaff.fullName || selectedDeleteStaff.name}</p>
                      <p className="text-sm text-gray-600">{selectedDeleteStaff.email}</p>
                      <p className="text-xs text-gray-500">ID: {selectedDeleteStaff._id}</p>
                    </div>
                    <p className="text-sm text-red-600">This action cannot be undone.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">Select a staff to delete</p>
                    <select value={deleteId} onChange={(e) => setDeleteId(e.target.value)} className="w-full px-3 py-2 border rounded">
                      <option value="">-- Select Staff --</option>
                      {facultyData.map(f => (
                        <option key={f._id} value={f._id}>{f.fullName || f.name} ({f.email || 'no-email'})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => { setShowDeleteModal(false); setSelectedDeleteStaff(null); setDeleteId(''); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded">
                    {actionLoading ? 'Deleting...' : 'Delete Staff'}
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
