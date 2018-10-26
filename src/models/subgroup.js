var mongoose = require("mongoose")

const SubgroupSchema = new mongoose.Schema({
	group: {
		type: String,
		enum: ['fixa', 'variavel']
	},
	subgroupsInside: [
		{
			type: mongoose.Schema.Types.ObjectId,
        	ref: "Subgroup"
    	}
	],
	subgroupOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subgroup"
    },
	description: {
		type: String,
		required: true
	},
    goals: [{
        valueOfGoal: Number,
        date: Date
    }],
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
SubgroupSchema.index( { group: 1, description: 1, owner: 1}, { unique: true } );

module.exports = mongoose.model("Subgroup",SubgroupSchema);