const express = require('express');

const { isLoggedIn } = require('./middlewares');  // 미들웨이를 가져온다.
const User = require('../models/user'); //  모델에서 user 모델 클래스만 가져온다. 

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {  // 동적인 부분 즉 >> " / (여기에 id) / follow "인 형식인 요청이 들어왔을 때
  try {
    const user = await User.findOne({ where: { id: req.user.id } });  // 데이터베이스에서 id 칼럼이 req.user.id과 동일한 것을 찾아라 >> 그리고 그 것들을 user에 넣어라
    if (user) { // 만약 1명이라도 받아온게 있다면 
      await user.addFollowing(parseInt(req.params.id, 10)); // addFollowing 메서드는 어디서 가져온 것인지 매우 궁금  >>  괄호안의 있는 것들을 int 값을로 변환하는데 (내용, 진수형식)
      res.send('success'); // 메시지를 보낸다. 
    } else {
      res.status(404).send('no user');  // 위에서 만약 한명이라도 못찾았다면 유저가 없는 거다.
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
