import { Roles } from '../../utils/enum';
import db from '../../models';
import { Op } from 'sequelize';


class UserController {
  async addUser(req, res, next) {
    try {

      if (req.body.password !== req.body.confirm_password) {
        throw new Error("Password and confirm_password do not match.");
      }
      const { email, phone_number } = req.body;
      const user = await db['user'].findOne({
        where: {
          email: {
            [Op.iLike]: `${email}`
          }
        }
      });
      if (user) {
        return res.status(400).send({ success: false, message: 'User already exists' });
      }
      const newUser = await db['user'].create(req.body);
      const response = { ...newUser.toJSON() };
      delete response.password;
      delete response.confirm_password;
      delete response.deleted_at;
      delete response.token;


      return res.status(200).json({ success: true, message: 'User created successfully', data: response });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const offset = parseInt(req.query.offset);
      const limit = parseInt(req.query.limit);
      const roleType = req.headers.role_type;
      const roleTypeAsNumber = parseInt(roleType, 10);

      if (roleTypeAsNumber && roleTypeAsNumber === Roles.Admin) {
        let user = [];
        let totalCount = 0;

        if (limit && offset) {

          const { count, rows } = await db['user'].findAndCountAll({
            include: [{ all: true }],
            where: {
              role_type: Roles.User
            },
            offset: offset - 1,
            limit: limit
          });
          user = rows;
          totalCount = count;
        } else {
          user = await db['user'].findAll({
            where: {
              role_type: Roles.User
            }, order: [['created_at', 'DESC']],
          });
          totalCount = user.length;
        }
        const currentPage = offset && limit ? Math.floor(offset / limit) + 1 : 1;

        const response = user.map(user => {
          const response = { ...user.toJSON() };
          delete response.password;
          delete response.confirm_password;
          delete response.deleted_at;
          delete response.token;
          return response;
        });

        return res.status(200).json({
          success: true,
          message: 'Successfully',
          data: response,
          pagination: {
            totalCount,
            currentPage,
            totalPages: Math.ceil(totalCount / offset)
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Only Admin can veiw User',
        });
      }

    } catch (error) {
      next(error);
    }
  }



  async getOneUser(req, res, next) {
    try {
      const user = await db['user'].findOne({
        where: { id: req.params.id, role_type: Roles.User },
        include: [{ all: true }],
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'No user found' });
      }

      const response = { ...user.toJSON() };
      delete response.password;
      delete response.confirm_password;
      delete response.deleted_at;

      return res.status(200).json({ success: true, message: 'Successfully', data: response });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Please send id in params' });
      }
      const user = await db['user'].findOne({
        where: { id: id, role_type: Roles.User }

      });

      if (!user) {
        return res.status(400).json({ success: false, message: "user isn't found" });
      }

      await user.destroy();
      return res.status(200).json({ success: true, message: 'Successfully Deleted' });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Please send the ID in params' });
      }

      const user = await db['user'].findByPk(id);

      if (!user) {
        return res.status(400).json({ success: false, message: "User doesn't exist" });
      }
      if (req.body.firstName) {
        user.firstName = req.body.firstName;
      }
      if (req.body.lastName) {
        user.lastName = req.body.lastName;
      }
      if (req.body.email) {
        user.email = req.body.email;
      }
      if (req.body.phone_number) {
        user.phone_number = req.body.phone_number;
      }
      user.save();

      const response = { ...user.toJSON() };
      delete response.password;
      delete response.confirm_password;
      delete response.deleted_at;

      return res.status(200).json({ success: true, message: 'Successfully Updated', data: response });
    } catch (error) {
      next(error);
    }
  }
}
export default UserController;