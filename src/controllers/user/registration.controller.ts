import { ApplicationController } from './';
export class RegistrationController extends ApplicationController {
  constructor() {
    super('User');
  }
  signup(req, res) {
    req.pick = ['user_name', 'password'];
    return super._create(req, res, { message: 'Congrats! You have successfully registered' });
  }
}
