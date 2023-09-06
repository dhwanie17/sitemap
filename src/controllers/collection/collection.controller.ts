import Webflow from "webflow-api";
import db from '../../models';


class CollectionController {


  async getCollections(req, res, next) {
    const siteId = req.query.siteId
    const webFlowUser = req.webFlowUser
    const app = new Webflow({ token: webFlowUser.wf_access_token });
    const site = await app.site({ siteId: siteId });
    const collections = await site.collections();
    const matchSite = await db["site"].findOne({
      where: {
        wf_id: siteId
      }
    })
    let defaultCollections = [];
    if (matchSite) {
      defaultCollections = await db["collection"].findAll({
        where: {
          site_id: matchSite.id,
        },
      });
    }
    const response = {
      collections,
      defaultCollections
    }
    return res.status(200).json({
      success: true,
      message: 'Fetched successfully',
      data: response,
    });
  }
}

export default CollectionController;