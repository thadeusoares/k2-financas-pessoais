/*
*	Page: /dashboard/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	entryGroups	= require("../controllers/entry-groups"),
	Entry 	= require("../models/entry"),
	Subgroup 	= require("../models/subgroup"),
	moment = require('moment'),
	numeral = require('numeral'),
	async = require('async'),
	ptBr = require('numeral/locales/pt-br.js'),
	{ Query } = mongoose = require("mongoose");

moment.locale('pt-br');
numeral.locale('pt-br');

router.use(function(req, res, next){
   res.locals.moment = moment;
   res.locals.numeral = numeral;
   next();
});

router.get('/', middleware.isLoggedIn,function(req, res) {
	let initialDate = moment().startOf('month').toDate();
	let finalDate = moment().endOf('month').toDate();

	//Recupera todos os subgrupos
    Subgroup.find({
	    'owner.username': req.user.username,
	     subgroupOf: null,
	     isActive: true,
	     isFavorite: true,
	     'goals.date': { $eq: initialDate },
	     goals: { $elemMatch: { date: { $eq: initialDate} } } 
	})
	.populate({ path: 'subgroupsInside', select: '_id' })
	.sort({description: 'asc'})
    .exec(function(err, subgroups){
    	if(err || subgroups.length === 0){
    		res.render("home/erro",{ error: err || "Não existem favoritos"});
    	}else{
	    	//Recupera todas as Entries que foram criadas no mês vigente
	    	//Filtra somente aquelas referentes aos ids dos grupos ou seus filhos
			//REALIZAR REFACTORY, ESSE CÓDIGO ESTÁ MUITO SENSÍVEL			
			let subGroupsAgg = [];
			 for(let i=0; i < subgroups.length; i++) {
			 	let subgroup = subgroups[i];
				Entry.find({
			   		"owner.username": req.user.username,
			   		createdIn: { $gte: initialDate, $lte: finalDate }
			   	})
			   	.where('subgroup.id').in([subgroup._id, subgroup.subgroupsInside.map(ele => ele._id)])
			   	.sort({createdIn: 'desc'})
				.exec(function(err, entriesList){
					//Recupera os somatórios
					subgroup.aggregationOfEntries = entryGroups.aggregationBySubgroupOwner(subgroup, entriesList, initialDate);
					subGroupsAgg.push(subgroup);
					if(i+1 === subgroups.length){
						res.render("home/dashboard",{ subgroups: subGroupsAgg });
					}
		    	});
			}
    	}
	});

})

module.exports = router