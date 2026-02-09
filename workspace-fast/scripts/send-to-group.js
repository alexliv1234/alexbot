#!/usr/bin/env node
// Send message to playing group via openclaw message tool

const message = process.argv[2];
if (!message) {
  console.error('Usage: node send-to-group.js "message"');
  process.exit(1);
}

// Output in format that openclaw can process
console.log(JSON.stringify({
  action: 'send_message',
  to: '120363405143589138@g.us',
  message: message
}));
