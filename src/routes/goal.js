/*
*	Page: /goal/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	{ PaymentMethods } = require('../models/entry'),
	Entry 	= require("../models/entry"),
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

		        	Entry.find({"owner.username": req.user.username, createdIn: { $gte: initialDate, $lte: finalDate } })
				    .exec(function(err, entriesList){

				    	//Recupera todos os subgrupos para atribuir metas
					    Subgroup.find({"owner.username": req.user.username, subgroupOf: null, isActive: true})
					        .populate({path:'subgroupsInside', options: { sort: { 'description': 'asc' } }})
					        .populate("goals")
					        .sort({description: 'asc'})
					        .exec(function(err, subgroupsList){
					        	res.render("goals",{
					            	monthConfig: monthConfig, 
					            	anotherMonths: anotherMonths, 
					            	entries: entriesList,
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

	/*req.body.subgroup.forEach(function(goal){
		console.log("#######################");
		console.log("ID: "+ goal.id);
		console.log("Valor: "+ numeral(goal.valueOfGoal).value());

		Subgroup.findOne({"owner.username": req.user.username, _id:mongoose.Types.ObjectId(goal.id)}).exec(function(err, subgroup){
			subgroup.goals.push({date: initialDate,valueOfGoal:numeral(goal.valueOfGoal).value()});
			subgroup.save();
		});
	});
	
	req.flash("success", "Registros atualizados com sucesso");
	res.redirect("/goal");
	*/

	async.series([
		function(done){
			async.each(req.body.subgroup, function(goal, callback){
				console.log("#######################");
				console.log("ID: "+ goal.id);
				console.log("Valor: "+ numeral(goal.valueOfGoal).value());
				//PRECISO ENCONTRAR SOMENTE UM REGISTRO DE GOALS e removê-lo
				Subgroup.findOne({"owner.username": req.user.username, _id:mongoose.Types.ObjectId(goal.id)}).
				exec(function(err, subgroup){
					subgroup.goals.push({date: initialDate,valueOfGoal:numeral(goal.valueOfGoal).value()});
					console.log(subgroup);
					subgroup.save(callback);
				});
			}, done);
		}
	], function allTaskCompleted(){
		req.flash("success", "Registros atualizados com sucesso");
		res.redirect("/goal");
	});

});


module.exports = router