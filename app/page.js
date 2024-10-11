'use client'; // This tells Next.js that the following component should be rendered on the client side (browser).

/**
 * Home component for the Rate My Professor AI Chatbox
 * This component renders the chatbox where users can interact with an AI assistant 
 * that provides answers based on the Rate My Professor data. It includes:
 * - A list of chat messages from the user and AI assistant
 * - A text input for the user to type their messages
 * - A button to send the message or use the "Enter" key to submit
 * The component handles fetching AI responses from a backend API.
 */

// Import necessary components from Material-UI and React hooks
import { Box, Button, Stack, TextField, Typography, Container } from '@mui/material';
import { useState } from 'react';

export default function Home() {
  // State to manage the list of messages in the chat
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the Rate My Professor support assistant. How can I help you today?" },
  ]);

  // State to manage the current message being typed by the user
  const [message, setMessage] = useState('');

  // Function to send a message when the user presses "Send" or hits the Enter key
  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages
    setMessage(''); // Clear the input field after sending the message

    // Add the user's message to the list of messages and an empty placeholder for the assistant's response
    setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: '' }]);

    // Send a request to the backend API (/api/chat) to get the assistant's response
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([...messages, { role: 'user', content: message }]), // Send current messages with the latest user message
    });

    // Use a stream reader to handle the response from the API, which is sent back in chunks
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    // Process the streamed response as it arrives
    reader.read().then(function processText({ done, value }) {
      if (done) return result; // If reading is finished, return the result

      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]; // Find the last message (the assistant's empty response)
        let otherMessages = messages.slice(0, messages.length - 1); // All messages except the last one
        return [...otherMessages, { ...lastMessage, content: lastMessage.content + text }]; // Update the last message with the streamed content
      });

      return reader.read().then(processText); // Recursively process more chunks if available
    });
  };

  // Function to send the message when the user presses "Enter"
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage(); // Trigger the sendMessage function if "Enter" is pressed
    }
  };

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', height: '90vh', justifyContent: 'center' }}>
      {/* Header Section with attribution */}
      <Typography variant="h6" sx={{ position: 'absolute', top: 10, left: 20 }}>
        by Sabeeh Hassany, built using OpenAI, Pinecone, Next.js, and Material-UI
      </Typography>

      {/* Title of the chatbox */}
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold', color: '#3f51b5' }}>
        Rate My Professor AI Chatbox
      </Typography>

      {/* Main chat UI section */}
      <Stack direction="column" height="600px" border="1px solid #e0e0e0" boxShadow={3} p={2} borderRadius={4} bgcolor="#f9f9f9">
        {/* This section holds the chat messages */}
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" sx={{ mb: 2, p: 1 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'} // Align assistant's messages to the left and user's to the right
            >
              <Box
                sx={{
                  bgcolor: message.role === 'assistant' ? '#eceff1' : '#4caf50',
                  color: message.role === 'assistant' ? '#000' : '#fff',
                  p: 2,
                  borderRadius: 16,
                  maxWidth: '75%',
                  wordWrap: 'break-word',
                  fontSize: '18px', // Increase font size by one level
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Input field and Send button section */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            placeholder="Type your message..." // Placeholder text inside the input field
            value={message} // The value of the text being typed
            onChange={(e) => setMessage(e.target.value)} // Update the message state when the user types
            onKeyDown={handleKeyDown} // Handle the "Enter" key for sending messages
            sx={{
              backgroundColor: '#fff',
              borderRadius: 2, // Rounded edges for the text box
              fontSize: '16px', // Increase font size for better readability
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage} // Call sendMessage when the button is clicked
            sx={{
              minWidth: '120px',
              borderRadius: '50px', // More rounded shape for the Send button
              fontFamily: "'Comic Sans MS', cursive, sans-serif", // Use a more playful and rounded font
              fontSize: '16px', // Larger font for better readability
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}