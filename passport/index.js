const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');  

module.exports = () => {
  passport.serializeUser((user, done) => { //로그인 성공시 전달되는 유저정보를 세션에 저장하여 페이지 이동시에도 유저정보가 저장되도록 한다.
    done(null, user.id); // 유저 아이디를 req.user에 저장하고 요청을 처리할 때 사용한다.
  });

  passport.deserializeUser((id, done) => { //서버로 요청이 들어올 때마다 세션에 저장된 유저정보와 실제 db에 저장된 유저정보를 비교한다.
    User.findOne({
      where: { id }, //아이디 값을 비교하여 해당하는 유저정보를 조회한다.
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers', //팔로워 목록을 함께 조회한다.
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings', //팔로잉 목록을 함께 조회한다.
      }],
    })
      .then(user => done(null, user)) //검색한 유저정보를 전달한다.
      .catch(err => done(err)); //에러 발생시 에러값을 전달한다.
  });

  local();
  kakao();
};
