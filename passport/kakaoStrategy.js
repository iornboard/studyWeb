const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  passport.use(new KakaoStrategy({ //카카오 로그인 전략을 수행한다.
    clientID: process.env.KAKAO_ID, 
    callbackURL: '/auth/kakao/callback', //카카오 개발자 사이트에서 지정한 리다이렉트 주소를 저장한다.
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile', profile); //카카오 api를 사용하기 위한 토큰과profile정보를 인자로 받아 카카오 로그인 전략을 수행한다.
    try {
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'kakao' }, //카카오 인증 절차를 거쳐 로그인 한 유저 중 아이디 값을 비교한다. 
      });
      if (exUser) { // 로그인에 성공하면 유저 객체를 세션(req.session.passport.user)에 저장한다.
        done(null, exUser);
      } else { // 로그인에 실패하면 회원가입 페이지로 리다이렉트되고, 새로운 유저객체를 생성한다.
        const newUser = await User.create({
          email: profile._json && profile._json.kaccount_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser); //새롭게 생성한 유저정보를 전달한다.
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
