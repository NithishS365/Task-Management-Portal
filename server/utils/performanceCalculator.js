/**
 * Performance Calculation Utilities
 * Calculates task performance scores based on submission timing and HOD ratings
 */

/**
 * Calculate submission rating based on submission date vs due date
 * @param {Date} submissionDate - When the task was submitted
 * @param {Date} dueDate - Original due date of the task
 * @param {Date} originalDueDate - Original due date before any extensions
 * @returns {number} Rating from 0-5 based on submission timing
 */
export const calculateSubmissionRating = (submissionDate, dueDate, originalDueDate = null) => {
  if (!submissionDate || !dueDate) {
    return 0;
  }

  const submission = new Date(submissionDate);
  const due = new Date(dueDate);
  const original = originalDueDate ? new Date(originalDueDate) : due;

  // Calculate difference in days
  const diffTime = due - submission;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If submitted before original due date (even if extended)
  const originalDiffTime = original - submission;
  const originalDiffDays = Math.ceil(originalDiffTime / (1000 * 60 * 60 * 24));

  let rating;

  if (originalDiffDays > 0) {
    // Submitted before original due date
    if (originalDiffDays >= 3) {
      rating = 5.0; // Excellent - 3+ days early
    } else if (originalDiffDays >= 1) {
      rating = 4.5; // Very Good - 1-2 days early
    } else {
      rating = 4.0; // Good - on original due date
    }
  } else if (diffDays >= 0) {
    // Submitted by extended due date but after original
    rating = 3.0; // Fair - submitted within extension
  } else {
    // Late even with extension
    const lateDays = Math.abs(diffDays);
    if (lateDays <= 1) {
      rating = 2.0; // Poor - 1 day late
    } else if (lateDays <= 3) {
      rating = 1.5; // Very Poor - 2-3 days late
    } else {
      rating = 1.0; // Extremely Poor - 4+ days late
    }
  }

  return Math.round(rating * 2) / 2; // Round to nearest 0.5
};

/**
 * Calculate overall performance score combining HOD rating and submission rating
 * @param {number} hodRating - HOD's rating (1-5)
 * @param {number} submissionRating - Calculated submission rating (0-5)
 * @param {object} options - Additional options
 * @returns {number} Overall performance score (0-10)
 */
export const calculatePerformanceScore = (hodRating, submissionRating, options = {}) => {
  const {
    hodWeight = 0.6,        // HOD rating weight (60%)
    submissionWeight = 0.4,  // Submission timing weight (40%)
    penaltyFlag = false,     // Any penalties applied
    extensionUsed = false    // Whether extension was used
  } = options;

  if (!hodRating || hodRating < 1 || hodRating > 5) {
    hodRating = 0;
  }
  
  if (!submissionRating || submissionRating < 0 || submissionRating > 5) {
    submissionRating = 0;
  }

  // Calculate weighted score
  let performanceScore = (hodRating * hodWeight * 2) + (submissionRating * submissionWeight * 2);

  // Apply penalties
  if (penaltyFlag) {
    performanceScore *= 0.8; // 20% penalty
  }

  if (extensionUsed) {
    performanceScore *= 0.9; // 10% reduction for using extension
  }

  // Ensure score is within bounds
  performanceScore = Math.max(0, Math.min(10, performanceScore));
  
  return Math.round(performanceScore * 100) / 100; // Round to 2 decimal places
};

/**
 * Get performance grade based on score
 * @param {number} score - Performance score (0-10)
 * @returns {object} Grade information
 */
export const getPerformanceGrade = (score) => {
  if (score >= 9) {
    return { 
      grade: 'A+', 
      description: 'Outstanding', 
      color: '#10B981',
      percentage: score * 10 
    };
  } else if (score >= 8) {
    return { 
      grade: 'A', 
      description: 'Excellent', 
      color: '#059669',
      percentage: score * 10 
    };
  } else if (score >= 7) {
    return { 
      grade: 'B+', 
      description: 'Very Good', 
      color: '#3B82F6',
      percentage: score * 10 
    };
  } else if (score >= 6) {
    return { 
      grade: 'B', 
      description: 'Good', 
      color: '#6366F1',
      percentage: score * 10 
    };
  } else if (score >= 5) {
    return { 
      grade: 'C+', 
      description: 'Satisfactory', 
      color: '#F59E0B',
      percentage: score * 10 
    };
  } else if (score >= 4) {
    return { 
      grade: 'C', 
      description: 'Fair', 
      color: '#EF4444',
      percentage: score * 10 
    };
  } else {
    return { 
      grade: 'F', 
      description: 'Needs Improvement', 
      color: '#DC2626',
      percentage: score * 10 
    };
  }
};

/**
 * Update user performance statistics
 * @param {object} user - User document
 * @param {number} newPerformanceScore - New performance score to add
 * @param {number} newHodRating - New HOD rating
 * @param {number} newSubmissionRating - New submission rating
 */
export const updateUserPerformanceStats = (user, newPerformanceScore, newHodRating, newSubmissionRating) => {
  if (!user.performanceStats) {
    user.performanceStats = {
      totalTasksCompleted: 0,
      totalRatings: 0,
      averageHodRating: 0,
      averageSubmissionRating: 0,
      overallPerformanceScore: 0,
      lastUpdated: new Date()
    };
  }

  const stats = user.performanceStats;
  
  // Update counters
  stats.totalTasksCompleted += 1;
  stats.totalRatings += 1;

  // Calculate new averages
  const totalScore = (stats.overallPerformanceScore * (stats.totalRatings - 1)) + newPerformanceScore;
  const totalHodRating = (stats.averageHodRating * (stats.totalRatings - 1)) + newHodRating;
  const totalSubmissionRating = (stats.averageSubmissionRating * (stats.totalRatings - 1)) + newSubmissionRating;

  stats.overallPerformanceScore = Math.round((totalScore / stats.totalRatings) * 100) / 100;
  stats.averageHodRating = Math.round((totalHodRating / stats.totalRatings) * 100) / 100;
  stats.averageSubmissionRating = Math.round((totalSubmissionRating / stats.totalRatings) * 100) / 100;
  stats.lastUpdated = new Date();

  return stats;
};

/**
 * Calculate completion time bonus/penalty
 * @param {Date} startDate - When task was assigned/accepted
 * @param {Date} submissionDate - When task was submitted
 * @param {Date} dueDate - Due date of task
 * @returns {number} Bonus/penalty factor (0.8 to 1.2)
 */
export const calculateCompletionTimeBonus = (startDate, submissionDate, dueDate) => {
  if (!startDate || !submissionDate || !dueDate) {
    return 1.0; // No bonus or penalty
  }

  const start = new Date(startDate);
  const submission = new Date(submissionDate);
  const due = new Date(dueDate);

  const totalTimeAvailable = due - start;
  const timeUsed = submission - start;
  
  if (totalTimeAvailable <= 0) {
    return 1.0; // Edge case
  }

  const timeUtilization = timeUsed / totalTimeAvailable;

  if (timeUtilization <= 0.5) {
    return 1.2; // 20% bonus for completing in first half of time
  } else if (timeUtilization <= 0.75) {
    return 1.1; // 10% bonus for completing in first 3/4 of time
  } else if (timeUtilization <= 1.0) {
    return 1.0; // No bonus, on time
  } else {
    return 0.8; // 20% penalty for late submission
  }
};

export default {
  calculateSubmissionRating,
  calculatePerformanceScore,
  getPerformanceGrade,
  updateUserPerformanceStats,
  calculateCompletionTimeBonus
};