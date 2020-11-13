const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; //로컬 인증에 사용하는 모듈이다.
const bcrypt = require('bcrypt'); //암호화에 사용하는 모듈이다.

const User = require('../models/user'); 

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email', //폼 필드로부터 전달받은 이메일 값을 저장한다.
    passwordField: 'password', //폼 필드로부터 전달받은 비밀번호 값을 저장한다.
  }, async (email, password, done) => {
    try {
      const exUser = await User.findOne({ where: { email } }); //user객체에서 이메일 값을 비교하여 저장한다.
      if (exUser) {
        const result = await bcrypt.compare(password, exUser.password); //홈에서 전달받은 패스워드 값과 유저정보에 저장된 패스워드 값을 비교한다.
        if (result) {
          done(null, exUser); //로그인에 성공하면 전달받은 유저객체를 세선(req.session.passport.user)에 저장한다.
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' }); //로그인에 실패하면 에러메시지를 출력한다.
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};


