var passport = require('passport');
require('../configPassport')(passport);

framework.middleware('passport', passport.initialize());
framework.middleware('sessionPP', passport.session());