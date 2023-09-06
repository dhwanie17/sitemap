/**
 * Required External Modules
 */
import * as dotenv from 'dotenv';
import express, { Express } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import fileUpload from 'express-fileupload';
import * as routes from './routes/';
import { logger } from './logger/Logger';
import { environment } from './config';
import { errorHandlerMiddleware, responseHandling } from './middleware';
import path from 'path';


dotenv.config();

/**
 * App Variables
 */
if (!environment.port) {
  process.exit(1);
}

const PORT: number = environment.port || 3000;
export class Server {

  private app: Express;
  constructor() {
    this.app = express();
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.get('/', (req, res) => res.sendFile((path.join(__dirname, "public", "index.html"))))
    this.app.use(cors({
      origin: '*',
      methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      optionsSuccessStatus: 200
    }));
    this.app.use(fileUpload({
      limits: { fileSize: 500 * 1024 * 1024 },
    }));
    this.app.use(urlencoded({
      extended: true,
      limit: '50mb'
    }));
    this.app.use(json());
    this.app.use(responseHandling);
    routes.initRoutes(this.app);
    this.app.use(errorHandlerMiddleware);
    this.app.listen(PORT, () => {
      logger.info(`👍 Server successfully started at port ${PORT}`);
    })
  }

  getApp() {
    return this.app;
  }

}
new Server();
