var mongoose = require("mongoose"),
moment = require('moment'),
numeral = require('numeral');

moment.locale('pt-br');
ptBr = require('numeral/locales/pt-br.js');

const MonthConfigSchema = new mongoose.Schema({
	dateSetup: Date,
	balanceAccountBank: Number,
	balanceCreditCard: Number,
	owner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
	},
  isDefined: { type: Boolean, default: false },
});

MonthConfigSchema.virtual('balanceAccountBankLabel').get(function () {
  return  numeral(this.balanceAccountBank).format(" 0,0.00");      
});
MonthConfigSchema.virtual('balanceCreditCardLabel').get(function () {
  return numeral(this.balanceCreditCard).format(" 0,0.00");
});
MonthConfigSchema.virtual('monthYearLabel').get(function () {
  var monthYear = moment(this.dateSetup).format('MMMM/YYYY')
  return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
});

MonthConfigSchema.virtual('monthYear').get(function () {
  return moment(this.dateSetup).format('MM/YYYY');
});
MonthConfigSchema.index( { dateSetup: 1, owner: 1}, { unique: true } );
MonthConfigSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model("MonthConfig", MonthConfigSchema);

