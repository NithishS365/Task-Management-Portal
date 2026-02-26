# 🤖 AI Integration Documentation

## Overview
This document describes the AI-powered features integrated into the Task Management Portal using Groq's language models.

## 🌟 Features Added

### 1. AI Chatbot Assistant
- **Component**: `src/components/Chatbot.jsx`
- **Location**: Global floating widget (bottom-right corner of all pages)
- **Purpose**: Provides contextual help and guidance for using the Task Management Portal

#### Key Features:
- ✅ Context-aware responses based on user role (HOD/Faculty)
- ✅ Task management specific guidance
- ✅ Real-time messaging interface with animations
- ✅ Smart filtering (only answers portal-related questions)
- ✅ Dark/light mode support
- ✅ Minimizable floating widget design

#### Usage:
1. Click the floating chat icon (🤖) on any page
2. Ask questions about task management, system features, or navigation
3. Get instant, contextual responses

### 2. AI Task Description Generator
- **Component**: `src/components/AITaskDescriptionGenerator.jsx`
- **Location**: Task Allocation page (above task description field)
- **Purpose**: Generates professional, detailed task descriptions using AI

#### Key Features:
- ✅ Prompt-based task description generation
- ✅ Suggested prompt templates
- ✅ Academic institution context awareness
- ✅ Professional language and formatting
- ✅ Integration with existing task allocation workflow
- ✅ Animated interface with smooth transitions

#### Usage:
1. Navigate to Task Allocation page (HOD only)
2. Click "Generate with AI" button
3. Enter a prompt describing the task you want to create
4. Click "Generate" to get an AI-generated description
5. Review, edit if needed, and use in task creation

## 🛠 Technical Implementation

### Backend API Endpoints

#### 1. Chatbot Query
- **Endpoint**: `POST /api/chatbot/query`
- **Authentication**: Required (JWT token)
- **Purpose**: Process chatbot queries and return contextual responses

```javascript
// Request
{
  "message": "How do I allocate a task?",
  "context": {
    "userName": "John Doe",
    "userRole": "hod"
  }
}

// Response
{
  "success": true,
  "response": "To allocate a task as an HOD, follow these steps..."
}
```

#### 2. Task Description Generation
- **Endpoint**: `POST /api/ai/generate-task-description`
- **Authentication**: Required (JWT token)
- **Purpose**: Generate task descriptions based on prompts

```javascript
// Request
{
  "prompt": "Create a research proposal review task",
  "context": {}
}

// Response
{
  "success": true,
  "description": "Research Proposal Review Task\n\nObjective: Review and evaluate submitted research proposals..."
}
```

### AI Configuration

#### Groq API Setup
- **Model**: `llama3-8b-8192` (Fast inference, good for chat)
- **Provider**: Groq (Free tier available)
- **Rate Limits**: Standard free tier limits apply

#### System Prompts
The AI uses specialized system prompts for different contexts:

1. **Chatbot Prompt**: Focuses on task management guidance, system navigation, and portal-specific help
2. **Task Description Prompt**: Generates professional, academic-focused task descriptions

### Environment Configuration

Add to `server/.env`:
```env
# AI Configuration - Groq API
GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from: https://console.groq.com/keys

## 🎯 Component Integration

### Chatbot Integration
```jsx
// Added to src/App.jsx
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="App">
      <AllRoutes />
      <Chatbot /> {/* Global chatbot widget */}
      <ToastContainer />
    </div>
  );
}
```

### Task Description Generator Integration
```jsx
// Added to src/pages/TaskAllocate.jsx
import AITaskDescriptionGenerator from '../components/AITaskDescriptionGenerator';

// In task allocation form
<AITaskDescriptionGenerator
  onDescriptionGenerated={(description) => setTaskDesc(description)}
  currentDescription={taskDesc}
/>
```

## 🔧 Dependencies Added

### Frontend
```json
{
  "framer-motion": "^11.x.x" // For smooth animations
}
```

### Backend
```javascript
// Using built-in fetch for Groq API calls
// No additional dependencies required
```

## 🚀 Getting Started

### 1. Setup Groq API Key
1. Visit https://console.groq.com/keys
2. Create a free account
3. Generate an API key
4. Add to `server/.env` file

### 2. Start the Servers
```bash
# Backend (from server directory)
cd server
npm start

# Frontend (from root directory)
npm run dev
```

### 3. Test the Features
1. **Chatbot**: Click the floating chat icon on any page
2. **Task Generator**: Go to Task Allocation page and use the AI generator

## 🛡 Security & Error Handling

### Rate Limiting
- Groq free tier provides generous limits
- API calls are authenticated and logged
- Error responses provide user-friendly messages

### Content Filtering
- Chatbot only responds to task management related queries
- Inappropriate topics are automatically redirected
- Professional context maintained for task descriptions

### Error Handling
- Graceful degradation when AI service is unavailable
- User-friendly error messages
- Fallback to manual input always available

## 📊 Usage Examples

### Chatbot Queries
- "How do I create a new task?"
- "What does the task status mean?"
- "How can I view my performance analytics?"
- "How do I upload attachments?"

### Task Description Prompts
- "Create a research paper review task"
- "Design a curriculum development assignment"
- "Faculty training workshop organization"
- "Student evaluation and grading task"

## 🔄 Future Enhancements

### Planned Features
1. **Task Priority Suggestions**: AI recommends task priorities based on content
2. **Deadline Estimation**: Smart deadline suggestions based on task complexity
3. **Performance Insights**: AI-powered analytics insights
4. **Bulk Task Generation**: Generate multiple related tasks at once
5. **Smart Task Categorization**: Auto-categorize tasks based on description

### Integration Opportunities
1. **Email Integration**: AI-generated task notifications
2. **Calendar Integration**: Smart scheduling suggestions
3. **Document Analysis**: AI analysis of uploaded task files
4. **Progress Tracking**: AI-powered progress insights

## 🐛 Troubleshooting

### Common Issues

1. **Chatbot not responding**
   - Check Groq API key in server/.env
   - Verify backend server is running
   - Check browser console for errors

2. **Task description generation failing**
   - Ensure you're logged in as HOD
   - Check network connectivity
   - Verify API endpoint is accessible

3. **API Rate Limits**
   - Groq free tier has rate limits
   - Implement request queuing if needed
   - Consider upgrading to paid tier for production

### Debug Mode
Enable verbose logging by checking server console for:
- `🤖 Chatbot query from: [user]`
- `🎯 AI task description generation for: [user]`

## 📝 Development Notes

### Code Structure
- **Components**: Modular, reusable AI components
- **API Service**: Centralized API call management
- **Error Handling**: Comprehensive error boundaries
- **Styling**: Consistent with existing design system

### Performance Considerations
- Lazy loading for AI components
- Debounced API calls to prevent spam
- Local state management for chat history
- Optimized re-renders with React.memo

This AI integration enhances the Task Management Portal with intelligent assistance while maintaining the existing workflow and user experience.