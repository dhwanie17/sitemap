import { validateRequest } from './helper';
import Joi from 'joi';

export const createUserSchema = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().trim(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string().min(6).required(),
    phone_number: Joi.string()
  });
  validateRequest(req, next, schema);
};