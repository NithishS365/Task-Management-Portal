# Overdue Tasks & Extension Requests API Documentation

## Overview

This API provides comprehensive backend support for overdue task management and extension request workflows for both staff and HOD users.

## Authentication

All endpoints require JWT authentication via Authorization header:

```
Authorization: Bearer jwt-token-placeholder-{userId}
```

## API Endpoints

### 🔧 Staff APIs

#### 1. Get Overdue Tasks

```
GET /api/tasks/overdue
```

**Description**: Fetch overdue tasks for authenticated staff user
**Access**: Faculty only
**Query Parameters**:

- `page` (default: 1) - Page number for pagination
- `limit` (default: 10) - Number of tasks per page
- `sortBy` (default: 'dueDate') - Field to sort by
- `sortOrder` (default: 'asc') - Sort order (asc/desc)

**Response**:

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "title": "Task Title",
        "description": "Task Description",
        "dueDate": "2024-10-05T00:00:00.000Z",
        "status": "pending",
        "priority": "high",
        "daysOverdue": 3,
        "overdueReason": "Task is 3 days overdue",
        "assignedBy": {
          "name": "HOD Name",
          "email": "hod@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 15,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  },
  "message": "Found 15 overdue tasks"
}
```

#### 2. Submit Extension Request

```
POST /api/requests/extensions
```

**Description**: Submit extension request for overdue task
**Access**: Faculty only
**Content-Type**: multipart/form-data (for file uploads)

**Body Parameters**:

- `taskId` (required) - ID of the overdue task
- `reason` (required) - Reason code from predefined list
- `customReason` (optional) - Custom reason text (required if reason = "other")
- `requestedDueDate` (required) - New requested due date
- `supportingFiles` (optional) - Array of supporting documents

**Reason Codes**:

- `technical_issues` - Technical Difficulties
- `resource_unavailable` - Resources Unavailable
- `scope_change` - Scope Change Required
- `dependency_delay` - Dependency Delays
- `personal_emergency` - Personal Emergency
- `workload_conflict` - Workload Conflicts
- `other` - Other (requires customReason)

**Response**:

```json
{
  "success": true,
  "data": {
    "_id": "request_id",
    "taskId": "task_id",
    "staffId": "staff_id",
    "hodId": "hod_id",
    "reason": "technical_issues",
    "reasonLabel": "Technical Difficulties",
    "requestedDueDate": "2024-10-15T00:00:00.000Z",
    "status": "pending",
    "submittedAt": "2024-10-08T10:30:00.000Z"
  },
  "message": "Extension request submitted successfully. Your HOD will review and respond."
}
```

#### 3. Get Extension Request History

```
GET /api/requests/extensions
```

**Description**: Fetch extension request history for authenticated staff
**Access**: Faculty only
**Query Parameters**: Same as overdue tasks endpoint plus `status` filter

**Response**: Similar to extension request submission with array of requests

### 🎯 HOD APIs

#### 1. Get Overdue Analytics

```
GET /api/analytics/overdue-tasks
```

**Description**: Get overdue task analytics for HOD dashboard
**Access**: HOD only

**Response**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalOverdue": 15,
      "totalTasks": 100,
      "overduePercentage": 15,
      "staffCount": 5
    },
    "overdueByStaff": [
      {
        "staffId": "staff_id",
        "name": "Dr. G. Shobana",
        "email": "gshobana@aidscollege.edu",
        "count": 4,
        "assigned": 20
      }
    ],
    "priorityDistribution": [
      {
        "name": "High",
        "value": 6,
        "color": "#EF4444"
      }
    ],
    "trendData": [
      {
        "date": "2024-01",
        "overdue": 8,
        "total": 50,
        "percentage": 16
      }
    ],
    "extensionRequests": {
      "pending": 5,
      "approved": 8,
      "rejected": 2,
      "reassigned": 1
    }
  },
  "message": "Analytics data retrieved successfully"
}
```

#### 2. Get Extension Requests

```
GET /api/requests/overdue
```

**Description**: Fetch all extension requests for HOD review
**Access**: HOD only
**Query Parameters**: Same pagination and filtering as staff endpoints

#### 3. Approve Extension Request

```
PUT /api/requests/overdue/:requestId/approve
```

**Description**: Approve extension request and update task due date
**Access**: HOD only

**Body**:

```json
{
  "newDueDate": "2024-10-20",
  "comments": "Approved due to valid technical reasons"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    // Updated extension request object
  },
  "message": "Extension request approved. Task due date updated to 10/20/2024"
}
```

#### 4. Reassign Task

```
PUT /api/requests/overdue/:requestId/reassign
```

**Description**: Reassign task to different staff member
**Access**: HOD only

**Body**:

```json
{
  "newStaffId": "new_staff_id",
  "newDueDate": "2024-10-20",
  "penaltyFlag": true,
  "comments": "Reassigning due to repeated delays"
}
```

#### 5. Reject Extension Request

```
PUT /api/requests/overdue/:requestId/reject
```

**Description**: Reject extension request
**Access**: HOD only

**Body**:

```json
{
  "comments": "Request denied - insufficient justification"
}
```

## Database Schemas

### ExtensionRequest Schema

```javascript
{
  taskId: ObjectId (ref: Task),
  staffId: ObjectId (ref: User),
  hodId: ObjectId (ref: User),
  reason: String (enum),
  reasonLabel: String,
  customReason: String,
  originalDueDate: Date,
  requestedDueDate: Date,
  approvedDueDate: Date,
  status: String (enum: pending/approved/rejected/reassigned),
  comments: String,
  hodComments: String,
  supportingFiles: Array,
  reassignedTo: ObjectId (ref: User),
  penaltyApplied: Boolean,
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: User)
}
```

## File Upload Support

- **Supported formats**: PDF, DOC, DOCX, JPG, JPEG, PNG
- **Max file size**: 5MB per file
- **Max files**: 5 files per request
- **Storage**: Local filesystem in `uploads/extensions/` directory

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Notifications

The system includes hooks for notifications:

- Staff notified when extension approved/rejected/reassigned
- HOD notified when new extension request submitted
- Implementation via console.log (ready for Socket.io integration)

## Security Features

- JWT-based authentication
- Role-based access control
- File type validation
- Input sanitization
- SQL injection protection via Mongoose

## Next Steps for Production

1. Implement proper JWT token generation and validation
2. Add Socket.io for real-time notifications
3. Implement email notifications
4. Add rate limiting
5. Add request validation middleware
6. Add logging system
7. Add backup for uploaded files
8. Add audit trails

## Testing the APIs

Use the existing authentication system to get tokens:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "gshobana@aidscollege.edu", "password": "password123"}'

# Use token for authenticated requests
curl -H "Authorization: Bearer jwt-token-placeholder-{userId}" \
  http://localhost:5000/api/tasks/overdue
```
