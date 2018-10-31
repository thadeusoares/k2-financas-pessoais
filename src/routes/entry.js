/*
*	Page: /entry/*
*/

let express 			= require("express"),
	router 				= express.Router(),
	middleware 			= require("../middlewares"),
	{ PaymentMethods } 	= require('../models/entry'),
	Entry 				= require("../models/entry"),
	MonthConfig 		= require("../models/month-config"),
	Subgroup 			= require("../models/subgroup"),
	moment 				= require('moment'),
	numeral 			= require('numeral'),
	ptBr 				= require('numeral/locales/pt-br.js');

	moment.locale('pt-br');
	numeral.locale('pt-br');

router.use(function(req, res, next){
   res.locals.moment = moment;
   res.locals.numeral = numeral;
   res.locals.paymentMethod = PaymentMethods;

   next();
});

// LIST
router.get('/', middleware.isLoggedIn,function(req, res) {
	let initialDate = moment().startOf('month').toDate();
	let finalDate = moment().endOf('month').toDate();

	Entry.find({"owner.username": req.user.username, createdIn: { $gte: initialDate, $lte: finalDate } })
	.sort({createdIn: 'desc'})
	.exec(function(err, entriesList){
		MonthConfig.find({isDefined: true, dateSetup: { $gte: initialDate, $lte: finalDate }})
		.exec(function(err, monthConfig){
			if(err){
				req.flash("error", err.message);
			}else if(monthConfig.length === 0){
				res.render("entries",{entries: entriesList, error:"Por favor, configure seus saldos iniciais para este mês em 'Metas'"});
			}else{
				//REALIZA A SOMA E MOSTRA O VALOR PREVISTO PARA CADA TIPO DE DESPESA
				res.render("entries",{entries: entriesList});
			}
	    });
	});

});


//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
	
	let entry = prepareEntryToSave(req.body.entry, req.user);

	Entry.create(entry, function(err, savedEntry){
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


router.get("/:entry_id/edit", middleware.checkOwnership, function(req, res) {
	Entry.findById(req.params.entry_id, function(err, entry){
       if(err) {
           req.flash("error", err.message);
           console.log(err);
           res.redirect("/entry");
		}else{
			Subgroup.findById(entry.subgroup.id, function(err, subgroup){
				if(err) {
		           req.flash("error", err.message);
		           console.log(err);
		           res.redirect("/entry");
				}else{
					//Campo temporário somente para renderizar
					var descGrupo = subgroup.group==='fixa'?'Despesas Fixas':'Despesas Variáveis';
                	var subtipo = subgroup.description;

	                entry.txtDescricao = {
						id: subgroup._id,
	                    subtipo: subtipo,
	                    description: subgroup.description,
	                    descGrupo: descGrupo,
	                    group: subgroup.group,
	                    description_highlight: subgroup.description,
	                    subtipo_highlight:subtipo
	                };
					
					res.render("entries/edit", {entry: entry});
				}
			});
		}
    });
});

router.put("/:entry_id", middleware.checkOwnership, function(req, res) {
	let entry = prepareEntryToSave(req.body.entry, req.user);
	Entry.findOneAndUpdate({_id: req.params.entry_id},  {$set: entry},function(err, updatedSubgroup){
		if(err) {
			req.flash("error", err.message);
			console.log(err);
			res.redirect("/entry");
		}else{
			req.flash("success", "Registro atualizado com sucesso");
            res.redirect("/entry");
		}
	});
});


function prepareEntryToSave(entry, user){
	var detalheTransacao = JSON.parse(entry.description);
	var tipoPagamento = PaymentMethods[entry.paymentMethod];

	entry.description = detalheTransacao.description;
	entry.paymentMethod = PaymentMethods[entry.paymentMethod];
	entry.typeOfEntry;
	entry.createdIn = moment(entry.createdIn, 'DD/MM/YYYY').toDate();
	entry.owner = {
        id: user._id,
        username: user.username
    }
    //VERIFICAR SE É ESSE MESMO
    entry.subgroup = {
    	id: detalheTransacao.id,
    	group: detalheTransacao.group,
    	description: detalheTransacao.descGrupo,
    };

    entry.valueOf = numeral(entry.valueOf).value();

    console.log(entry);

    return entry;
}

router.get('/:year/:month/json', middleware.isLoggedIn, function(req, res) {

	let initialDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').startOf('month').toDate();
	let finalDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').endOf('month').toDate();

	res.setHeader('Content-Type', 'application/json');
    Entry.find({"owner.username": req.user.username, createdIn: { $gte: initialDate, $lte: finalDate } })
    .exec(function(err, entriesList){
            res.send(JSON.stringify(entriesList));
    });
});

router.delete("/:entry_id", middleware.checkOwnership, function(req, res) {
	Entry.findByIdAndRemove(req.params.entry_id, function(err){
       if(err) {
           req.flash("error", err.message);
            console.log(err);
       }else{
            req.flash("success", "Lançamento excluído com sucesso");
       }
       res.redirect("/entry");
    });
});

module.exports = router