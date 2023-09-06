
import { createUserSchema } from '../validation/user.validation';
import { verifyJWT_MW } from '../config/middlewares';
import { END_POINT } from '../constant/endpoint';
import { UserController, SessionController } from '../controllers/user';

export function initRoutes(app, router) {

  const apiRoute = router;
  const users = new UserController();
  const session = new SessionController();

  // apiRoute.get('/', (req, res) => res.status(200).send({ message: 'Api Server is running!' }));
  apiRoute.post(END_POINT.LOGIN, session.login);
  apiRoute.post('/logout/:id', verifyJWT_MW, session.logout);
  apiRoute.get('/', users.getUser);
  apiRoute.get('/:id', users.getOneUser);
  apiRoute.post(END_POINT.SIGNUP, createUserSchema, users.addUser);
  apiRoute.put('/:id', verifyJWT_MW, users.updateUser);
  apiRoute.delete('/:id', verifyJWT_MW, users.deleteUser);

  // apiRoute.route('*').all(verifyJWT_MW);

  return apiRoute;
}