'use client';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the Rate My Professor support assistant. How can I help you today?" },
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessage('');
    setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: '' }]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    reader.read().then(function processText({ done, value }) {
      if (done) return result;

      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [...otherMessages, { ...lastMessage, content: lastMessage.content + text }];
      });

      return reader.read().then(processText);
    });
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" height="100vh">
      <Stack direction="column" width="500px" height="700px" border="1px solid black" p={2}>
        <Stack direction="column" spacing={2} flexGrow={1} maxHeight="100%" overflow="auto">
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
              <Box bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'} p={3} borderRadius={16}>
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField fullWidth value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}