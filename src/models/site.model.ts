import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


module.exports = function (sequelize, DataTypes) {
  const site = sequelize.define('site', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wf_id: {
      type: DataTypes.STRING,
    },
    createdOn: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    shortName: {
      type: DataTypes.STRING,
    },
    lastPublished: {
      type: DataTypes.STRING,
    },
    previewUrl: {
      type: DataTypes.STRING,
    },
    timezone: {
      type: DataTypes.STRING,
    },
    wf_user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'webFlowUser',
        key: 'id'
      },
    },
  }, {
    tableName: 'site',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  site.associate = function (models) {
    site.belongsTo(models.webFlowUser, {
      foreignKey: 'wf_user_id',
    });
  };
  site.associate = function (models) {
    site.hasMany(models.collection, {
      foreignKey: 'site_id'
    });
  };
  site.associate = function (models) {
    site.hasMany(models.url, {
      foreignKey: 'site_id'
    });
  };
  site.associate = function (models) {
    site.hasMany(models.domain, {
      foreignKey: 'site_id'
    });
  };

  return site;
};