var moment 		= require('moment'),
	numeral 	= require('numeral'),
	ptBr 		= require('numeral/locales/pt-br.js');

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
    }
}