const sso_services = require('./Authentication/auth');

global['jwtsecret'] = "therearesomethinghere"

global['getToken'] = sso_services.getToken;
global['validateToken'] = sso_services.validateToken;
global['refreshToken'] = sso_services.refreshToken;

