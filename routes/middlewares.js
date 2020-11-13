// 로그인이 되어있다면 다음 미들웨어를 실행하는거죠

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {   // .isAuthenticated() >> 인증한 사용자 여부를 나타낸다.
    next();     // 다음 미들웨어를 실행합니다. 
  } else {
    res.status(403).send('로그인 필요');   // 응답상태를 (403로 바꾸고)- 메시지를 보낸다. 
  }
};

// 로그인하지 않은 상태라면 다음 미들웨어를 실행하는 거죠

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');  // 문자열을 인코딩
    res.redirect(`/?error=${message}`);  // 리타이렉트 + 메세지(위에꺼)
  }
};
