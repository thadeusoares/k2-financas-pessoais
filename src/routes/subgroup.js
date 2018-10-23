/*
*	Page: /subgroup/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	Subgroup 	= require("../models/subgroup")


    
//LIST
router.get('/', middleware.isLoggedIn,function(req, res) {
	Subgroup.find({"owner.username": req.user.username, isActive: true})
        .populate({path:'subgroupsInside', options: { sort: { 'description': 'asc' } }})
        .sort({description: 'asc'})
        .exec(function(err, subgroupsList){
		
            //subgroupsList.subgroupsInside = _.sortBy(subgroupsList.comments, 'description');

            var subgroupsFixa = subgroupsList.filter((subgroup) => 
                subgroup.group==='fixa' && (typeof subgroup.subgroupOf === 'undefined')
            );
    		var subgroupsVariaveis = subgroupsList.filter((subgroup) => 
                    subgroup.group==='variavel' && (typeof subgroup.subgroupOf === 'undefined')
            );

            res.render("subgroups/index",{
                    subgroupsFixa:subgroupsFixa, 
                    subgroupsVariaveis:subgroupsVariaveis 
            });
	});
})

//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
    req.body.subgroup.description = req.sanitize(req.body.subgroup.description);
    req.body.subgroup.owner = {
        id: req.user._id,
        username: req.user.username
    }

    if(typeof req.body.subgroup.subgroupOf === 'undefined'){
        Subgroup.create(req.body.subgroup, function(err, subgroupSaved){
            if(err){
                req.flash("error", err.message);
                console.log(err);
            }else{
                req.flash("success", "Registro incluído com sucesso");
                console.log("added a subgroup");
            }
            res.redirect("/subgroup");
        });
    }else{
        Subgroup.findOne({_id:  req.body.subgroup.subgroupOf}, function(err, foundSubgroup){
            console.log("======>"+foundSubgroup);
            //subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(req.body.subgroup, function(err, subgrupoSalvo){
                if(err){
                    req.flash("error", err.message);
                }else{
                    foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                    foundSubgroup.save();
                    req.flash("success", "Registro incluído com sucesso");
                    console.log("Created new subgroup inside subgroup");
                }
                res.redirect("/subgroup");
            });
        });
    }
});

//SHOW ALL GROUPS JSON
router.get('/groups/json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    //{group: "fixa", subgroup.subgroupOf === 'undefined'}
    Subgroup.find({isActive: true, subgroupOf: null})
    .populate({path:'subgroupsInside', options: { sort: { 'description': 'asc' } }})
        .sort({description: 'asc'})
        .exec(function(err, groupsList){
            var formattedGroups = [];
            groupsList.forEach(function(groupItem){
                var descGrupo = groupItem.group==='fixa'?'Despesas Fixas':'Despesas Variáveis';
                var subtipo = groupItem.description;
                //var id = groupItem._id;

                if(groupItem.subgroupsInside.length === 0){
                    formattedGroups.push({
                        id: groupItem._id,
                        subtipo: subtipo,
                        description: groupItem.description,
                        descGrupo: descGrupo,
                        group: groupItem.group
                    });
                }else{
                    groupItem.subgroupsInside.forEach(function(subItem){
                        formattedGroups.push({
                            id: subItem._id,
                            subtipo: subtipo,
                            description: subItem.description,
                            descGrupo: descGrupo,
                            group: groupItem.group
                        });
                        //console.log("description--->"+subItem.description);
                    });
                }
            });
            res.send(JSON.stringify(formattedGroups));
    });
})

//SHOW GROUPS JSON
router.get('/groups/:group/json', middleware.isLoggedIn,function(req, res) {
    var group = req.sanitize(req.params.group);
    res.setHeader('Content-Type', 'application/json');
    //{group: "fixa", subgroup.subgroupOf === 'undefined'}
    Subgroup.find({group: group, subgroupOf: null, isActive: true}, function(err, groupsList){
            res.send(JSON.stringify(groupsList));
    });
})

//SHOW SUBGROUP JSON
router.get('/:id/json', middleware.isLoggedIn,function(req, res) {
    var group = req.sanitize(req.params.id);
    res.setHeader('Content-Type', 'application/json');
    Subgroup.findById(req.params.id, function(err, groupsList){
            res.send(JSON.stringify(groupsList));
    });
})

// UPDATE ROUTE
router.put("/:id", function(req, res){
    
    req.body.subgroup.description = req.sanitize(req.body.subgroup.description);

    Subgroup.findOneAndUpdate({_id: req.params.id},  {$set: req.body.subgroup},function(err, updatedSubgroup){
        if(err){
            req.flash("error", err.message);
            console.log(err);
        }
        console.log(updatedSubgroup);

        if(typeof req.body.subgroup.subgroupOf !== 'undefined'){
            //Identifica pai anterior
            //db.subgroups.find({"subgroupsInside":ObjectId("5bafb0d277c62c0592fb2127")})
            Subgroup.findOne({"subgroupsInside": req.params.id}, function(err, foundOldSubgroupOf){
                if(err){
                    console.log("####################");
                    console.log(err);
                    console.log("####################");
                    
                }

                //Remove o registro
                console.log(foundOldSubgroupOf);
                foundOldSubgroupOf.subgroupsInside.pull({_id:req.params.id});
                foundOldSubgroupOf.save(function(err, oldSubGroup){
                    console.log("SubgroupOf removido");
                    //Inclui em novo pai
                    Subgroup.findOne({_id:  req.body.subgroup.subgroupOf}, function(err, foundSubgroup){
                        console.log("======>"+foundSubgroup);
                        //subgrupo.subgroupOf = foundSubgroup._id;
                        foundSubgroup.subgroupsInside.push(updatedSubgroup)
                        foundSubgroup.save();
                        req.flash("success", "Registro atualizado com sucesso");
                        console.log("SubgroupOf novo incluido");
                        res.redirect("/subgroup");
                    });
                });
            });
        }else{
            req.flash("success", "Registro atualizado com sucesso");
            console.log("Registro atualizado");
            res.redirect("/subgroup");
        }
        
    });
});

// UPDATE ROUTE
router.put("/disable/:id", middleware.isLoggedIn, function(req, res){
    Subgroup.findOneAndUpdate({_id: req.params.id},  {$set: {isActive: false }},function(err, updateSubgroup){
        console.log(updateSubgroup);
        if(err){
            req.flash("error", err.message);
            console.log(err);
        }else{
            req.flash("success", "Registro desabilitado com sucesso");
            console.log("registro desabilitado");
        }
        res.redirect("/subgroup");
    });
});

// DELETE ROUTE - but only disable
/*router.delete("/:id", function(req, res){
    Subgroup.findOne({_id:  req.body.subgroup.subgroupOf}, function(err, foundSubgroup){
         if(err){
            req.flash("error", err.message);
            console.log(err);
        }else{
            req.flash("success", "Registro excluído com sucesso");
            console.log("removed a subgroup");
        }
        res.redirect("/subgroup");
    });
    //  Blog.findOneAndDelete(req.params.id, req.body.blog,function(err){
    //    if(err) {
    //        res.redirect("/blogs");
    //    }else{
    //        res.redirect("/blogs");
    //    }
    // });
});
*/
module.exports = router