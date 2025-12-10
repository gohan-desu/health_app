require('dotenv').config();
const express = require('express');
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const path = require('path');

//ルートハンドラ読み込み
const dbpool = require('./config/db');
const usersApi = require('./routes/api/users');
const tasksApi = require('./routes/api/tasks');

const app = express(); 
console.log("🔍 Using Database:", process.env.DB_NAME);

//ミドルウェア設定
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
];

app.use(cors({
    origin: function (origin, callback) {
      if(!origin || allowedOrigins.includes(origin)){
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
}));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

// MySQLセッションストア設定（dbpool を渡すのが重要）
const sessionStore = new MySQLStore({
    expiration: 24 * 60 * 60 * 1000, // 1日
    createDatabaseTable: true,       // sessions table を自動生成
}, dbpool);

//デバッグ用
sessionStore.on('error', function(error) {
  console.error('❌ Session Store Error:', error);
});

sessionStore.on('ready', function() {
  console.log('✅ Session Store Ready: MySQL connected');
});


//セッション管理設定
app.use(session({
    key: 'healthapp_session',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

//静的ファイルの提供設定
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

//APIルート
app.use('/api/users', usersApi);
app.use('/api/tasks', tasksApi); //tasks.js内に認証チェックを適用済み

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'login', 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'login','login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'register', 'register.html')));
app.get('/record', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'record', 'index.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'home', 'index.html')));

//サーバーをポート3000で起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});