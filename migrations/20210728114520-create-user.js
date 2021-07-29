'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('Users', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      oAuthId:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      image:{
        type:DataTypes.STRING,
        allowNull:true
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      userName: {
        type: DataTypes.STRING,
      },
      streetAddress: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      zipcode: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.INTEGER,
      },
      profileImg: {
        type: DataTypes.STRING,
      },
      verifiedContributor: {
        type: DataTypes.BOOLEAN,
      },
      conrtibutorbanner: {
        type: DataTypes.STRING,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
      },
      downloadLimit: {
        type: DataTypes.INTEGER,
      },
      currentDownloadLimit: {
        type: DataTypes.INTEGER,
      },
      
      /// new waly
      active: {
        type: DataTypes.BOOLEAN,
      },
      verificationToken: { type: DataTypes.STRING },
      verified: { type: DataTypes.DATE },
      resetToken: {
        type: DataTypes.STRING,
      },
      resetTokenExpires: {
        type: DataTypes.STRING,
      },
      passwordReset: {
        type: DataTypes.DATE,
      },
      limitperDay: {
        type: DataTypes.INTEGER,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        get() {
          return !!(this.verified || this.passwordReset);
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      
      
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('Users');
  }
};