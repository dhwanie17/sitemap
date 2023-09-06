import Webflow from "webflow-api";
import db from '../../models';


class ItemController {

  async getItems(req, res, next) {
    try {
      const user = req.user;
      const webFlowUser = req.webFlowUser;
      const app = new Webflow({ token: webFlowUser.wf_access_token });

      const collectionIds = req.body.collectionIds;
      const collections = await Promise.all(collectionIds.map(id => app.collection({ collectionId: id })));

      const itemPromises = collections.map(async collection => {
        const items = await collection.items();

        // Filter items where _draft is false
        const itemsWithoutDraft = items.filter(item => !item._draft);

        return itemsWithoutDraft;
      });

      const filteredItems = await Promise.all(itemPromises);

      const collectionsWithItems = collections.map((collection, index) => ({
        collection: collection,
        items: filteredItems[index],
      }));

      return res.status(200).json({
        success: true,
        message: 'Fetched successfully',
        data: collectionsWithItems,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }

  }




  // const site = await app.site({ siteId: siteId });
  // // const collections = await site.collections();
  // const matchSite = await db["site"].findOne({
  //   where: {
  //     wf_id: siteId
  //   }
  // })
  // let defaultCollections = [];
  // if (matchSite) {
  //   defaultCollections = await db["collection"].findAll({
  //     where: {
  //       site_id: matchSite.id,
  //     },
  //   });
  // }
  // const response = {
  //   collections,
  //   defaultCollections
  // }
  //   return res.status(200).json({
  //     success: true,
  //     message: 'Fetched successfully',
  //     data: response,
  //   });
}


export default ItemController;