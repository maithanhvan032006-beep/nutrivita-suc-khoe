import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import apiApp from './server/apiApp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Mount API routes
app.use(apiApp);

// Serve static frontend assets from dist in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Nutrivita server running on port ${PORT}`);
});
