// 여기는 뭐하는??



const express = require('express');  
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');   // middlewares 모듈 안에 들어있는 모듈만 가져와서 쓴다. {구조분해 할당으로 가져오는 중이다.}
const { Post, User, Hashtag } = require('../models');  // 모델에 있는 밖에 있는 models 파일을 ../ 로 접근합니다.

const router = express.Router(); // ??





// 이게 뭐지?
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : []; // 아마도 팔로워 리스트를 계속 받아오고 매팽해준다. 
  next();
});




//프로파일을 보여주는 미들웨어 (프로파일 페이지 - 로그인 시에만)
router.get('/profile', isLoggedIn, (req, res) => {      
  res.render('profile', { title: '내 정보 - NodeBird' });
});


//회원가입을 보여주는 미들웨어 (회원가입 페이지 - 로그인 상태가 아닐 때에만) 
router.get('/join', isNotLoggedIn, (req, res) => {     
  res.render('join', { title: '회원가입 - NodeBird' });
});


// 메인페이지를 보여주는 미들웨어 (메인 페이지)

router.get('/', async (req, res, next) => {   // async await 사용
  try { 
    const posts = await Post.findAll({    // 데이터 베이스에 있는 post중에서 ID와 nick 이 같은거를 받아온다. 
      include: {                          // 내부 값의 따라서 받아오는 것 같은데 정확히 뭘 받아오는 건지는 모르겠다. 확실한건 스키마중에 Post 모델에서 가려 받는거 정도
        model: User,  
        attributes: ['id', 'nick'],  //   attributes 는 []의 원하는 컬럼만 가져오는 것 
      },
      order: [['createdAt', 'DESC']], // order 는 정렬하는 방식이다. createdAt를 가져오는데 내림차순으로 가져온다는 것 같다. 
    });
    res.render('main', {  // main.html 을 보여준다. (이때 title은 'NodeBird'로, 그리고 위의 쿼리문에서 찾은 posts(채팅친것들)객체를 넘겨준다.) (넘겨주면 main.html 에서 보여질것)
      title: 'NodeBird', 
      twits: posts, // 실제로 봐야 알겠지만 console.log()를 하게되면 아마 스키마 테이블 중에 일부분 (id , nick , createdAt 만 가져오는 것 같다. 그리고 그걸 아마 html 로 넘겨주는 것)
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});




// 해시태그를 찾아주는 미들웨어 (아마 우리가 버튼 누르면 작동되는 미들웨어인듯)
router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;   // 응답객체에 있는 쿼리를 가져오는데 그 말은 우리가 해시태그 창에 넣은 문자열을 가져온다는 뜻인 듯 
  if (!query) { // 만약 없으면 즉 우리가 아무것도 안적으면
    return res.redirect('/'); // 메인페이지로
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });  // hashtag는 데이터 베이스에서 뽑아온, 스키마 안의 해시태그의 title 이 query 인것들 (5줄 위에서 받은거 [query = req.query.hashtag;] ) 과 비교한다. (title =  query)
    let posts = []; 
    if (hashtag) {  // 만약 #" "에 들어간 내용이 실제로 데이터 베이스에 있다면
      posts = await hashtag.getPosts({ include: [{ model: User }] });  // 배열에 스키마안에 있는 user 모델을 join 한다는데 뭔지 모르겠다.  getPosts 도 뭔지 알아봐야 함
    }

    return res.render('main', {  // main 페이지를 렌더 즉 표시한다. 
      title: `${query} | NodeBird`,  // titel은 워에서 얻은 query로 넘겨주는데, 왜 저런 형식으로 주는지는 의문
      twits: posts, // 아마 위에서의 post와 동일한 것 같다.
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
