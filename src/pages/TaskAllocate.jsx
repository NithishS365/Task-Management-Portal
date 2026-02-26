import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import  Header  from "../components/Header";
import { ToastContainer, toast } from 'react-toastify';
import { useTask } from '../context/Taskcontext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import apiService from '../services/api';
import AITaskDescriptionGenerator from '../components/AITaskDescriptionGenerator';  


export function TaskAllocate() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [files, setFiles] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  
  // Ref for auto-resizing textarea
  const textareaRef = useRef(null);

  // Get functions from contexts
  const { createTask, loading } = useTask();
  const { user } = useAuth();
  const { createNotification } = useNotification(); 


const testNotificationSystem = () => {
  console.log('🧪 TESTING NOTIFICATION SYSTEM');
  console.log('👤 Current HOD user:', user);
  console.log('🔔 createNotification function:', createNotification);
  
  if (!createNotification) {
    console.error('❌ createNotification is undefined');
    toast.error('Notification system not available');
    return;
  }

  if (!user || !user._id) {
    console.error('❌ User or user._id is undefined');
    toast.error('User not logged in properly');
    return;
  }

  try {
    const testTask = {
      _id: 'test_' + Date.now(),
      title: 'TEST: HOD Dashboard Notification Test',
      priority: 'High',
      dueDate: new Date().toISOString(),
      createdBy: user._id
    };
    
    const hodRecipient = {
      _id: user._id, // ✅ CRITICAL: Send to HOD (current user)
      name: user.name || 'HOD User'
    };
    
    console.log('🧪 Creating notification for HOD Dashboard:');
    console.log('📋 Task:', testTask);
    console.log('👤 HOD recipient userId:', hodRecipient._id);
    console.log('👤 Current user._id:', user._id);
    console.log('✅ IDs match:', hodRecipient._id === user._id);
    console.log('🏢 User role:', user.role);
    console.log('📍 This should appear in HOD Dashboard, not faculty dashboard');
    
    const result = createNotification({
      title: 'TEST: HOD Dashboard Notification',
      message: `Test notification created by ${user.name}`,
      type: 'test',
      userId: user._id, // Send to current HOD user
      data: testTask
    });
    console.log('✅ Notification created:', result);
    
    toast.success('🧪 Test notification created for HOD Dashboard! Check notification bell.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    toast.error(`Test failed: ${error.message}`);
  }
};

  const testNotification = () => {
    console.log('🧪 Quick test notification...');
    try {
      const testTask = {
        _id: 'quicktest_' + Date.now(),
        title: 'Quick Test Task Notification',
        priority: 'Medium',
        dueDate: new Date().toISOString(),
        createdBy: user?._id
      };
      
      const testStaff = {
        _id: user?._id,
        name: user?.name || 'Test User'
      };
      
      console.log('📋 Quick test - User ID:', user?._id);
      console.log('📋 Quick test - Staff ID:', testStaff._id);
      console.log('📋 Quick test - IDs match:', testStaff._id === user?._id);
      
      createNotification({
        title: 'Quick Test Notification',
        message: `Quick test notification for ${user.name}`,
        type: 'test',
        userId: user._id,
        data: testTask
      });
      toast.success('🧪 Quick test notification sent!');
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      toast.error('Quick test notification failed');
    }
  };

  // Load faculty from MongoDB via API
  const loadFacultyFromAPI = async () => {
    try {
      setLoadingStaff(true);
      console.log('🔄 Starting to load faculty from MongoDB API...');
      
      // Check authentication first
      const token = sessionStorage.getItem('token');
      const userData = sessionStorage.getItem('user');
      console.log('🔐 Auth check:', { hasToken: !!token, hasUser: !!userData });
      
      if (!token) {
        throw new Error('Not authenticated. Please log in first.');
      }
      
      // Use the proper API service to fetch users from MongoDB
      const response = await apiService.getUsers();
      console.log('✅ Raw API response:', response);
      
      // Extract users array from API response
      const facultyData = response.users || response;
      
      if (!Array.isArray(facultyData) || facultyData.length === 0) {
        throw new Error('No faculty data available from server');
      }
      
      console.log('📊 Total users from API:', facultyData.length);
      
      // Transform and validate faculty data - filter out admin/hod users, keep only staff
      console.log('🔍 User roles found:', facultyData.map(u => u.role));
      
      const facultyUsers = facultyData.filter(user => user.role === 'faculty' || user.role === 'staff');
      console.log('👥 Faculty users after filtering:', facultyUsers.length);
      
      const transformedFaculty = facultyUsers
        .map(faculty => ({
          _id: faculty._id || faculty.id || `temp_${Date.now()}_${Math.random()}`,
          name: faculty.name || faculty.fullName || faculty.username || 'Unknown Name',
          email: faculty.email || 'No email provided',
          role: faculty.role || 'faculty',
          department: faculty.department || faculty.dept || 'Unknown Department',
          designation: faculty.designation || faculty.position || 'Faculty',
          specialization: faculty.specialization || faculty.spec || 'General',
          image: faculty.imageUrl || faculty.img || faculty.avatar || faculty.photo || faculty.profilePicture || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name || faculty.username)}&background=3b82f6&color=ffffff`,
          username: faculty.username,
          experience: faculty.experience || faculty.exp || 'Not specified',
          linkedIn: faculty.linkedIn || faculty.linked_in_id
        }))
        .filter(f => f._id && f.name);
      
      setStaffList(transformedFaculty);
      console.log('✅ Faculty loaded successfully from MongoDB:', transformedFaculty.length, 'members');
      
      if (transformedFaculty.length === 0) {
        toast.warn('No faculty members found in the system');
      }
      
    } catch (error) {
      console.error('❌ Faculty loading error from MongoDB:', error.message);
      
      // Show specific error message
      const errorMsg = error.message.includes('fetch') 
        ? 'Unable to connect to server. Please check your internet connection.' 
        : `Server error: ${error.message}`;
        
      setStaffList([]);
      toast.error(`Failed to load faculty: ${errorMsg}`);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Load faculty when component mounts
  useEffect(() => {
    loadFacultyFromAPI();
  }, []);

  // Auto-resize textarea based on content
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Auto-resize textarea when taskDesc changes
  useEffect(() => {
    autoResizeTextarea();
  }, [taskDesc]);

  const toggleStaffSelection = (staff) => {
    setSelectedStaff((prev) => {
      const isAlreadySelected = prev.some((s) => s._id === staff._id);
      if (isAlreadySelected) {
        return prev.filter((s) => s._id !== staff._id);
      } else {
        return [...prev, staff];
      }
    });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // ✅ MAIN ASSIGN TASK FUNCTION WITH NOTIFICATIONS
// ✅ ADD THIS FUNCTION TO YOUR TaskAllocate.jsx (replace existing assignTask):
// ✅ REPLACE THE assignTask FUNCTION:

const assignTask = async () => {
  if (!taskTitle || !taskDesc || !category || selectedStaff.length === 0 || !dueDate) {
    toast.error("Please fill all required fields and select at least one faculty member.");
    return;
  }

  try {
    console.log('🚀 STARTING TASK ASSIGNMENT');
    console.log('👨‍💼 HOD (Current User):', user.name, user._id);
    console.log('👥 Selected Faculty Staff:', selectedStaff);

    // ✅ FIRST, GET ALL MONGODB USERS TO MAP JSON STAFF TO REAL USERS
    console.log('🔍 Fetching all MongoDB users for mapping...');
    const usersResponse = await apiService.getUsers();
    
    if (!usersResponse.success || !usersResponse.users) {
      throw new Error('Failed to fetch users from database');
    }

    console.log('👥 Available MongoDB users:', usersResponse.users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      name: u.name,
      role: u.role
    })));

    let successfulAssignments = 0;
    const failedAssignments = [];

    // ✅ PROCESS EACH SELECTED FACULTY MEMBER
    for (const selectedStaffMember of selectedStaff) {
      console.log(`\n📝 Processing Faculty: ${selectedStaffMember.name}`);
      console.log('📋 Selected staff data:', selectedStaffMember);
      
      try {
        // ✅ FIND THE REAL MONGODB USER ID FOR THIS FACULTY MEMBER
        let mongoUserId = null;
        
        // Try multiple matching strategies
        const mongoUser = usersResponse.users.find(mongoUser => {
          // Strategy 1: Match by email (most reliable)
          if (selectedStaffMember.email && mongoUser.email === selectedStaffMember.email) {
            console.log(`✅ Matched by email: ${selectedStaffMember.email}`);
            return true;
          }
          
          // Strategy 2: Match by username (if available)
          if (selectedStaffMember.username && mongoUser.username === selectedStaffMember.username) {
            console.log(`✅ Matched by username: ${selectedStaffMember.username}`);
            return true;
          }
          
          // Strategy 3: Match by name (less reliable)
          if (mongoUser.name === selectedStaffMember.name) {
            console.log(`✅ Matched by name: ${selectedStaffMember.name}`);
            return true;
          }
          
          return false;
        });

        if (mongoUser) {
          mongoUserId = mongoUser._id;
          console.log(`✅ Found MongoDB Faculty User:`, {
            name: mongoUser.name,
            email: mongoUser.email,
            mongoId: mongoUserId,
            role: mongoUser.role
          });
        } else {
          console.error(`❌ No MongoDB user found for faculty: ${selectedStaffMember.name}`);
          console.log('Available matching options:');
          console.log('- Selected staff email:', selectedStaffMember.email);
          console.log('- Selected staff username:', selectedStaffMember.username);
          console.log('- MongoDB user emails:', usersResponse.users.map(u => u.email));
          
          failedAssignments.push({
            staff: selectedStaffMember.name,
            error: 'Faculty member not found in MongoDB database'
          });
          continue;
        }

        // ✅ CREATE TASK DATA WITH CORRECT ASSIGNMENT
        // ✅ PREPARE TASK DATA
        const taskData = {
          title: taskTitle,          // ✅ Use correct state variable
          description: taskDesc,     // ✅ Use correct state variable
          category: category,
          priority: priority.toLowerCase(), // ✅ Convert to lowercase for server validation
          dueDate: new Date(dueDate).toISOString(),
          assignedTo: mongoUserId,  // ✅ FACULTY MEMBER (receiver)
          assignedBy: user._id,     // ✅ HOD (creator)
        };

        console.log('📋 Task data for API:', {
          ...taskData,
          assignedToName: mongoUser.name,
          assignedToEmail: mongoUser.email,
          createdByName: user.name,
          createdByEmail: user.email
        });

        // ✅ VALIDATE ASSIGNMENT LOGIC
        if (taskData.assignedTo === user._id) {
          console.warn('⚠️  WARNING: Task is being assigned to the HOD (creator). This might be incorrect.');
          console.log('Expected: HOD creates task → Faculty receives task');
          console.log(`Current: ${user.name} (HOD) → ${user.name} (same person)`);
        } else {
          console.log('✅ Assignment logic correct:');
          console.log(`HOD: ${user.name} (${user._id}) → Faculty: ${mongoUser.name} (${mongoUserId})`);
        }

        // ✅ CREATE TASK VIA CONTEXT/API
        console.log('🌐 Creating task via TaskContext...');
        const createdTask = await createTask(taskData);
        
        if (createdTask && createdTask._id) {
          console.log(`✅ Task created successfully for faculty: ${mongoUser.name}`);
          console.log('📋 Created task details:', {
            id: createdTask._id,
            title: createdTask.title,
            assignedToId: createdTask.assignedTo,
            assignedToName: createdTask.assignedTo?.name || 'Unknown',
            createdById: createdTask.createdBy,
            createdByName: createdTask.createdBy?.name || user.name
          });
          
          successfulAssignments++;
          
          // ✅ SEND NOTIFICATION TO ASSIGNED FACULTY MEMBER
          if (createNotification) {
            try {
              await createNotification({
                title: 'New Task Assigned',
                message: `You have been assigned: "${createdTask.title}" by ${user.name}`,
                type: 'task_assigned',
                userId: mongoUser._id, // ✅ Send to faculty member, not HOD
                data: {
                  taskId: createdTask._id,
                  taskTitle: createdTask.title,
                  taskDescription: createdTask.description,
                  dueDate: createdTask.dueDate,
                  priority: createdTask.priority,
                  category: createdTask.category,
                  assignedBy: user.name,
                  assignedById: user._id
                }
              });
              console.log(`🔔 Notification sent to faculty: ${mongoUser.name} (${mongoUser._id})`);
            } catch (notifError) {
              console.error(`❌ Notification failed for ${mongoUser.name}:`, notifError);
            }
          }
        } else {
          throw new Error('Invalid task creation response - no task returned');
        }
        
      } catch (taskError) {
        console.error(`❌ Task creation failed for ${selectedStaffMember.name}:`, taskError);
        failedAssignments.push({
          staff: selectedStaffMember.name,
          error: taskError.message
        });
      }
    }

    console.log(`\n📊 FINAL ASSIGNMENT RESULTS:`);
    console.log(`✅ Successful assignments: ${successfulAssignments}/${selectedStaff.length}`);
    console.log(`❌ Failed assignments: ${failedAssignments.length}/${selectedStaff.length}`);

    if (failedAssignments.length > 0) {
      console.log('❌ Failed assignment details:', failedAssignments);
    }

    // ✅ SHOW RESULTS TO USER
    if (successfulAssignments > 0) {
      toast.success(
        `Task "${taskTitle}" successfully assigned to ${successfulAssignments} faculty member(s)!`
      );
      resetForm();
    } else {
      toast.error(
        `Failed to assign task to any faculty members. 
        Check console for details.`
      );
    }
    
  } catch (error) {
    console.error('❌ Overall assignment error:', error);
    toast.error(`Failed to assign task: ${error.message}`);
  }
};
  const resetForm = () => {
    setTaskTitle("");
    setTaskDesc("");
    setCategory("");
    setSubject("");
    setDueDate("");
    setSelectedStaff([]);
    setPriority("Medium");
    setFiles([]);
  };

  return (
<div className="min-h-screen bg-gradient-to-br  bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ToastContainer />
      <Header />
      
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold  mb-1">
            📋 Task Allocation
          </h1>
                  </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              {/* Task Details Section */}
              <div className="mb-0">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  ✏ Task Details
                </h2>
                
                {/* Task Title */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Category & Priority Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Academic">📚 Academic</option>
                    <option value="Research">🔬 Research</option>
                    <option value="Administrative">📄 Administrative</option>
                    <option value="Event">🎉 Event</option>
                    <option value="Project">💼 Project</option>
                    <option value="Other">📝 Other</option>
                  </select>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Priority Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-2">
                    {['High', 'Medium', 'Low'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPriority(level)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          priority === level
                            ? level === "High"
                              ? "bg-red-500 text-white shadow-lg"
                              : level === "Medium"
                              ? "bg-yellow-500 text-white shadow-lg"
                              : "bg-green-500 text-white shadow-lg"
                            : level === "High"
                            ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                            : level === "Medium"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Description */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      📝 Task Description
                    </label>
                  </div>
                  
                  {/* AI Task Description Generator */}
                  <AITaskDescriptionGenerator
                    onGenerate={(description) => setTaskDesc(description)}
                    isLoading={loading}
                  />
                  
                  <textarea
                    ref={textareaRef}
                    placeholder="Enter detailed task description or use AI generator above"
                    value={taskDesc}
                    onChange={(e) => {
                      setTaskDesc(e.target.value);
                      autoResizeTextarea();
                    }}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px] max-h-[400px] overflow-y-auto"
                    style={{ height: 'auto' }}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📎 Attachments (optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="text-2xl block">📁</span>
                      <span className="text-sm">Click to upload files or drag and drop</span>
                    </div>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded">
                        📎 <span className="truncate">{file.name}</span>
                        <span className="text-xs">({(file.size / 1024).toFixed(1)}KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(true)}
                  disabled={loadingStaff}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingStaff ? (
                    <>⏳ Loading...</>
                  ) : (
                    <>👥 Select Faculty ({staffList.length})</>
                  )}
                </button>
                
                <button
                  onClick={assignTask}
                  disabled={loading || loadingStaff || !taskTitle || !taskDesc || !category || selectedStaff.length === 0 || !dueDate}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>⏳ Assigning...</>
                  ) : (
                    <>✅ Assign Task</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Selected Faculty Panel - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                👥 Selected Faculty
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded-full">
                  {selectedStaff.length}
                </span>
              </h2>
              
              {selectedStaff.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No faculty selected yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Click "Select Faculty" to add members
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedStaff.map((staff) => (
                    <div
                      key={staff._id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
                    >
                      <img
                        src={staff.image}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full object-cover shadow-md"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=3b82f6&color=ffffff`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                          {staff.name}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {staff.designation}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {staff.department}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStaffSelection(staff)}
                        className="text-red-500 hover:text-red-700 text-sm p-1"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Faculty Selection Modal */}
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                  👥 Faculty Selection
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                    {staffList.length} available
                  </span>
                </Dialog.Title>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Select faculty members to assign this task
                </p>
              </div>
              
              <div className="p-6">
                {staffList.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      {loadingStaff ? 'Loading faculty members...' : 'No faculty members found'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                    {staffList.map((faculty) => (
                      <div
                        key={faculty._id}
                        onClick={() => toggleStaffSelection(faculty)}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                          selectedStaff.some((s) => s._id === faculty._id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={faculty.image}
                            alt={faculty.name}
                            className="w-12 h-12 rounded-full object-cover shadow-md"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=3b82f6&color=ffffff&size=48`;
                            }}
                          />
                          {selectedStaff.some((s) => s._id === faculty._id) && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {faculty.name}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {faculty.designation}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {faculty.specialization}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {faculty.experience}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{selectedStaff.length}</span> faculty member(s) selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedStaff([])}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    disabled={selectedStaff.length === 0}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-lg"
                  >
                    Done ✓
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}