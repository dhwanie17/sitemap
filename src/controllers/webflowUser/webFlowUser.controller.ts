import db from '../../models';
import Webflow from "webflow-api";

class UserController {

  async authorize(req, res, next) {
    try {
      const webflow = new Webflow();
      const url = webflow.authorizeUrl({ client_id: process.env.CLIENT_ID });
      res.redirect(url);
    } catch (error) {
    }
  }

  async createWebFlowUser(req, res, next) {
    try {
      const loginuser = req.user
      const webflow = new Webflow();
      const { access_token } = await webflow.accessToken({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.SECRET_KEY,
        code: req.query.code,
      });

      const app = new Webflow({ token: access_token });
      const { user } = await app.authenticatedUser();
      let findUser
      const getUser = await db['webFlowUser'].findOne({ where: { email: user.email } })
      if (!getUser) {
        const newUser = await db['webFlowUser'].create({
          wf_id: user._id,
          email: user.email,
          firstname: user.firstName,
          lastname: user.lastName,
          wf_access_token: access_token,
          user_id: loginuser.id
        });
        findUser = newUser
        console.log("====>User", newUser);
      } else {
        await db['webFlowUser'].update(
          {
            wf_access_token: access_token
          },
          { where: { id: getUser.id } }
        );
        const updatedUser = await db['webFlowUser'].findOne({
          where: { id: getUser.id }
        });
        findUser = updatedUser
      }
      return res.status(200).json({
        success: true,
        message: 'User added successfully',
        data: { user: findUser }
      });
    } catch (error) {
      console.log("error", error)
    }
  }
  async getWfUserDetails(req, res, next) {
    try {
      const loginuser = req.user
      const webflow = new Webflow();
      const getUser = await db['webFlowUser'].findAll({ where: { user_id: loginuser.id } })

      const allUserSites = [];

      // Iterate through each user and fetch their sites using the access token
      for (const user of getUser) {
        const userSites = await db['site'].findAll({ where: { wf_user_id: user.id } })
        allUserSites.push({ userDetails: user, userSites });
      }

      // Return the user sites data in the response
      return res.status(200).json({
        success: true,
        message: 'Sites fetched successfully for all users',
        data: allUserSites,
      });
    } catch (error) {
      console.log("error", error)
    }
  }
}

export default UserController;