
import { verifyJWT_MW } from '../config/middlewares';
import { UserController } from '../controllers/webflowUser';

export function initRoutes(app, router) {
  const apiRoute = router;

  const User = new UserController();
  apiRoute.get('/create', verifyJWT_MW, User.createWebFlowUser);
  apiRoute.get('/authorize', User.authorize);
  apiRoute.get('/getWfDetails', verifyJWT_MW, User.getWfUserDetails);

  return router;
}
