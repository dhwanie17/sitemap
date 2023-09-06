import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


module.exports = function (sequelize, DataTypes) {
  const webFlowUser = sequelize.define('webFlowUser', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wf_id: {
      type: DataTypes.STRING,
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      },
    },
    email: {
      type: DataTypes.STRING,
    },
    wf_access_token: {
      type: DataTypes.STRING,
    },
    firstname: {
      type: DataTypes.STRING,
    },
    lastname: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'webFlowUser',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  webFlowUser.associate = function (models) {
    webFlowUser.belongsTo(models.user, {
      foreignKey: 'user_id',
    });
  };

  webFlowUser.associate = function (models) {
    webFlowUser.hasMany(models.site, {
      foreignKey: 'wf_user_id'
    });
  };
  webFlowUser.associate = function (models) {
    webFlowUser.hasMany(models.collection, {
      foreignKey: 'wf_user_id'
    });
  };
  webFlowUser.associate = function (models) {
    webFlowUser.hasMany(models.item, {
      foreignKey: 'wf_user_id'
    });
  };
  webFlowUser.associate = function (models) {
    webFlowUser.hasMany(models.url, {
      foreignKey: 'wf_user_id'
    });
  };
  webFlowUser.associate = function (models) {
    webFlowUser.hasMany(models.domain, {
      foreignKey: 'wf_user_id'
    });
  };

  return webFlowUser;
};