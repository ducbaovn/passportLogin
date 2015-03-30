var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var fbStrategy = require('passport-facebook').Strategy;
var ggStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./configAuth');

var user = require('./model/user');
var bcrypt = require('bcrypt-nodejs'); 

var mysql = require('mysql');
var pool = mysql.createPool(require('./configDB').localOpt);
var Q = require('q');
var queryPromise = Q.nbind(pool.query, pool);

module.exports = function(passport) {
	passport.serializeUser(function (user, done){
		done(null, user.user_id);
	});
	passport.deserializeUser(function (id, done){
		user.findProfileByID(queryPromise, id)
		.then(function(rows){
			if (rows[0].length){
				return done(null, rows[0][0]);
			}
			return done(null, false);
		});
	});

	passport.use('local-signup', new localStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function (req, username, password, done) {
		user.findUserByUsername(queryPromise, username)
		.then(function (rows){
			if (rows[0].length) {
				return done(null, false, req.flash('signupMsg', 'That username is already taken'));
			}
			if (req.body.repassword !== password) {
				return done(null, false, req.flash('signupMsg', 'Password and RePassword do not match'));
			}
			var newUser = {
				username: username,
				password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
				fb_id: "",
				gg_id: ""
			}
			user.insertUser(queryPromise, newUser)
			.then(function (rows) {
				newUser.user_id = rows[0].insertId;
				return done(null, newUser);
			}, function (err) {
				console.log(err);
				return done(err);
			});
		});
	}));

	passport.use('connect-newUser', new localStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function (req, username, password, done) {
		user.findUserByUsername(queryPromise, username)
		.then(function (rows){
			if (rows[0].length) {
				return done(null, false, req.flash('signupMsg', 'That username is already taken'));
			}
			if (req.body.repassword !== password) {
				return done(null, false, req.flash('signupMsg', 'Password and Re-Password do not match'));
			}
			req.user.username = username;
			req.user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
			user.updateUser(queryPromise, req.user.user_id, req.user)
			.then (function (success) {
				return done(null, req.user);
			});
		});
	}));

	passport.use('local-login', new localStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function (req, username, password, done) {
		user.findUserByUsername(queryPromise, username)
		.then(function (rows){
			if (rows[0].length == 0) {
				return done(null, false, req.flash('loginMsg', 'No username found'));
			}
			if (!bcrypt.compareSync(password, rows[0][0].password)) {
				return done(null, false, req.flash('loginMsg', 'Incorrect Password'));
			}
			return done(null, rows[0][0]);
		});
	}));

	passport.use('connect-existUser', new localStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function (req, username, password, done) {
		user.findUserByUsername(queryPromise, username)
		.then(function (rows){
			if (rows[0].length == 0) {
				return done(null, false, req.flash('loginMsg', 'No username found'));
			}
			if (!bcrypt.compareSync(password, rows[0][0].password)) {
				return done(null, false, req.flash('loginMsg', 'Incorrect Password'));
			}
			if (req.user.fb_id) rows[0][0].fb_id = req.user.fb_id;
			if (req.user.gg_id) rows[0][0].gg_id = req.user.gg_id;
			user.deleteUser(queryPromise, req.user.user_id);
			user.updateUser(queryPromise, rows[0][0].user_id, rows[0][0])
			.then(function (success){
				return done(null, rows[0][0]);
			});
		});
	}));

	passport.use(new fbStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
		profile.token = token;
		if (!req.user) {
			user.findUserByFB_ID(queryPromise, profile.id)
			.then(function (rows){
				if (rows[0].length == 0) {
					var newUser = {
						username: "",
						password: "",
						fb_id: profile.id,
						gg_id: ""
					};
					user.insertUserFB(queryPromise, profile);
					user.insertUser(queryPromise, newUser)
					.then(function (rows){
						newUser.user_id = rows[0].insertId;
						return done(null, newUser);
					});
				}
				else {
					return done(null, rows[0][0]);
				}
			}, function (err){
				return done(err);
			});
		}
		else {
			req.user.fb_id = profile.id;
			user.updateUserFB(queryPromise, req.user.user_id, profile)
			.then(function (rows){
				done(null, req.user);
			});
		}        
	}));

	passport.use(new ggStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
		profile.token = token;
		if (!req.user) {
			user.findUserByGG_ID(queryPromise, profile.id)
			.then(function (rows){
				if (rows[0].length == 0) {
					var newUser = {
						username: "",
						password: "",
						fb_id: "",
						gg_id: profile.id
					};
					user.insertUserGG(queryPromise, profile);
					user.insertUser(queryPromise, newUser)
					.then(function (rows){
						newUser.user_id = rows[0].insertId;
						return done(null, newUser);
					});
				}
				else {
					return done(null, rows[0][0]);
				}
			}, function (err){
				return done(err);
			});
		}
		else {
			req.user.gg_id = profile.id;
			user.updateUserGG(queryPromise, req.user.user_id, profile)
			.then(function (rows){
				done(null, req.user);
			});
		}        
	}));
}