var passport = require('passport');

exports.install = function() {
    F.route('/', view_index);
    F.route('/signup', view_signup, ['#session', '#flash']);
    F.route('/signup',  post_signup, { flag: ['post', '#session', '#flash', '#passport'], timeout: false });
    F.route('/login', view_login, ['#session', '#flash']);
    F.route('/login', post_login, {flag:['post', '#session', '#flash', '#passport'], timeout: false});
    F.route('/profile', view_profile, ['#session', '#passport', '#sessionPP']);
    
    F.route('/auth/facebook', auth_fb, ['#session', '#passport', '#sessionPP']);
    F.route('/auth/facebook/callback', auth_fb_cb, {flag: ['#session', '#passport', '#sessionPP'], timeout: false});
    F.route('/auth/google', auth_gg, ['#session', '#passport', '#sessionPP']);
    F.route('/auth/google/callback', auth_gg_cb, {flag: ['#session', '#passport', '#sessionPP'], timeout: false});   
    
    F.route('/connect/localNew', view_connectLocalNew, ['#session', '#flash', '#passport', '#sessionPP']);
    F.route('/connect/localNew', post_connectLocalNew, {flag:['post', '#session', '#flash', '#passport', '#sessionPP'], timeout: false});
    F.route('/connect/localExist', view_connectLocalExist, ['#session', '#flash', '@passport', '#sessionPP']);
    F.route('/connect/localExist', post_connectLocalExist, {flag:['post', '#session', '#flash', '#passport', '#sessionPP'], timeout: false});
    F.route('/connect/facebook', connect_fb, ['#session', '#passport', '#sessionPP']);
    F.route('/connect/google', connect_gg, ['#session', '#passport', '#sessionPP']);
    
    F.route('/logout', logout, ['#session', '#passport', '#sessionPP']);
};

function view_index() {
    var self = this;
    self.plain('Home Page');
}

function view_signup() {
    var self = this;
    self.view('signup', {message: self.req.flash('signupMsg')});
}

function post_signup() {
    var self = this;
    passport.authenticate('local-signup', { failWithError: true, failureFlash: true})(self.req, self.res, function (err){
        if (err) {
            console.log(err);
            self.redirect('/signup');
        }
        else {
            self.redirect('/profile');
        }
    })
}

function view_login() {
    var self = this;
    self.view('login', {message: self.req.flash('loginMsg')});
}

function post_login() {
    var self = this;
    passport.authenticate('local-login', { failWithError: true, failureFlash: true})(self.req, self.res, function (err){
        if (err) {
            console.log(err);
            self.redirect('/login');
        }
        else {
            self.redirect('/profile');
        }
    });
}

function auth_fb() {
    var self = this;
    self.custom();
    passport.authenticate('facebook', {scope: 'email'})(self.req, self.res);
}

function auth_fb_cb() {
    var self = this;
    passport.authenticate('facebook', { failWithError: true })(self.req, self.res, function (err){
        if (err) {
            console.log(err);
            self.redirect('/login');
        }
        else {
            self.redirect('/profile');
        }
    })
}

function auth_gg() {
    var self = this;
    self.custom();
    passport.authenticate('google', {scope: ['profile', 'email']})(self.req, self.res);
}

function auth_gg_cb() {
    var self = this;
    passport.authenticate('google', { failWithError: true })(self.req, self.res, function (err){
        if (err) {
            console.log(err);
            self.redirect('/login');
        }
        else {
            self.redirect('/profile');
        }
    })
}


function view_connectLocalNew() {
    var self = this;
    self.view('connect_localNew', {message: self.req.flash('signupMsg')});
}

function post_connectLocalNew() {
    var self = this;
    passport.authenticate('connect-newUser', { failWithError: true, failureFlash: true})(self.req, self.res, function (err){
        if (err) {
            console.log(err);
            self.redirect('/connect/localNew');
        }
        else {
            self.redirect('/profile');
        }
    })
}

function view_connectLocalExist() {
    var self = this;
    self.view('connect_localExist', {message: self.req.flash('loginMsg')});
}

function post_connectLocalExist() {
    var self = this;
    passport.authenticate('connect-existUser', { failWithError: true, failureFlash: true})(self.req, self.res, function (err){
        if (err) {
            console.log(err);
            self.redirect('/connect/localExist');
        }
        else {
            self.redirect('/profile');
        }
    })
}

function connect_fb() {
    var self = this;
    self.custom();
    passport.authorize('facebook', {scope: 'email'})(self.req, self.res);
}

function connect_gg() {
    var self = this;
    self.custom();
    passport.authorize('google', {scope: ['profile', 'email']})(self.req, self.res);
}

function view_profile() {
    var self = this;
    if (self.req.isAuthenticated()){
        self.view('/profile', self.user);
    }
    else {
        self.redirect('/login');
    }
}

function logout(){
    var self = this;
    self.req.logout();
    self.redirect('/login');
}
