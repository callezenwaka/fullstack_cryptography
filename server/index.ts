import express, {Application, Request, Response, NextFunction} from "express";
import cors from "cors";
import os from "os";
import crypto from "./routes/index";
import auth from "./routes/auth";

const app: Application = express();

// Route middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ping home route
app.get('/', (req: Request, res: Response) => {
  try {
    return res.status(200).json('Ok');
  } catch (error) {
    return res.status(500).json('Internal Server Error!');
  }
});

// Verify request
app.use('/', auth);
app.use('/crypto', crypto);

// notfound route handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = {
    statusText: new Error('Not Found'),
    status: 404
  };
  next(error);
})

const network = os?.networkInterfaces()?.en0?.find(elm => elm.family=='IPv4')?.address;
// Set up port and start the server
app.listen( process.env.PORT, () => {
  console.log(`Server running at:`);
  console.log(`- Local: http://localhost:${process.env.PORT}`);
  console.log(`- Network: http://${network}:${process.env.PORT}`);
});

export default app;