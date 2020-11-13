const express = require('express');  
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');  
const { Post, User, Hashtag } = require('../models');  // 모델에 있는 밖에 있는 models 파일을 ../ 로 접근합니다.

const router = express.Router();





// 이게 뭐지?
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : []; // 아마도 팔로워 리스트를 계속 받아오고 매팽해준다. 
  next();
});





router.get('/profile', isLoggedIn, (req, res) => {      // 로그인이 되어있다면 다음 미들웨어를 실행하는거죠
  res.render('profile', { title: '내 정보 - NodeBird' });
});


router.get('/join', isNotLoggedIn, (req, res) => {      // 로그인하지 않은 상태라면 다음 미들웨어를 실행하는 거죠
  res.render('join', { title: '회원가입 - NodeBird' });
});



router.get('/', async (req, res, next) => {   // async await 사용
  try { 
    const posts = await Post.findAll({    // 데이터 베이스에 있는 post를 검색한다.
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
