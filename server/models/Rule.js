const mongoose = require('mongoose');

// Define the schema for the rule
const ruleSchema = new mongoose.Schema({
    ruleString: {
        type: String,
        required: true
    },
    ast: {
        type: Object, // Keep this as Object for tree structure
        required: true
    },
    isCombined: {
        type: Boolean,
        default: false // This field will indicate whether the rule is a combined rule
    },
    ruleNumber: {
        type: Number,
        required: function() {
            return !this.isCombined; // Only required for original rules
        }
    }
});

// Pre-save middleware to auto-increment ruleNumber
ruleSchema.pre('save', async function(next) {
    // Only set ruleNumber if it's a new document and not combined
    if (this.isNew && !this.isCombined) {
        try {
            const lastRule = await mongoose.model('Rule').findOne({ isCombined: false }).sort('-ruleNumber');
            this.ruleNumber = lastRule ? lastRule.ruleNumber + 1 : 1; // Default to 1 if no rules exist
            console.log(`Assigning ruleNumber: ${this.ruleNumber}`); // Log assigned ruleNumber
        } catch (err) {
            console.error('Error fetching last rule:', err);
            return next(err); // Pass the error to the next middleware
        }
    }
    next();
});

// Create the Rule model
const Rule = mongoose.model('Rule', ruleSchema);

// Export the Rule model
module.exports = Rule;
