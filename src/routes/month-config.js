/*
*	Page: /month-config/*
*/

let express 	= require("express"),
	router 		= express.Router(),
	middleware 	= require("../middlewares"),
	MonthConfig 	= require("../models/month-config"),
	moment = require('moment'),
	numeral = require('numeral'),
	ptBr = require('numeral/locales/pt-br.js');

	moment.locale('pt-br');
	numeral.locale('pt-br');

//=============================
// ROUTES month_config
//=============================

//SHOW MonthConfig JSON
router.get('/:month_id/json', middleware.checkOwnership, (req, res) => 
	MonthConfig
	.findById(req.params.month_id)
	.exec((err, groupsList) => res.status(200).json(groupsList))
);


//Make update in Month-config
router.put("/:month_id/edit", middleware.checkOwnership, function(req, res){
	req.body.monthConfig.balanceAccountBank = numeral(req.body.monthConfig.balanceAccountBank).value();
	req.body.monthConfig.balanceCreditCard = numeral(req.body.monthConfig.balanceCreditCard).value();

	MonthConfig.findOneAndUpdate({_id: req.params.month_id},{
		$set: {
		  	balanceAccountBank: req.body.monthConfig.balanceAccountBank,
		  	balanceCreditCard: req.body.monthConfig.balanceCreditCard,
		  	isDefined: true
	  	}
	  }, 
	  function(err, savedMonthConfig){
		if(err){
            req.flash("error", err.message);
            console.log(err);
        }else{
            req.flash("success", "Mês atualizado com sucesso");
            console.log("Mês foi configurado");
            console.log(savedMonthConfig);
        }
        res.redirect("/goal");
	});
});

module.exports = router