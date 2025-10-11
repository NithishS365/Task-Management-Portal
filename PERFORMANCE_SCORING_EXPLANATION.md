# 🎯 Performance Scoring System Explanation

## Overview

The performance scoring system evaluates faculty task completion based on **two main factors**:

1. **HOD Rating** (1-5 stars) - 60% weight
2. **Submission Timing Rating** (0-5 points) - 40% weight

The final performance score ranges from **0-10 points**.

---

## 📅 Date-Based Scoring Logic

### Submission Rating Calculation (0-5 points)

The system compares the **submission date** against the **due date** and **original due date** (if extended).

#### 🟢 **Early Submission (Best Scores)**

- **3+ days early**: **5.0 points** (Excellent)
- **1-2 days early**: **4.5 points** (Very Good)
- **On original due date**: **4.0 points** (Good)

#### 🟡 **Extension Period**

- **Within extension period**: **3.0 points** (Fair)

#### 🔴 **Late Submission (Poor Scores)**

- **1 day late**: **2.0 points** (Poor)
- **2-3 days late**: **1.5 points** (Very Poor)
- **4+ days late**: **1.0 points** (Extremely Poor)

---

## 📊 Performance Score Calculation

### Formula:

```
Performance Score = (HOD Rating × 0.6 × 2) + (Submission Rating × 0.4 × 2)
```

### Penalties Applied:

- **Penalty Flag**: -20% of total score
- **Extension Used**: -10% of total score

---

## 🎯 Real Examples

### Example 1: Excellent Performance

```
Task Due Date: October 10, 2025
Submission Date: October 7, 2025 (3 days early)
HOD Rating: 5/5 stars
Extension Used: No
Penalty: No

Submission Rating: 5.0 (3+ days early)
Calculation: (5 × 0.6 × 2) + (5.0 × 0.4 × 2) = 6.0 + 4.0 = 10.0
Final Score: 10.0/10 (Grade A+)
```

### Example 2: Good Performance with Extension

```
Original Due Date: October 8, 2025
Extended Due Date: October 12, 2025
Submission Date: October 11, 2025 (within extension)
HOD Rating: 4/5 stars
Extension Used: Yes
Penalty: No

Submission Rating: 3.0 (within extension)
Base Calculation: (4 × 0.6 × 2) + (3.0 × 0.4 × 2) = 4.8 + 2.4 = 7.2
Extension Penalty: 7.2 × 0.9 = 6.48
Final Score: 6.5/10 (Grade B)
```

### Example 3: Poor Performance - Late Submission

```
Task Due Date: October 10, 2025
Submission Date: October 14, 2025 (4 days late)
HOD Rating: 3/5 stars
Extension Used: No
Penalty: Yes (quality issues)

Submission Rating: 1.0 (4+ days late)
Base Calculation: (3 × 0.6 × 2) + (1.0 × 0.4 × 2) = 3.6 + 0.8 = 4.4
Penalty Applied: 4.4 × 0.8 = 3.52
Final Score: 3.5/10 (Grade F)
```

---

## 🏆 Performance Grades

| Score Range | Grade | Description       | Color  |
| ----------- | ----- | ----------------- | ------ |
| 9.0 - 10.0  | A+    | Outstanding       | Green  |
| 8.0 - 8.9   | A     | Excellent         | Green  |
| 7.0 - 7.9   | B+    | Very Good         | Blue   |
| 6.0 - 6.9   | B     | Good              | Blue   |
| 5.0 - 5.9   | C+    | Satisfactory      | Yellow |
| 4.0 - 4.9   | C     | Fair              | Orange |
| 0.0 - 3.9   | F     | Needs Improvement | Red    |

---

## 📈 Staff Performance Tracking

The system automatically updates staff performance statistics:

- **Total Tasks Completed**
- **Average HOD Rating**
- **Average Submission Rating**
- **Overall Performance Score**
- **Performance Grade**

This data is displayed in the Staff Statistics page with charts and visualizations.

---

## 🎯 Key Benefits

1. **Encourages Early Submission**: Higher scores for early completion
2. **Balanced Evaluation**: Combines quality (HOD rating) with efficiency (timing)
3. **Fair Penalty System**: Reasonable reductions for extensions and issues
4. **Transparent Scoring**: Clear criteria and calculations
5. **Continuous Improvement**: Historical tracking shows progress over time

---

## 💡 Tips for Faculty

- **Submit early** for maximum points (aim for 1-3 days before due date)
- **Avoid extensions** when possible (-10% penalty)
- **Maintain quality** for good HOD ratings (60% of total score)
- **Plan ahead** to prevent late submissions
- **Review performance trends** in Staff Statistics page
