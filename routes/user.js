const express = require('express');

const { isLoggedIn } = require('./middlewares');  // 미들웨이를 가져온다.
const User = require('../models/user'); //  모델에서 user 모델 클래스만 가져온다. 

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {  // 동적인 부분 즉 >> / (여기에 id) / follow 인 형식인 요청이 들어왔을 때
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
