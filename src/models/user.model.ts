import { createJWToken } from '../config/auth';
import bcrypt from "bcrypt";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


module.exports = function (sequelize, DataTypes) {
  const user = sequelize.define('user', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      unique: true,
      type: DataTypes.STRING,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    confirm_password: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING
    },
  }, {
    tableName: 'user',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  user.beforeSave(user => {
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    }
  });

  user.prototype.generateToken = function generateToken() {
    return createJWToken({ email: this.email, id: this.id });
  };

  user.prototype.authenticate = function authenticate(value) {
    if (bcrypt.compareSync(value, this.password))
      return this;
    else
      return false;
  };
  user.associate = function (models) {
    user.hasMany(models.webFlowUser, {
      foreignKey: 'user_id'
    });
  };

  return user;
};