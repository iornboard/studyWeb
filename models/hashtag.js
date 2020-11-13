// 각 게시글에 들어가는 해시태그

const Sequelize = require('sequelize');


// user 에서 써 놓은 것과 동일하다. ( user 먼저 보고올 것 )
module.exports = class Hashtag extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      title: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Hashtag',
      tableName: 'hashtags',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }


  // 관계설정 부분
  static associate(db) {
    db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });  // 여기에서도 N:M 관계를 사용한다.
  }
};

