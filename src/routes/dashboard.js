/*
*	Page: /dashboard/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares");

router.get('/', middleware.isLoggedIn,function(req, res) {
	res.render("index_dashboard");
})

module.exports = router