import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


module.exports = function (sequelize, DataTypes) {
  const domain = sequelize.define('domain', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wf_id: {
      type: DataTypes.STRING,
    },
    name: {
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
    wf_user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'webFlowUser',
        key: 'id'
      },
    },
  }, {
    tableName: 'domain',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  domain.associate = function (models) {
    domain.belongsTo(models.site, {
      foreignKey: 'site',
    });
  };
  domain.associate = function (models) {
    domain.belongsTo(models.webFlowUser, {
      foreignKey: 'wf_user_id',
    });
  };

  return domain;
};