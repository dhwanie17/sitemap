import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


module.exports = function (sequelize, DataTypes) {
  const url = sequelize.define('url', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
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
    ref_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    ref_type: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    site_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'site',
        key: 'id'
      },
    },
    item_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'url',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  url.associate = function (models) {
    url.belongsTo(models.webFlowUser, {
      foreignKey: 'wf_user_id',
    });
  };
  url.associate = function (models) {
    url.belongsTo(models.site, {
      foreignKey: 'site_id',
    });
  };

  return url;
};