// 포스트 관련 모델  >> 우리가 채팅치면 만들어 지는 것

const Sequelize = require('sequelize');


// user 에서 써 놓은 것과 동일하다. 
module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: false,
      charset: 'utf8mb4',  // 이거 이모티콘 때문에 쓰는거다
      collate: 'utf8mb4_general_ci',
    });
  }

  // 관계설정 부분 
  // 대부분의 설정은 user에서 설정하였다.
  static associate(db) {
    db.Post.belongsTo(db.User);  // user 입장에서는 post와 1:N관계였으니 포스트 입장에서는 N:1관계이다. // belongsto를 사용하는데 즉 hsaMany와 belongsto는 서로 짝이라는 뜻이다.
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' }); // 해시태그 모델과는 N:M관계이다. 왜냐하면 게시글은 여러개의 해시태그를 가질 수 있고, 반대로 해시태그도 여러개의 개시글을 가질 수 있기 때문이다.
  }
};
