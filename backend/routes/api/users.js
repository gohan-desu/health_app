const express = require('express');
const router = express.Router();
const User = require('../../models/user');

//ユーザー登録
router.post('/signup', async (req, res) =>{
    const{username, password} = req.body;
    if(!username || !password) return res.status(400).json({error: 'Missing fields'});

    try {
        const existing = await User.findUserByUsername(username);
        if (existing) return res.status(400).json({ error: 'Username already exists' });

        const user = await User.createUser(username, password);
        req.session.userId = user.id;
        res.status(201).json({ message: 'User created', user: { id: user.id, username: user.username } });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
    }
});

//ログイン
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.verifyPassword(username, password);
        if(!user) return res.status(401).json({ error: 'Invalid credentials' });

        req.session.userId = user.id;
        res.json({ message: 'Login successful', user: { id: user.id, username: user.username }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

//ログアウト
router.post('/logout', (req, res) => {
    req.session.destroy(err =>{
        if(err){
            return res.status(500).json({error: 'Logout failed'});
        }
        res.status(200).json({message: 'Logout successful'});
    });
});

module.exports = router;