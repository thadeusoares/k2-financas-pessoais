module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        if (req._parsedOriginalUrl.path !== "/"){
        	req.flash("error", "Você precisa estar logado!");
    	}
        res.redirect("/login");
    },

    checkOwnership: function(req, res, next){
    	
    }

}