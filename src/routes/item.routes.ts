import { ItemController } from '../controllers/item';
import { verifyAccessToken, verifyJWT_MW } from '../config/middlewares';
import { CollectionController } from '../controllers/collection';

export function initRoutes(app, router) {
  const apiRoute = router;

  const Items = new ItemController();
  apiRoute.get('/getItems', verifyJWT_MW, verifyAccessToken, Items.getItems);

  return router;
}
