import userRouter from './routes/user.routes';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api/users', userRouter);

app.listen(port, () => {
  console.log(`Server esta corriendo sobre  http://localhost:${port}`);
});
