var moment 		= require('moment'),
	numeral 	= require('numeral'),
	ptBr 		= require('numeral/locales/pt-br.js'),
	{PaymentMethods} = require('../models/entry');
	moment.locale('pt-br');
	numeral.locale('pt-br');

module.exports = {
	aggregations: function(subgroups, entriesList, initialDate){
		let calculoPercentual = function(){ return this.amountRealized / this.valueOfGoal};
	
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

		return aggregations;
    },
    //Refatorar esse método depois
    aggregationBySubgroup: function(subgroup, entriesList, initialDate){
		let calculoPercentual = function(){ return this.amountRealized / this.valueOfGoal};
		let aggregation = {
			amountRealized: 0,
			valueOfGoal: 0,
			percentual: calculoPercentual
		};
		
		aggregation.amountRealized = entriesList.filter((entry)=>entry.subgroup.id.equals(subgroup._id)).reduce((prev, entry) => prev + entry.valueOf, 0);
		aggregation.valueOfGoal += subgroup.goals.reduce( (soma, goal) => soma + goal.valueOfGoal, 0);
		return aggregation;
    },
    //Refatorar esse método depois
    aggregationBySubgroupOwner: function(subgroup, entriesList, initialDate){
		let calculoPercentual = function(){ return this.amountRealized / this.valueOfGoal};
		let aggregation = {
			amountRealized: 0,
			valueOfGoal: 0,
			percentual: calculoPercentual
		};
		if(typeof entriesList !== undefined && (entriesList !== null && entriesList.length > 0)){
			aggregation.amountRealized = entriesList.reduce((prev, entry) => prev + entry.valueOf, 0);
		}
		aggregation.valueOfGoal += subgroup.goals.reduce( (soma, goal) => soma + goal.valueOfGoal, 0);
		return aggregation;
    },

    //Retorna saldos de um mês
    /*

const PaymentMethods = Object.freeze({
  //Pessoa Física
  pf01: "PF/Débito",
  pf02: "PF/Dinheiro",
  pf03: "PF/Crédito",
  //Pessoa Jurídica
  pj01: "PJ/Débito",
  pj02: "PJ/Dinheiro",
  pj03: "PJ/Crédito",
  pj04: "PJ/Financiamento",
});

    */
    balance: function(entriesList, monthConfig){
    	let retorno = {
    		creditCard: 0,
    		account: 0
    	}
		
    	if(typeof entriesList !== undefined && (entriesList !== null && entriesList.length > 0)){
    		//CONSIDERA SÓ O CARTÃO!
			retorno.creditCard = numeral(monthConfig.balanceCreditCard).subtract(entriesList
				.filter(entry => entry.paymentMethod === PaymentMethods.pf03)
				.reduce((prev, entry) => prev + entry.valueOf, 0))._value;



			//CONSIDERA DEBITO E DINHEIRO
			retorno.account = numeral(monthConfig.balanceAccountBank).subtract(entriesList
				.filter(entry => entry.paymentMethod === PaymentMethods.pf01 || entry.paymentMethod === PaymentMethods.pf02)
				.reduce((prev, entry) => prev + entry.valueOf, 0))._value;
		}
    	return retorno;
    }
}