const Sequelize = require('sequelize');

//sequelize는 노드에서 데이터베이스를 효율적으로 다루기 위한 모듈이다. (자바스크립트 구문을 MYsql 구문으로 바꿀 수 있다.)

// 모델(클래스 객체 [자바스크립트]) 와 객체(DB [mySQL]을 연결하는 ORM)

// 여기에서는 user 클래스를 따라서 user 테이블을 생성합니다.
// 리엑트의 컴포넌트와 비슷한거 같아 >> 시퀄라이즈 모델을 상속하고 있어

// 구성은 클래스{{ init 메서드 }   { associate 메서드 }}
// init 메서드는 스키마에 데이터베이스를 생성할 때 사용하는 것이고,  associate 메서드는 각 테이블을 연관지을때 사용하는 것이다. 

// 리턴되어서 나오는 객체의 키 값은, 데이터베이스 테이블의 키 값이 된다.

// 시퀄라이즈 모듈을 실행하기 위한 기본 설정값(config)는 index에 올라와 있다. 

// 기본적으로 모델은 단수형 테이블은 복수형으로 이름을 지어주자

module.exports = class User extends Sequelize.Model {   // 모듈로 설정중이다. index에서 이 js파일을 모둘로써 불러오고 있다. 
  static init(sequelize) {
    return super.init({  // super.init은 무엇인가?
      email: {       // 각 값은 는 또 다시 객체로써 이중 객체가 된다.   // user =>  예시 {키 : {키 : 값}}
        type: Sequelize.STRING(40),  // 타입의 설정
        allowNull: true,  // null을 허용할지 안할지
        unique: true,  // primary_key 기본키 설정을 의미합니다. 
      },
      nick: {  // 아이디?
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      password: {  // 비밀번호
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      provider: {  // local 일경우 일반 local 로그인을, kakao일경우 kakao 로그인을 한 것 이다. 
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'local',   // 디폴트로 될경우 써지는 것들이다. 
      },
      snsId: { // 닉네임?
        type: Sequelize.STRING(30),
        allowNull: true,
      },
    }, { // 아래부터는 기본 테이블 설정(config)인데 찾아보기는 힘들었고 예상되는 것들만 적어놓는다. 
      //(이게 전체적인 건지 각 테이블의 요소에 공통적으로 적용되는 건지는 확인이 필요하다 교수님께 질문할 것)
      sequelize,
      timestamps: true, // 시간 (타임스탬프 - 데이터가 생성된 시간)
      underscored: false, // 이름표기 방식이 T -> snakeCase, F -> camelCase
      modelName: 'User', // 스키마 내부의 모델 이름인 듯(모르겠다.)
      tableName: 'users', // 실제 테이블 이름
      paranoid: true, // paranoid가 true라면...  > 내용이 길다. 한번 찾아볼 것 
      charset: 'utf8', // 문자 인코딩 방식을 뜻한다. 
      collate: 'utf8_general_ci',  // collaction(콜렉션)의 인코딩 방식을 뜻하는 것 같다. 

      //< charset 과 collate의 차이는 문자와 문자열의 차이가 아닐까 싶다. >
    });
  }

  
  // 아래부터는 테이블간의 관련정보를 말하는 것 같다. 
  // 데이터베이스는 여러개의 테이블(모델)로 이루어져 있는데 지금 현재 문서는 user table이다. 
  // 아래 문서는 다른 테이블간의 연관에 필요한 정보를 적은다. 
  // 정적 메소드를 사용하는데 https://jeonghwan-kim.github.io/dev/2020/07/06/sequelize-model.html 여기 내용이 도움 될 것

  static associate(db) {  // db는 index에서 만들어 진 것이다.
    db.User.hasMany(db.Post); // hasMany는 1:N관계를 의미한다. 즉 user 대 post는 1 : N 관계로 작동된다.   ( 아마 사용자 하나가 여러개의 post를 작성하기때문인 것 같다.)
    db.User.belongsToMany(db.User, {  // belongsToMany는 N:M관계를 의미한다. 즉 user 대 User는  N : M 관계로 작동된다.   (user 대 user는 팔로잉때문에 n:m관계를 사용하는 듯) (책 278P)
      foreignKey: 'followingId',    // N:M 관계에서는 두 모델간의 중간 모델이 생성되기 때문에 따로 정해 줄 것 이 많다. >> 이 설정이 없으면 컬럼이름이 모두 같은 이름이 되어버린다.  
      as: 'Followers', //   (이름 변경??)
      through: 'Follow',  // 생성될 모델이름을 Follow로 설정한다. <모델이 새로 만들어 진 것>
    });
    db.User.belongsToMany(db.User, {  // 근데 왜 N:M 관계 설정을 2번 하는지 모르겠다. 
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
  }
};
