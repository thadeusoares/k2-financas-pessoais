var express = require("express"),
	router  = express.Router(),
	passport = require("passport"),
	middleware = require("../middlewares"),
	User = require("../models/user");


//root
router.get("/", middleware.isLoggedIn, function(req, res){
	res.redirect("/dashboard");
});


//show register form
router.get("/register", function(req, res){
	res.render("registries");
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
    	username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/dashboard"); 
        });
    });
});

router.get("/changePassword", middleware.isLoggedIn, function(req, res){
  User.findById(req.user._id, function(err, user){
    res.render("registries/edit", {user: user});
  });
});

router.put("/changePassword", middleware.isLoggedIn, function(req, res){
  console.log("Nova senha: "+req.body.password);
  User.findById(req.user._id, function(err, user){
    if(err){
        console.log(err);
        req.flash("error", err.message);
        return res.render("registries/edit", {user: user});
    }
    user.changePassword(req.body.oldPassword, req.body.newPassword, function(err, pwd){
      if(err){
        req.flash("error", err.message);
      }else{
        user.save();
        req.flash("success", "Senha alterada com sucesso!");
      } 
      res.redirect("/dashboard"); 
    });
  });
});

//show login form
router.get("/login", function(req, res){
   res.render("index", {ignoreViewRouting: true}); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: "É necessário informar um usuário e/ou senha correto(s)" 
    }), function(req, res){}
);

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Você saiu do sistema!");
   res.redirect("/login");
});

module.exports = router