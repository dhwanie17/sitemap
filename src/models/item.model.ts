import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


module.exports = function (sequelize, DataTypes) {
  const item = sequelize.define('item', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wf_id: {
      type: DataTypes.STRING,
    },
    archive: {
      type: DataTypes.BOOLEAN,
    },
    draft: {
      type: DataTypes.BOOLEAN,
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
    publishedOn: {
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
    collection_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'collection',
        key: 'id'
      },
    },
  }, {
    tableName: 'item',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  item.associate = function (models) {
    item.belongsTo(models.webFlowUser, {
      foreignKey: 'wf_user_id',
    });
  };

  item.associate = function (models) {
    item.belongsTo(models.collection, {
      foreignKey: 'collection_id',
    });
  };
  return item;
};