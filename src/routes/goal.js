/*
*	Page: /goal/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	{ PaymentMethods } = require('../models/entry'),
	MonthConfig 	= require("../models/month-config"),
	Subgroup 	= require("../models/subgroup"),
	moment = require('moment'),
	numeral = require('numeral'),
	ptBr = require('numeral/locales/pt-br.js'),
	async = require('async'),
	mongoose = require('mongoose');

	moment.locale('pt-br');
	numeral.locale('pt-br');

router.use(function(req, res, next){
   res.locals.moment = moment;
   res.locals.numeral = numeral;
   next();
});

// LIST
router.get('/', middleware.isLoggedIn,function(req, res) {
	let initialDate = moment().startOf('month').toDate();//moment.parse(moment.format(new Date(), '01-MM-YYYY'),'DD-MM-YYYY');

	MonthConfig.findOne({"owner.username": req.user.username, dateSetup: { $eq: initialDate }})
        .sort({description: 'asc'})
        .exec(function(err, monthConfig){
			if(err){
				req.flash("error", err.message);
            	console.log(err);
			} else if (typeof monthConfig === 'undefined' || monthConfig === null){
				//Não existe registro para essa lista
				console.log("Sem mês vigente");
				//Cria um novo setup para este mês com valores zerados
				let newMonthConfig = {
					owner: {
				        id: req.user._id,
				        username: req.user.username
				    },
				    balanceAccountBank: 0.0,
				    balanceCreditCard: 0.0,
				    dateSetup: initialDate
				};
				console.log(newMonthConfig);
				MonthConfig.create(newMonthConfig, function(err, savedMonthConfig){
					if(err){
						req.flash("error", err.message);
		            	console.log(err);
					}
					return res.redirect("/goal");
				});
			}else{
				MonthConfig.find({"owner.username": req.user.username, dateSetup: { $lt: initialDate }})
		        .sort({description: 'desc'})
		        .exec(function(err, anotherMonths){
		        	let initialDate = moment().startOf('month').toDate();
					let finalDate = moment().endOf('month').toDate();

			    	//Recupera todos os subgrupos para atribuir metas
				    Subgroup.find({"owner.username": req.user.username, subgroupOf: null, isActive: true})
				    .sort({description: 'asc'})
				    .exec(function(err, subgroupsTemp){
				    	var opts = [
						    { path: 'subgroupsInside', select: 'description', options: { sort: { 'description': 'asc' } } }
						];
				    	Subgroup.populate(subgroupsTemp, opts, function(err, subgroupsList){
				        	res.render("goals",{
					           	monthConfig: monthConfig, 
					           	anotherMonths: anotherMonths, 
					           	subgroups: subgroupsList
					           });
				        });
					});
				});
       		}
	});
});
//Realiza a inclusão / atualizacao baseado em uma data
router.put("/:month/:year/edit", middleware.isLoggedIn, function(req, res){
	console.log(req.body.subgroup);
	let initialDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').startOf('month').toDate();

	async.series([
		function(done){
			async.each(req.body.subgroup, function(goalForm, callback){
				console.log("#######################");
				console.log("ID: "+ goalForm.subgroupId);
				console.log("Valor: "+ numeral(goalForm.valueOfGoal).value());
				//PRECISO ENCONTRAR SOMENTE UM REGISTRO DE GOALS e removê-lo
				Subgroup.findOne({"owner.username": req.user.username, _id:mongoose.Types.ObjectId(goalForm.subgroupId)}).
				exec(function(err, subgroup){
					/*if(subgroup.goals === null){
						subgroup.goals = [];
					}*/
					let foundIndex = subgroup.goals.findIndex(goal => moment(goal.date).isSame(initialDate));
					let valueOfGoal = numeral(goalForm.valueOfGoal).value();

					console.log("INDEX: "+foundIndex);
					if(foundIndex !== -1){
						subgroup.goals[foundIndex].valueOfGoal = valueOfGoal;
					}else{
						subgroup.goals.push({
							date: initialDate,
			        		valueOfGoal: valueOfGoal
						});
					}
					subgroup.save(callback);
				});
			}, done);
		}
	], function allTaskCompleted(){
		req.flash("success", "Registros atualizados com sucesso");
		res.redirect("/goal");
	});

});

//update value of 
router.put("/:subgroup_id/:month/:year/edit", middleware.checkOwnership, function(req, res){
	let valueOfGoal = numeral(req.body.subgroup.valueOfGoal).value();
	let dateOfGoal = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').startOf('month');
	let initialDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').startOf('month');

	Subgroup.findOne({_id: req.params.subgroup_id}, function(err, subgroup){
		if(err){
			req.flash("error", err.message);
		   	console.log(err);
		}else{
			let foundIndex = subgroup.goals.findIndex(goal => dateOfGoal.isSame(initialDate));
			if(foundIndex !== -1){
				subgroup.goals[foundIndex].valueOfGoal = valueOfGoal;
			}else{
				subgroup.goals.push({
					date: initialDate,
					valueOfGoal: valueOfGoal
				});
			}
			subgroup.save();
			req.flash("success", "O valor foi atribuido ao grupo!");
			res.redirect("/goal");
		}
	});
});

//Update to favorite
router.put("/:subgroup_id/:month/:year/favorite", middleware.checkOwnership, function(req, res){
	Subgroup.findOne({_id: req.params.subgroup_id}, function(err, subgroup){
		if(err){
			req.flash("error", err.message);
            console.log(err);
		}else{
			subgroup.isFavorite = !subgroup.isFavorite;
			subgroup.save();
			req.flash("success", "Registros atualizados com sucesso");
		}
		res.redirect("/goal");
	});
});

module.exports = router