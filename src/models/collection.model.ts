import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


module.exports = function (sequelize, DataTypes) {
  const collection = sequelize.define('collection', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wf_id: {
      type: DataTypes.STRING,
    },
    lastUpdated: {
      type: DataTypes.STRING,
    },
    createdOn: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
    singularName: {
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
    site_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'site',
        key: 'id'
      },
    },
  }, {
    tableName: 'collection',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  collection.associate = function (models) {
    collection.belongsTo(models.webFlowUser, {
      foreignKey: 'wf_user_id',
    });
  };
  collection.associate = function (models) {
    collection.belongsTo(models.site, {
      foreignKey: 'site_id',
    });
  };
  collection.associate = function (models) {
    collection.hasMany(models.item, {
      foreignKey: 'collection_id'
    });
  };
  return collection;
};