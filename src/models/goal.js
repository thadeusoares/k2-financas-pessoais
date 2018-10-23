var mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  createdIn: { type: Date, default: Date.now },
  referenceDate: { type: Date, default: Date.now },
  subgroup: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subgroup"
      },
      group: String,
      description: String
  },
  value: Number,
  owner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Goal", EntrySchema);