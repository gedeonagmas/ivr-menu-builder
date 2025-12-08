// MINIMAL TEST - NO IMPORTS THAT COULD BLOCK
console.log('Starting minimal server...');

import express from 'express';

const app = express();
const PORT = 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Server setup complete');


