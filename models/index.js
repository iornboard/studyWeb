const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; //  -> 모르겠다.
const config = require('../config/config')[env];  // -> 모르겠다. 
const User = require('./user');  // 여기 3줄은  model 파일에서 만든 .js 파일을 모듈로써 불러오고 있다. 
const Post = require('./post');
const Hashtag = require('./hashtag');


// db 객체를 생성중이다. 
const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,  //여기에서는 config.js의 내용을 받아오는 것이다. 
);


// db가 메인이다. 즉 우리가 다른 파일에서 데이터베이스에 접근할때는 우리가 만든 DB에서 접근하는 것이다.
// db 객체를 만들었고 이제 여기에다가 우리가 만든 모델들을 연결? 시킨다. 
db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

// 아래의 init 메서드와 associate 메서드는, 각 모듈(js)에서 클래스 내부에서 만들어진 메서드이다. 즉 우리가 만든거를 사용하는 것

User.init(sequelize);  // 데이터베이스 (mysql)에 각 모델을 생성하겠다는 뜻(스키마 내부에)
Post.init(sequelize);
Hashtag.init(sequelize);

User.associate(db);  // db의 연관정보를 통해서 연결한다. 
Post.associate(db);
Hashtag.associate(db);

module.exports = db;
