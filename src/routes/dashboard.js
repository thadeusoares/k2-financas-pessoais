/*
*	Page: /dashboard/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	entryGroups	= require("../controllers/entry-groups"),
	Entry 	= require("../models/entry"),
	MonthConfig 	= require("../models/month-config"),
	Subgroup 	= require("../models/subgroup"),
	moment = require('moment'),
	numeral = require('numeral'),
	async = require('async'),
	mongoose = require('mongoose'),
	ptBr = require('numeral/locales/pt-br.js'),
	device = require('express-device');

moment.locale('pt-br');
numeral.locale('pt-br');

router.use(function(req, res, next){
	res.locals.moment = moment;
	res.locals.numeral = numeral;
	next();
});

router.get('/', middleware.isLoggedIn,function(req, res) {
	if(res.locals.is_desktop){
		let initialDate = moment().startOf('month').toDate();
		let finalDate = moment().endOf('month').toDate();
		MonthConfig.find({isDefined: true, dateSetup: { $gte: initialDate, $lte: finalDate }})
		.exec(function(err, monthConfig){
			if(err){
				console.log("##########=>ERRO: ");
				console.log(err);
				res.render("home/erro",{ error: err});
			}else{
				//Recupera todos os subgrupos
			    Subgroup.find({
				    'owner.username': req.user.username,
				     subgroupOf: null,
				     isActive: true,
				     isFavorite: true,
				     'goals.date': { $eq: initialDate },
				     goals: { $elemMatch: { date: { $eq: initialDate} } } })
				.populate({ path: 'subgroupsInside', select: '_id' })
				.sort({description: 'asc'})
			    .exec(function(err, subgroups){
			    	if(err){
			    		res.render("home/erro",{ error: err });
			    	} else if (monthConfig.length === 0 || subgroups.length === 0){
			    		let info = [];
			    		if ( monthConfig.length === 0) info.push("Favor informar os saldos deste mês");
			    		if ( subgroups.length === 0 ) info.push("Não existem metas associadas aos favoritos para este mês");

			    		res.render("home/dashboard",{ info: info,ignoreViewRouting: true, subgroups: []});
			    	} else {
				    	//Recupera todas as Entries que foram criadas no mês vigente
				    	//Filtra somente aquelas referentes aos ids dos grupos ou seus filhos
						//REALIZAR REFACTORY, ESSE CÓDIGO ESTÁ MUITO SENSÍVEL			
						let subGroupsAgg = [];
						let arrayOfSubgroupsId = [];
						subgroups.forEach(function(subgroup){
							arrayOfSubgroupsId.push(subgroup._id);
							arrayOfSubgroupsId = arrayOfSubgroupsId.concat(subgroup.subgroupsInside.map(ele => ele._id));
						});
						Entry.find({
					   		"owner.username": req.user.username,
					   		createdIn: { $gte: initialDate, $lte: finalDate },
					   		"subgroup.id": { $in: arrayOfSubgroupsId }
					   	})
					   	.sort({createdIn: 'desc'})
						.exec(function(err, entriesList){
							if(err){
								console.log("##########=>ERRO: ");
								console.log(err);
								res.render("home/erro",{ error: err});
							}else{
								//Recupera os somatórios
								subgroups.forEach(function(subgroup){
									let arrayIds =[subgroup._id];
									arrayIds = arrayIds.concat(subgroup.subgroupsInside.map(ele => ele._id));
									let dados = entriesList.filter(function(entry){
										return arrayIds.filter(function(id){
											return entry.subgroup.id.equals(id);
										}).length !== 0
									});

									subgroup.aggregationOfEntries = entryGroups.aggregationBySubgroupOwner(subgroup, dados, initialDate);
									subGroupsAgg.push(subgroup);
								});
								res.render("home/dashboard",{ ignoreViewRouting: true, subgroups: subGroupsAgg });
							}
				    	});
			    	}
				});
			}
		});
	}else{
		res.redirect("/entry");
	}
});

module.exports = router