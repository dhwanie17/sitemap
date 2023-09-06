import { verifyJWT_MW, verifyAccessToken } from '../config/middlewares';
import { CollectionController } from '../controllers/collection';

export function initRoutes(app, router) {
  const apiRoute = router;

  const Collection = new CollectionController();
  apiRoute.get('/getCollections', verifyJWT_MW, verifyAccessToken, Collection.getCollections);

  return router;
}
