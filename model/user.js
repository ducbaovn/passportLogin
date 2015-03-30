var findProfileByID = function (queryPromise, id) {
	var selectQuery = 'SELECT user_id, username, password, create_date, user.fb_id, fb_token, fb_email, fb_name, user.gg_id, gg_token, gg_email, gg_name FROM user LEFT JOIN user_fb ON user.fb_id=user_fb.fb_id LEFT JOIN user_gg ON user.gg_id=user_gg.gg_id WHERE user_id='+id;
	return queryPromise(selectQuery);
}
var findUserByID = function (queryPromise, id) {
	var selectQuery = 'SELECT * FROM user WHERE user_id=' + id;
	return queryPromise(selectQuery);
}
var findUserByUsername = function (queryPromise, username) {
	var selectQuery = 'SELECT * FROM user WHERE username = "' + username + '"';
	return queryPromise(selectQuery);
}
var findUserByFB_ID = function (queryPromise, id) {
	var selectQuery = 'SELECT * FROM user WHERE fb_id="' + id + '"';
	return queryPromise(selectQuery);
}
var findUserByGG_ID = function (queryPromise, id) {
	var selectQuery = 'SELECT * FROM user WHERE gg_id="' + id + '"';
	return queryPromise(selectQuery);
}
var insertUser = function (queryPromise, user) {
	var insertQuery = 'INSERT INTO user (username, password, fb_id, gg_id) VALUES ("'+user.username+'", "'+user.password+'", "'+ user.fb_id +'", "'+ user.gg_id +'")';
	return queryPromise(insertQuery);
}
var insertUserFB = function (queryPromise, profileFB) {
	var insertQuery = 'INSERT INTO user_fb VALUES ("'+profileFB.id+'", "'+ profileFB.token+'", "'+ profileFB.emails[0].value + '", "'+ profileFB.displayName +'")';
	return queryPromise(insertQuery);
}
var insertUserGG = function (queryPromise, profileGG) {
	var insertQuery = 'INSERT INTO user_gg VALUES ("'+profileGG.id+'", "'+ profileGG.token+'", "'+ profileGG.emails[0].value + '", "'+ profileGG.displayName +'")';
	return queryPromise(insertQuery);
}
var updateUser = function (queryPromise, user_id, user) {
	var updateQuery = 'UPDATE user SET username = "'+ user.username +'", password = "'+ user.password +'", fb_id = "'+ user.fb_id +'", gg_id = "'+ user.gg_id +'" WHERE user_id = '+ user_id;
	return queryPromise(updateQuery);
}
var updateUserFB = function (queryPromise, user_id, profileFB) {
	var updateUserQuery = 'UPDATE user SET fb_id = "'+ profileFB.id +'" WHERE user_id = '+ user_id;
	var updateFBQuery = 'INSERT INTO user_fb VALUES ("'+profileFB.id+'", "'+ profileFB.token +'", "'+ profileFB.emails[0].value +'", "'+ profileFB.displayName+'") ON DUPLICATE KEY UPDATE fb_token = "'+ profileFB.token +'", fb_email = "'+ profileFB.emails[0].value +'", fb_name = "'+profileFB.displayName+'"';
	queryPromise(updateFBQuery);
	return queryPromise(updateUserQuery);
}
var updateUserGG = function (queryPromise, user_id, profileGG) {
	var updateUserQuery = 'UPDATE user SET gg_id = "'+ profileGG.id +'" WHERE user_id = '+ user_id;
	var updateGGQuery = 'INSERT INTO user_gg VALUES ("'+profileGG.id+'", "'+ profileGG.token +'", "'+ profileGG.emails[0].value +'", "'+ profileGG.displayName+'") ON DUPLICATE KEY UPDATE gg_token = "'+ profileGG.token +'", gg_email = "'+ profileGG.emails[0].value +'", gg_name = "'+profileGG.displayName+'"';
	queryPromise(updateGGQuery);
	return queryPromise(updateUserQuery);
}
var deleteUser = function (queryPromise, user_id) {
	var deleteQuery = 'DELETE FROM user WHERE user_id = '+user_id;
	return queryPromise(deleteQuery);
}

exports.findProfileByID = findProfileByID;
exports.findUserByID = findUserByID;
exports.findUserByUsername = findUserByUsername;
exports.findUserByFB_ID = findUserByFB_ID;
exports.findUserByGG_ID = findUserByGG_ID;
exports.insertUser = insertUser;
exports.insertUserFB = insertUserFB;
exports.insertUserGG = insertUserGG;
exports.updateUser = updateUser;
exports.updateUserFB = updateUserFB;
exports.updateUserGG = updateUserGG;
exports.deleteUser = deleteUser;