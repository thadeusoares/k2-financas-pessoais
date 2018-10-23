/*
*	Page: /entry/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	{ PaymentMethods } = require('../models/entry'),
	Entry 	= require("../models/entry"),
	MonthConfig 	= require("../models/month-config"),
	moment = require('moment'),
	numeral = require('numeral'),
	ptBr = require('numeral/locales/pt-br.js');

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
					return res.redirect("/entry");
				});
			}else{
				MonthConfig.find({"owner.username": req.user.username, dateSetup: { $lt: initialDate }})
		        .sort({description: 'desc'})
		        .exec(function(err, anotherMonths){
		        	let initialDate = moment().startOf('month').toDate();
					let finalDate = moment().endOf('month').toDate();

		        	Entry.find({"owner.username": req.user.username, createdIn: { $gte: initialDate, $lte: finalDate } })
				    .exec(function(err, entriesList){
				        res.render("entries",{monthConfig: monthConfig, anotherMonths: anotherMonths, entries: entriesList});
				    });
				});
       		}
	});
});


//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
	
	var detalheTransacao = JSON.parse(req.body.entry.description);
	var tipoPagamento = PaymentMethods[req.body.entry.paymentMethod];

	//console.log(detalheTransacao);
	//var descricao = detalheTransacao.description;
	//var codGrupo = detalheTransacao.codGrupo;
	//var idSubgroup = detalheTransacao.id;

	//var valorApontamento = numeral(req.body.entry.valueOf);
	//Buscar do banco
	//var valorPrevisto = valorApontamento;
	//Realizar cálculo
	//var situacao = 0;
	req.body.entry.description = detalheTransacao.description;
	req.body.entry.paymentMethod = PaymentMethods[req.body.entry.paymentMethod];
	req.body.entry.typeOfEntry;
	req.body.entry.createdIn = moment(req.body.entry.createdIn, 'DD/MM/YYYY').toDate();
	req.body.entry.owner = {
        id: req.user._id,
        username: req.user.username
    }
    //VERIFICAR SE É ESSE MESMO
    req.body.entry.subgroup = {
    	id: detalheTransacao.id,
    	group: detalheTransacao.group,
    	description: detalheTransacao.descGrupo,
    };

    req.body.entry.valueOf = numeral(req.body.entry.valueOf).value();

	Entry.create(req.body.entry, function(err, savedEntry){
	 	if(err){
            req.flash("error", err.message);
            console.log(err);
        }else{
            req.flash("success", "Apontamento registrado com sucesso");
            console.log("Novo apontamento incluido");
            console.log(savedEntry);
        }
        res.redirect("/entry");
	});
});

router.get('/:year/:month/json', middleware.isLoggedIn, function(req, res) {

	let initialDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').startOf('month').toDate();
	let finalDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').endOf('month').toDate();

	res.setHeader('Content-Type', 'application/json');
    Entry.find({"owner.username": req.user.username, createdIn: { $gte: initialDate, $lte: finalDate } })
    .exec(function(err, entriesList){
            res.send(JSON.stringify(entriesList));
    });
});

module.exports = router