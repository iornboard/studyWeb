const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post'); 
const userRouter = require('./routes/user'); //

const { sequelize } = require('./models');     //?
const passportConfig = require('./passport');  //?

dotenv.config();  // env 파일을 환경변수로 설정 
passportConfig();  // ?? 

const app = express();

app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');  // 뷰엔진을 html로 설정 -> html을 프론트로 사용할 것이라는 뜻
nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false })  // force가 ture라면 데이터베이스를 삭세하고 쓸지
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan('dev'));  // 로그 표현 방식중에 dev를 사용한다.
app.use(express.static(path.join(__dirname, 'public')));  // ()안의 폴더 내용의 이름을 합친다. (__dirname == 폴더 위치) 
app.use('/img', express.static(path.join(__dirname, 'uploads')));  // 기본적으로는 public 폴더를 사용하겠지만 /img 요청이 들어온다면 uploads 폴더를 사용할 것임
app.use(express.json()); // 응답시 json이라면 받는다.  
app.use(express.urlencoded({ extended: false }));  // 쿼리스트링 해석문  >> 
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use(passport.initialize());  // 패스포트를 초기화 해주는 미들웨어
app.use(passport.session());  //  ?? 

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);  // 에러메시지를 콘솔로 출력합니다. 
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
