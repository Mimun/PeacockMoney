const users = [
    {
        username: 'chipl',
        password: '123456',
        role: 'admin'
    }, {
        username: 'meomeo',
        password: '123456',
        role: 'member'
    }
];

const refreshTokens = [];

function getToken(req, res, next) {
    console.log('getToken')
    // Read username and password from request body
    const { username, password } = req.body;

    // Filter user from the users array by username and password
    const user = users.find(u => { return u.username === username && u.password === password });

    if (user) {
        // Generate an access token
        const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret);

        res.json({
            accessToken
        });
    } else {
        res.send('Username or password incorrect');
    }
    next()
}

function validateToken(req, res, next) {
    console.log('ValidateToken')
    const token = req.body.token
    if (!token) {
        res.render('login', { title: 'Invalidate' });
        return;
    }
    next()
}


function refreshToken(req, res, next) {
    console.log('refresh Token')
    const token = req.body.token
    if (!token) {
        res.render('index', { title: 'Invalidate' });
        return;
    }
    next()
}

function logOut(req, res, next){

}

module.exports = {
    getToken: getToken,
    validateToken: validateToken,
    refreshToken: refreshToken
}
