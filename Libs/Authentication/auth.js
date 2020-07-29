
function getToken(req, res, next){
    console.log('getToken')

    next()
}

function validateToken(req, res, next){
    console.log('ValidateToken')
    next()
}


function refreshToken(req, res, next){
    console.log('refresh Token')

    next()
}

module.exports = {
    getToken:getToken,
    validateToken:validateToken,
    refreshToken: refreshToken
}
