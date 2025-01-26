import express, { Request, Response } from 'express';
import router from './routes/routes';

const app = express();


app.use(express.json()); 
app.use('/api', router);

const PORT = 3000;


// Start the server
app.listen(PORT, () => {
  console.log(`Server running  on http://localhost:${PORT}`);
});