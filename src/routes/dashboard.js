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
	}).sort({description: 'asc'})
    .exec(function(err, subgroups){
    	//Recupera todas as Entries que foram criadas no mês vigente
    	//Filtra somente aquelas referentes aos ids dos grupos
	   	Entry.find({
	   		"owner.username": req.user.username,
	   		createdIn: { $gte: initialDate, $lte: finalDate }
	   	})
	   	.where('subgroup.id').in(subgroups.map(ele => ele.id))
	   	.sort({createdIn: 'desc'})
		.exec(function(err, entriesList){
			//Recupera os somatórios
			subgroups.forEach(function(subgroup){
				subgroup.aggregationOfEntries = entryGroups.aggregationBySubgroup(subgroup, entriesList, initialDate);
			});
	    	
	    	res.render("index_dashboard",{ subgroups: subgroups });
    	});
	});

})

module.exports = router