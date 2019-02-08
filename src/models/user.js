var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	/* email: String, */
    username: String,
    password: String,
    isActive: {
    	type: Boolean,
    	default: true
    }
});

UserSchema.plugin(passportLocalMongoose)

/*UserSchema.methods.setPassword = function(password, cb){
	if(!password){
		return cb(new BadRequestError(options.missingPasswordError));
	}

	var self = this;

	crypto.pbkdf2(password, salt, options.iterations, options.keylen, function(err, hashRaw){
		if(err){
			return cb(err);
		}

		self.set(options.hashField, new Buffer(hashRaw, 'binary').toString('hex'));
		self.set(options.saltField, salt);

		cb(null. self);
	});

};*/

module.exports = mongoose.model("User", UserSchema);