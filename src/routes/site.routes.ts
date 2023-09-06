import { verifyAccessToken, verifyJWT_MW } from '../config/middlewares';
import { SiteController } from '../controllers/site';

export function initRoutes(app, router) {
  const apiRoute = router;

  const Site = new SiteController();
  apiRoute.get('/getSites', verifyJWT_MW, verifyAccessToken, Site.getSites);
  apiRoute.get('/getUrl2', verifyJWT_MW, Site.getUrl2);
  apiRoute.post('/getUrl', verifyJWT_MW, verifyAccessToken, Site.getUrl);
  apiRoute.post('/getSitePages', verifyJWT_MW, verifyAccessToken, Site.getSitePages);
  apiRoute.get('/getSiteDomain', verifyJWT_MW, verifyAccessToken, Site.getSiteDomain);

  return router;
}
