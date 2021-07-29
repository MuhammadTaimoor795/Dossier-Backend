'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
     /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
        // define association here
        User.hasOne(models.RefreshToken, {
          as: "RefreshTokens",
          foreignKey: "userId",
        });
      }
      toJSON() {
        return { ...this.get(), id: undefined };
      }
    }
    User.init(
      {
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        email: DataTypes.STRING,
        firstName: DataTypes.STRING,
        password: DataTypes.STRING,
        lastName: DataTypes.STRING,
        role: DataTypes.INTEGER,
        userName: DataTypes.STRING,
        emailVerified: DataTypes.BOOLEAN,
        oAuthId: DataTypes.STRING,
        image:DataTypes.STRING,
        streetAddress: DataTypes.STRING,
        country: DataTypes.STRING,
        state: DataTypes.STRING,
        zipcode: DataTypes.STRING,
        phone: DataTypes.INTEGER,
        conrtibutorbanner: DataTypes.STRING,
        profileImg: DataTypes.STRING,
        verifiedContributor: DataTypes.BOOLEAN,
        downloadLimit: DataTypes.INTEGER,
        currentDownloadLimit: DataTypes.INTEGER,
        
        // new added
        active: DataTypes.BOOLEAN,
        verificationToken: { type: DataTypes.STRING },
        verified: { type: DataTypes.DATE },
        resetToken: { type: DataTypes.STRING },
        resetTokenExpires: { type: DataTypes.STRING },
        passwordReset: { type: DataTypes.DATE },
        limitperDay:DataTypes.INTEGER,
        // no idea
        isVerified: {
          type: DataTypes.VIRTUAL,
          get() {
            return !!(this.verified || this.passwordReset);
          },
        },
      },{
    sequelize,
    modelName: 'User',
  });
  return User;
};