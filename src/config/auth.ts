import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function verifyJWTToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
      if (err) {
        if (err.name === 'TokenExpiredError') { // Token has expired
          return reject({ status: 401, message: 'JWT expired' });
        } // Other JWT validation errors
        return reject({ status: 401, message: 'Invalid JWT token' });
      }
      resolve(decodedToken);
    });
  });
}

export function createJWToken(payload) {
  return jwt.sign({
    data: payload
  }, process.env.SECRET, {
    algorithm: 'HS256'
  });
}
