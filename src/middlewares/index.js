let MonthConfig = require("../models/month-config");
let Subgroup = require("../models/subgroup");
let Entry = require("../models/entry");


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
        if(req.isAuthenticated()){
            if(res.locals.active === "subgroup"){
                Subgroup.findById(req.params.subgroup_id, function(err, subgroup){
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }else{
                        // dos user own the campground
                        if(subgroup.owner.id.equals(req.user._id)){
                            next();
                        } else{
                            req.flash("error","Acesso negado!");
                            res.redirect("back");
                        }
                    }
                });
            } else if(res.locals.active === "month-config"){
                MonthConfig.findById(req.params.month_id, function(err, monthConfig){
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }else{
                        // dos user own the campground
                        if(monthConfig.owner.id.equals(req.user._id)){
                            next();
                        } else{
                            req.flash("error","Acesso negado!");
                            res.redirect("back");
                        }
                    }
                });
            } else if(res.locals.active === "entry"){
                Entry.findById(req.params.entry_id, function(err, entry){
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }else{
                        // dos user own the campground
                        if(entry.owner.id.equals(req.user._id)){
                            next();
                        } else{
                            req.flash("error","Acesso negado!");
                            res.redirect("back");
                        }
                    }
                });
            }
        }else{
            req.flash("error","Você precisa estar logado!");
            res.redirect("back");
        }
    }

}