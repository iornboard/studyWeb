// 기본적으로 auth 라는 것은 어떤 미들웨이가 실행 되기 전에 자격이 되는지 안되는지 검사하는 부분이다. (아마도)
// 무슨 뜻이냐면 우리가 로그인 할 때 아직 쿠키가 남아 있는지, 그래서 로그인 정보가 남아 있어서 로그인 상태인지 
// 아니면 이 사람이 계정이 없어서 회원가입이 필요한 사람인지
// 이러한 것들을 파악하고, 거기에 맞는 미들워어(라우터?)를 실행시키는 부분으로 알고있다. 

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); // middlewares 모듈 안에 들어있는 모듈만 가져와서 쓴다. {구조분해 할당으로 가져오는 중이다.}
const User = require('../models/user'); // 모델에서 user 클래스만 가져오는 중이다.

const router = express.Router();  // 이게 뭐지? 왜 아무것도 없지?


// 아래의 미들웨어는 다음과 같다.(회원가입을 하는 미들웨어) 
  // 0.isNotLoggedIn 미들웨어를 실행한다. >> (isNotLoggedIn - 로그인 상태인지 확인하는 미들웨어 // 정확히는 사용자 정보가 있는지 )(middlewares.js 안에 있음)(로그인 상태가 아니라면 다음 실행)
  // 1.회원가입정보를 입력해서 서버로 요청하면, 정보를 DB 정보(이메일)과 확인해서, 만약 일치하는 이메일이 있으면 리다이렉션을 한다. (만약 같은 이메일이 있으면  회원가입 할 수가 없는 거니까) 
  // 2.1번 절차가 끝나면, 해쉬함수로 패스워드를 암호화 하고 만든 객체를 user 테이블에 생성한다. 이후 리다이렉션을 한다(메인페이지) (user객체를 만들어서 데이터 베이스에 넣는다는거 자체가 회원가입 한다는 의미니까) 

router.post('/join', isNotLoggedIn, async (req, res, next) => {  // 중간에 isNotLoggedIn 미들워어가 있는데 저렇게 해놓으면, 이 미들웨이를 실행시키지 전에 isNotLoggedIn를 실행 한다는 뜻
  const { email, nick, password } = req.body; // 구조분해 할당, 페이지에서 입력한 정보가 각각 알맞게 들어간다. 
  try {
    const exUser = await User.findOne({ where: { email } }); // {} 안에는 쿼리(질의)문인데, 이는 데이터 베이스에서 검색하는 용도이고, 그 안에 있는 email 변수는 위에서 구조분해한 변수이다. 만약 찾으면 exUser 변수에 user객체가 들어간다. 
    if (exUser) { // 만약 위에서 검색되서 객체가 반환된다는 것은, >> 있는 이메일 이라는 뜻이겠지
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12); // 비밀번호 암호화 , (암호화 하는 이유가 있었는데 까먹음)
    await User.create({ // 이 부분도 쿼리고 >> {회원객체} 를 만들고 이를 CREATE 해서 데이터베이스에 저장하는 중이다. 
      email,
      nick,
      password: hash,
    });
    return res.redirect('/'); // 메인 페이지로 간다. 
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// 아래의 미들웨어는 다음과 같다.(로그인을 하는 미들웨어 ) 
// 0. isNotLoggedIn 미들웨어를 실행 (middlewares.js 안에 있음)
// 1. 

router.post('/login', isNotLoggedIn, (req, res, next) => { //isNotLoggedIn 미들웨어를 실행 - 로그인 상태가 아닌지를 확인해야겠지
  passport.authenticate('local', (authError, user, info) => { // 교수님께서 첫번째 인자는 보통 에러라고 하셨는데 이게 맞나,,
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});



  // 아래의 미들웨어는 다음과 같다.(로그아웃을 하는 미들웨어 -  로그인 상태인 경우) 
 // 0.isLoggedIn 미들웨어를 실행한다.(middlewares.js 안에 있음)


router.get('/logout', isLoggedIn, (req, res) => { // isLoggedIn 미들웨어로 로그인 상태인지 확인한다. 
  req.logout();  // req.user 객체를 삭제 // 로그아웃 메서드 실행 (logout메서드가 어딘가에 만들어져 있을 거 같긴하다. )
  req.session.destroy(); // req.session 객체를 삭제 // DELETE 가 아닌  DESTROY를 쓰는 이유는 DELETE 메서드가 이미 자바스크립트에서 다른 의미로 쓰고 있기 때문 + 근데 이거 왜 하는지는 모르겠다.
  res.redirect('/'); // 메인페이지로 리다이렉션 한다. 
});



router.get('/kakao', passport.authenticate('kakao')); // 

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;
