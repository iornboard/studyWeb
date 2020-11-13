// 여기는 뭐하는데???

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // 파일 시스템, multer 까지 씀

const { Post, Hashtag } = require('../models');  // 모델 중에서 post 와 Hashtag 클래스를 가져온다. 
const { isLoggedIn } = require('./middlewares');  // isLoggedIn 미들웨어 가져오기 

const router = express.Router();

try {
  fs.readdirSync('uploads');  // 디렉토리 즉 폴더를 읽어온다는데 , 읽어와서 어떻게 한다는 건지는 모르겠음
} catch (error) { // 디렉토리를 못 찾았을 경우
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');  // 아마 디렉토리를 새로 만드는 데인듯
}

//이미지 업로드 하는 일종의 함수?? 
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {  
      cb(null, 'uploads/'); 
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);   // 파일의 원래 이름을 받아온다. 
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);  // 파일을 내려받을 때 아마, 파일 이미지명을 저렇게 설정 한다는 뜻인 듯( 시간 + 처음 파일 내용 ??? ) 
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 올릴 수 있는 파일 사이즈? 
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {  // '/img' 요청이 온다면, 로그인 중인지를 미들웨어를 통해 확인하고, img 를 업로드 한다. 
  console.log(req.file);  // 콘솔로 표시하는 이유가?? 
  res.json({ url: `/img/${req.file.filename}` });  // 응답을 json 파일로 하는 듯, 
});


// 여기 미들웨이는 다음과 같다. (채팅 글쓰기 부분)(글쓰기 + 사진 업로드 + 해시태그 처리)
const __upload = multer();   // 변수앞에 __ 는 왜 쓰는 건지 모르겠는데... (하위라는 뜻 인거 같아)
router.post('/', isLoggedIn, __upload.none(), async (req, res, next) => {    // 미들웨이가 2개 연속으로 실행되는건가? (정확히는 __upload.none()이 무엇인지?)
  try {
    console.log(req.user); 
    const post = await Post.create({   // create는 생성하는 것, {}안의 것들을 키와 값으로 해서 데이터 베이스 post 모델에 생성한다. 
      content: req.body.content,  // 포스트의 content 칼럼에 우리가 입력한 글 내용을
      img: req.body.url, // 포스트의 img 칼럼에 img 위치정보를(url)
      UserId: req.user.id, // 포스트의 UserId 칼럼에 쓴 사람 정보를
    });

    // 여기부터는 만약 해시태그사 있는 경우의 이야기이다. 

    const hashtags = req.body.content.match(/#[^\s#]*/g);   // hashtags에는 클라이언트에서 보내온 해시태그를 정규표현식으로 읽어서 담는다. 
    if (hashtags) { // 만약 있으면 (받아오는데 성공하면 )
      const result = await Promise.all(  // promise all을 왜 썼는지는 정확히 모르겠으나 아마, console.log() 와 return 문을 동시에 하려고 하는거 같음 (아마 console 문이 빠르게 실행되서 내용이 표시 안될까봐) (프로미스 내부에서 또 프로미스를 쓰는 건가?)
        hashtags.map(tag => {
          console.log("TAG: " + tag)
          return Hashtag.findOrCreate({  // findOrCreate인데 이거는 값을 가져올때 없으면 생성// 있으면 그거 그대로 사용함
            where: { title: tag.slice(1).toLowerCase() },  // 해스태그 테이블에 있는 title 값을 보고 #을 제외한 부분과 찾은거랑 일치한거를 확인하고, 찾은거를 변수 result에 + 없으면 만들고
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0])); // addHashtag 가 어디서 나온 메서드 인지는 모르겠음  
    }
    res.redirect('/'); // 다썻으면 메인페이지로 (사실상 새로고침)
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
