/*
*	Page: /dashboard/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	Subgroup 	= require("../models/subgroup"),
	moment = require('moment'),
	numeral = require('numeral'),
	ptBr = require('numeral/locales/pt-br.js');

moment.locale('pt-br');
numeral.locale('pt-br');

router.get('/', middleware.isLoggedIn,function(req, res) {
	let initialDate = moment().startOf('month').toDate();//moment.parse(moment.format(new Date(), '01-MM-YYYY'),'DD-MM-YYYY');
	//Recupera todos os subgrupos para atribuir metas
    Subgroup.find({"owner.username": req.user.username, subgroupOf: null, isActive: true, isFavorite: true,
    	'goals.date': {$eq: initialDate}},
    	{goals:{$elemMatch:{date: {$eq: initialDate}}}})
    .sort({description: 'asc'})
    .exec(function(err, subgroupsTemp){
    	console.log(subgroupsTemp);
    	var opts = [
		    { path: 'subgroupsInside', select: 'description', options: { sort: { 'description': 'asc' } } }
		];
    	Subgroup.populate(subgroupsTemp, opts, function(err, subgroupsList){
    		
        	res.render("index_dashboard",{
	            
	           	subgroups: subgroupsList
	           });
        });
	});
})

module.exports = router