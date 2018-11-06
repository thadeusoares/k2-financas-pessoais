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
	/*let year = moment().format("YYYY");
	let month = moment().format('MM');
	res.redirect("/entry/"+ year + "/" + month);*/
	return homeEntry(res); //res.redirect("/entry");
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


// LIST
router.get('/:year/:month', middleware.isLoggedIn,function(req, res) {
	let initialDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').startOf('month').toDate();
	let finalDate = moment('01-'+req.params.month+'-'+req.params.year,'DD-MM-YYYY').endOf('month').toDate();
	
	let calculoPercentual = function(){
		return this.amountRealized / this.valueOfGoal ;
	}

	let aggregations = {
		fixa: {
			amountRealized: 0,
			valueOfGoal: 0,
			percentual: calculoPercentual
		},
		variavel: {
			amountRealized: 0,
			valueOfGoal: 0,
			percentual: calculoPercentual
		}
	};

	Entry.find({"owner.username": req.user.username, createdIn: { $gte: initialDate, $lte: finalDate } })
	.sort({createdIn: 'desc'})
	.exec(function(err, entriesList){
		MonthConfig.find({isDefined: true, dateSetup: { $gte: initialDate, $lte: finalDate }})
		.exec(function(err, monthConfig){
			if(err){
				req.flash("error", err.message);
			}else if(monthConfig.length === 0){
				res.render("entries",{entries: entriesList, aggregations:aggregations, menuEntries: menuEntries(req.params.year,req.params.month), error:"Por favor, configure seus saldos iniciais para este mês em 'Metas'"});
			}else{
				Subgroup.find({"owner.username": req.user.username, subgroupOf: null, isActive: true}, 
				function(errSubgroup, subgroups){
					

					if(err){
						req.flash("error", err.message);
					}else{
						aggregations.fixa.amountRealized = entriesList.filter((entry)=>entry.subgroup.group==="fixa")
								.reduce((prev, entry) => prev + entry.valueOf, 0);
							
						aggregations.variavel.amountRealized = entriesList.filter((entry)=>entry.subgroup.group!=="fixa")
								.reduce((prev, entry) => prev + entry.valueOf, 0);
						
						subgroups.forEach(function(subgroup){
							if(subgroup.group === "fixa"){
								aggregations.fixa.valueOfGoal += subgroup.goals
									.filter((goal)=>moment(goal.date).isSame(initialDate))
										.reduce( (soma, goal) => soma + goal.valueOfGoal, 0);
							}else{
								aggregations.variavel.valueOfGoal += subgroup.goals
									.filter((goal)=>moment(goal.date).isSame(initialDate))
										.reduce( (soma, goal) => soma + goal.valueOfGoal, 0);
							}
						});
					}
					//REALIZA A SOMA E MOSTRA O VALOR PREVISTO PARA CADA TIPO DE DESPESA
					res.render("entries",{entries: entriesList, aggregations:aggregations, menuEntries: menuEntries(req.params.year,req.params.month)});

				});
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
           // console.log("Novo apontamento incluido");
           // console.log(savedEntry);
        }
        return homeEntry(res); //res.redirect("/entry");
	});
});

router.put("/:entry_id", middleware.checkOwnership, function(req, res) {
	let entry = prepareEntryToSave(req.body.entry, req.user);
	Entry.findOneAndUpdate({_id: req.params.entry_id},  {$set: entry},function(err, updatedSubgroup){
		if(err) {
			req.flash("error", err.message);
			console.log(err);
		}else{
			req.flash("success", "Registro atualizado com sucesso");
		}
		return homeEntry(res); //res.redirect("/entry");
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

router.delete("/:entry_id", middleware.checkOwnership, function(req, res) {
	Entry.findByIdAndRemove(req.params.entry_id, function(err){
       if(err) {
           req.flash("error", err.message);
            console.log(err);
       }else{
            req.flash("success", "Lançamento excluído com sucesso");
       }
       return homeEntry(res); //res.redirect("/entry");
    });
});

function menuEntries(year, month) {
	//Se o mês estiver a frente, não posso exibir
	//Se for ano anterior completo sim
	var months = [
		{number: "01", name: "JAN", isSelected: false, year: year},
		{number: "02", name: "FEV", isSelected: false, year: year},
		{number: "03", name: "MAR", isSelected: false, year: year},
		{number: "04", name: "ABR", isSelected: false, year: year},
		{number: "05", name: "MAI", isSelected: false, year: year},
		{number: "06", name: "JUN", isSelected: false, year: year},
		{number: "07", name: "JUL", isSelected: false, year: year},
		{number: "08", name: "AGO", isSelected: false, year: year},
		{number: "09", name: "SET", isSelected: false, year: year},
		{number: "10", name: "OUT", isSelected: false, year: year},
		{number: "11", name: "NOV", isSelected: false, year: year},
		{number: "12", name: "DEZ", isSelected: false, year: year}
	];
	months[month-1].isSelected = true;
	return months;
}

function homeEntry(res){
	//Preciso utilizar seção para retornar para a página correta
	//Pois o ano pode ter mudado
	//Talvez trazer dentro de ***res*** os valores de ano e mes
	let year = moment().format("YYYY");
	let month = moment().format('MM');
    return res.redirect("/entry/"+year+"/"+month);
}


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

    //console.log(entry);

    return entry;
}

module.exports = router