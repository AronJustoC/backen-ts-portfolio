import cors from 'cors';

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4321',
  credentials: true,
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
