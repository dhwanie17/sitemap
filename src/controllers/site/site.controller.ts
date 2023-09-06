import db from '../../models';
import { logger } from '../../logger/Logger';
import Webflow from "webflow-api";
import axios from 'axios';
import { parseString } from 'xml2js';
import { create, fragment } from 'xmlbuilder2';
import path from 'path';
import { refType } from '../../constant/enum';

class SiteController {
  async getSites(req, res, next) {
    try {
      const webFlowUser = req.webFlowUser;
      const app = new Webflow({ token: webFlowUser.wf_access_token });
      const sites = await app.sites();
      const sitesWithLastPublishedDate = sites.filter(site => site.lastPublished);

      const createdSites = [];
      for (const site of sitesWithLastPublishedDate) {
        const existingSite = await db['site'].findOne({ where: { wf_id: site._id } });
        if (!existingSite) {
          const createdSite = await db['site'].create({
            wf_id: site._id,
            createdOn: site.createdOn,
            name: site.name,
            shortName: site.shortName,
            lastPublished: site.lastPublished,
            previewUrl: site.previewUrl,
            timezone: site.timezone,
            wf_user_id: webFlowUser.id
          });
          createdSites.push(createdSite);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Fetched Sites successfully',
        data: createdSites,
      });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching and creating sites',
      });
    }
  }


  async getSiteDomain(req, res, next) {
    try {
      const siteId = req.query.siteId
      const webFlowUser = req.webFlowUser
      const app = new Webflow({ token: webFlowUser.wf_access_token });

      const siteDetails = await app.site({ siteId });

      // Extract the domains from the site details
      const domains = await siteDetails.domains();

      return res.status(200).json({
        success: true,
        message: 'Fetched site domains successfully',
        data: domains,
      });
    } catch (error) {
      console.log(error);
    }
  }



  async getSitePages(req, res, next) {
    try {
      const webFlowUser = req.webFlowUser;
      const app = new Webflow({ token: webFlowUser.wf_access_token });
      const siteId = req.body.siteId;
      const site = await db["site"].findOne({
        where: {
          wf_id: siteId
        }
      });
      console.log("===>site", site);

      const domainId = req.body.domainId;
      const domains = await app.domains({ siteId: siteId }); // Provide the site ID
      const domain = domains.find(d => d._id === domainId);
      console.log("=====>", domain);

      if (!domain) {
        return res.status(404).json({
          success: false,
          message: 'Domain not found',
        });
      }

      const staticUrl = `https://${domain.name}`;
      const sitemapUrl = `${staticUrl}/sitemap.xml`;
      const response = await axios.get(sitemapUrl);
      const xmlData = response.data;

      // Extract page names from the sitemap XML and remove extra characters
      const pageNames = [];
      parseString(xmlData, (err, result) => {
        if (err) {
          console.error(err);
          return next(err);
        }

        const urls = result.urlset.url || [];
        urls.forEach(url => {
          const loc = url.loc && url.loc[0];
          if (loc) {
            const parts = loc.split('/');
            const pageName = parts[parts.length - 1].trim(); // Remove extra characters
            if (pageName) {
              pageNames.push(pageName);
            }
          }
        });
      });

      console.log("Page Names:", pageNames);

      // Return page names in the response
      return res.status(200).json({
        success: true,
        pageNames: pageNames,
      });
    } catch (error) {
      console.log("error", error);
      next(error);
    }
  }


  async getUrl(req, res, next) {
    try {
      const user = req.user;
      const webFlowUser = req.webFlowUser;
      const app = new Webflow({ token: webFlowUser.wf_access_token });
      const siteId = req.body.siteId;
      const site = await db["site"].findOne({
        where: {
          wf_id: siteId
        }
      })
      const domainId = req.body.domainId;
      const domains = await app.domains({ siteId: siteId }); // Provide the site ID
      const domain = domains.find((d) => d._id === domainId);

      if (!domain) {
        return res.status(404).json({
          success: false,
          message: "Domain not found",
        });
      }

      const collectionIdsWithItemIds = req.body.collectionIds || [];
      const collectionsWithItems = await Promise.all(
        collectionIdsWithItemIds.map(async (collectionInfo) => {
          const collectionId = collectionInfo.collectionId;
          const itemIds = collectionInfo.itemIds || [];

          const collection = await app.collection({ collectionId });
          const items = await Promise.all(
            itemIds.map(async (itemId) => {
              const item = await collection.item({ itemId });
              const createdItems = [];

              const existingItem = await db['item'].findOne({ where: { wf_id: item._id } });
              if (!existingItem) {
                const collection = await db['collection'].findOne({
                  where: {
                    wf_id: item._cid
                  }
                })
                const createdItem = await db['item'].create({
                  wf_id: item._id,
                  archive: item._archived,
                  draft: item._draft,
                  description: item.response,
                  name: item.name,
                  createdOn: item['created-on'],
                  publishedOn: item['published-on'],
                  slug: item.slug,
                  wf_user_id: webFlowUser.id,
                  collection_id: collection.id
                });
                createdItems.push(createdItem);
              }

              return item;
            })
          );

          return {
            collection,
            items,
          };
        })
      );
      const pageNames = req.body.pageNames
      const staticUrl = `https://${domain.name}`;
      const generatedUrls = [];

      collectionsWithItems.forEach((collection) => {
        const collectionSlug = collection.collection.slug;
        const items = collection.items || [];
        items.forEach(async (item) => {
          const itemSlug = item.slug;
          const url = `${staticUrl}/${collectionSlug}/${itemSlug}`;
          const itemDetails = await db['item'].findOne({
            where: {
              wf_id: item._id
            }
          })
          const existingUrl = await db['url'].findOne({ where: { url: url } });
          if (!existingUrl) {
            await db["url"].create({
              wf_user_id: webFlowUser.id,
              ref_id: 2,
              ref_type: refType.COLLECTION,
              site_id: site.id,
              item_id: itemDetails.id,
              url: url
            })
          }
          generatedUrls.push(url);
        });
      });

      const sitemapUrl = `${staticUrl}/sitemap.xml`;
      const response = await axios.get(sitemapUrl);
      const xmlData = response.data;
      let urls = [];
      parseString(xmlData, (err, result) => {
        if (err) {
          logger.error(err);
          return;
        }
        urls = result.urlset.url.map((url) => url.loc[0].trim());
      });

      // Use filter to select URLs with matching page names
      const filteredUrls = urls.filter((url) => {
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const pageName = decodeURIComponent(lastPart);
        return pageNames.includes(pageName);
      });

      // Use Promise.all to create the database entries for filtered URLs
      await Promise.all(filteredUrls.map(async (url) => {
        const existingUrl = await db['url'].findOne({ where: { url: url } });
        if (!existingUrl) {
          await db["url"].create({
            wf_user_id: webFlowUser.id,
            ref_id: null,
            ref_type: refType.PAGE,
            site_id: site.id,
            url: url
          });
        }
      }));


      const mergedAndUniqueUrls = Array.from(new Set([...filteredUrls, ...generatedUrls]));
      const xml = create({ version: "1.0", encoding: "UTF-8" }).ele("urlset", {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
      });



      mergedAndUniqueUrls.forEach((url) => {
        xml
          .ele("url")
          .ele("loc")
          .txt(url)
          .up()
          .ele("xhtml:link", { rel: "alternate", hreflang: "x-default", href: url })
          .up()
          .up();
      });

      const sitemapXmlString = xml.end({ prettyPrint: true });

      return res.status(200).set("Content-Type", "application/xml").send(sitemapXmlString);
    } catch (error) {
      console.log("error", error);
      next(error);
    }
  }
}

export default SiteController;