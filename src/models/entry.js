var mongoose = require("mongoose");

const PaymentMethods = Object.freeze({
  //Pessoa Física
  pf01: "PF/Débito",
  pf02: "PF/Dinheiro",
  pf03: "PF/Crédito",
  //Pessoa Jurídica
  /*
  pj01: "PJ/Débito",
  pj02: "PJ/Dinheiro",
  pj03: "PJ/Crédito",
  pj04: "PJ/Financiamento",*/
});

const EntrySchema = new mongoose.Schema({
  description: String,
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethods),
  },
  typeOfEntry: {
    type: String,
    enum: ["in","out"],
    required: true
  },
  createdIn: { type: Date, default: Date.now },
  owner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
  },
  subgroup: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subgroup"
      },
      group: String,
      description: String
  },
  valueOf: Number,
  isActive: {
    type: Boolean,
    default: true
  }
});


Object.assign(EntrySchema.statics, {
  PaymentMethods,
});


module.exports = mongoose.model("Entry", EntrySchema);