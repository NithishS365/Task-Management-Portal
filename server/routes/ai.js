import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Groq AI configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  chatbot: `You are a helpful assistant for a Task Management Portal system. Your role is to help users with:

1. Task allocation and management
2. Understanding system features  
3. Navigation guidance
4. Performance analytics
5. User management
6. Workflow assistance

IMPORTANT RULES:
- Only answer questions related to task management, productivity, and this specific portal system
- Do not answer questions about unrelated topics (politics, personal advice, general knowledge, etc.)
- If asked about something outside your scope, politely redirect to task management topics
- Be concise but helpful
- Use a professional but friendly tone
- Provide specific guidance when possible

The system has the following main features:
- Task allocation by HODs to faculty
- Real-time notifications
- Task status tracking (pending, in-progress, completed, overdue)
- Performance analytics and staff rankings
- File attachments for tasks
- Deadline management and extensions
- Dark/light mode themes
- Mobile responsive design

User roles: HOD (Head of Department) can allocate tasks, faculty receive and complete tasks.`,

  task_description: `You are an AI assistant that helps generate detailed, professional task descriptions for academic institutions. 

GUIDELINES:
- Create clear, actionable task descriptions
- Include specific objectives and deliverables
- Mention estimated timeframes when appropriate
- Use professional academic language
- Include relevant context for educational settings
- Make descriptions comprehensive but not overly lengthy
- Focus on measurable outcomes

Generate only the task description content, nothing else.`
};

// Helper function to make Groq API calls
const callGroqAPI = async (messages, systemPrompt) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Fast model for chat
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
};

// @route   POST /api/chatbot/query
// @desc    Handle chatbot queries
// @access  Private
router.post('/query', auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('🤖 Chatbot query from:', req.user.name, '- Message:', message);

    // Check if the question seems unrelated to task management
    const unrelatedKeywords = [
      'weather', 'sports', 'politics', 'cooking', 'travel', 'dating', 'health', 'medical',
      'stock market', 'cryptocurrency', 'movies', 'music', 'games', 'fashion'
    ];
    
    const isUnrelated = unrelatedKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (isUnrelated) {
      return res.json({
        success: true,
        response: "I'm specifically designed to help with task management and portal-related questions. Please ask me about task allocation, system features, navigation, performance analytics, or any other aspect of our Task Management Portal. How can I assist you with your work tasks today?"
      });
    }

    const userContext = `User: ${context?.userName || 'Unknown'} (Role: ${context?.userRole || 'unknown'})`;
    
    const messages = [
      { role: 'user', content: `${userContext}\n\nQuestion: ${message}` }
    ];

    const response = await callGroqAPI(messages, SYSTEM_PROMPTS.chatbot);

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again later.'
    });
  }
});

// @route   POST /api/ai/generate-task-description
// @desc    Generate task description using AI
// @access  Private
router.post('/generate-task-description', auth, async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('🎯 AI task description generation for:', req.user.name, '- Prompt:', prompt);

    const messages = [
      { 
        role: 'user', 
        content: `Generate a professional task description based on this prompt: "${prompt}"`
      }
    ];

    const description = await callGroqAPI(messages, SYSTEM_PROMPTS.task_description);

    res.json({
      success: true,
      description: description.trim()
    });

  } catch (error) {
    console.error('❌ AI task description generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task description. Please try again.'
    });
  }
});

export default router;