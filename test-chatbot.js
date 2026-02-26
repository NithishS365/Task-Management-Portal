// Simple test for chatbot API
const testChatbot = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/chatbot/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        message: 'Hello, how do I create a task?',
        context: {
          userRole: 'hod',
          userName: 'Test User'
        }
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed data:', data);
    } catch (e) {
      console.log('Failed to parse as JSON');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testChatbot();