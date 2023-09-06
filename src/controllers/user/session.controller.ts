import db from '../../models/index';
import { ApplicationController } from './';
export class SessionController extends ApplicationController {
  constructor() {
    super('user');
  }

  async login(req, res, next) {
    try {
      if (!req.body.email && !req.body.password) {
        return res.status(401).json({
          success: false,
          errors: { message: 'You have entered an invalid email or password' },
        });
      }

      const data = await db['user'].findOne({
        where: { email: req.body.email },
      });

      if (data) {
        if (data.authenticate(req.body.password)) {
          const authToken = data.generateToken();

          const userLogInDetails = await db['user'].update({
            token: authToken,
          }, { where: { id: data.id } });

          if (!userLogInDetails) {
            return res.status(401).send({
              success: false,
              message: 'User login is not created',
            });
          }
          const { id, email, phone_number, firstName, lastName } = data;
          const user = {
            id,
            firstName,
            lastName,
            email,
            phone_number,
            token: authToken,
          };
          res.status(200).json({
            success: true,
            user,
            message: 'Login Successfully'
          });

        } else {
          return res.status(401).json({
            success: false,
            message: 'You have entered an invalid email or password',

          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'You have entered an invalid email or password',
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    try {
      if (!req.params.id) {
        return res.status(401).json({
          success: false,
          message: 'Not Permitted.',
        });
      }
      const storage = await db['user'].findOne({
        where: { id: req.params.id },
      });

      if (!storage) {
        return res.status(401).send({
          success: false,
          message: 'User Session detail is not available',
        });
      }
      const deletedSession = await db['user'].update({ token: null }, {
        where: { id: req.params.id },
      });

      if (!deletedSession) {
        return res.status(401).send({
          success: false,
          message: 'User Session detail is not deleted',
        });
      }
      return res.status(200).send({
        success: true,
        message: 'You have Successfully logout',
      });

    } catch (error) {
      return res.status(400).send({ success: false, message: error });
    }
  }
}
