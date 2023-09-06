import express, { Express } from 'express';
import * as siteMapRoutes from './site.routes';
import * as userRoutes from './user.routes';
import * as wfuserRoutes from './webFlowUser.routes';
import * as collectionRoutes from './collection.routes';
import * as itemRoutes from './item.routes';
import appError from '../utils/errorHelper';
import { ErrorType } from '../utils/errorTypes';

export function initRoutes(app: Express) {

  app.use('/api/v1/site', siteMapRoutes.initRoutes(app, express.Router()));
  app.use('/api/v1/user', userRoutes.initRoutes(app, express.Router()));
  app.use('/api/v1/wfUser', wfuserRoutes.initRoutes(app, express.Router()));
  app.use('/api/v1/collection', collectionRoutes.initRoutes(app, express.Router()));
  app.use('/api/v1/item', itemRoutes.initRoutes(app, express.Router()));

  app.use('*', (req, res, next) => {
    try {
      throw new appError('path not found', ErrorType.not_found);
    } catch (error) {
      next(error);
    }
  });

}

