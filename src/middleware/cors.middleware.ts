import cors from 'cors';

const corsOptions = {
  origin: 'http://localhost:4321',
  credentials: true,
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
