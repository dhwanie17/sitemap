
import db from '../models/';
import { logger } from '../logger/Logger';
import { verifyJWTToken } from './auth';

export async function verifyAccessToken(req, res, next) {
  if (req.headers.wfauthorization) {
    const webFlowUser = await db['webFlowUser'].findOne({ where: { wf_access_token: req.headers.wfauthorization } });
    if (!webFlowUser) {
      req.webFlowUser = undefined;
      next();
    } else {
      req.webFlowUser = webFlowUser;
      next();
    }
  } else {
    req.webFlowUser = undefined;
    return res.status(401).json({ success: false, message: 'Unauthorized user!' });
  }
}

export function verifyJWT_MW(req, res, next) {
  if (req.headers.authorization) {
    verifyJWTToken(req.headers.authorization).then(async decode => {
      const user = await db['user'].findOne({ where: { id: decode['data'].id } });
      if (!user) {
        req.user = undefined;
        next();
      } else {
        req.user = user;
        next();
      }
    }).catch(function (err) {
      req.user = undefined;
      res.status(401).json({ success: false, message: err.message });
    });
  } else {
    req.user = undefined;
    return res.status(401).json({ success: false, message: 'Unauthorized user!' });
  }
}