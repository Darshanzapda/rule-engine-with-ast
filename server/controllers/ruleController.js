const Rule = require('../models/Rule');

// Sample logic for creating rule from string
exports.createRule = (req, res) => {
  const { ruleString } = req.body;

  // Logic to convert ruleString to AST
  const ast = buildAST(ruleString);

  const newRule = new Rule({ ruleString, ast });
  newRule.save()
    .then(rule => res.json(rule))
    .catch(err => res.status(500).json({ message: 'Error creating rule' }));
};

// Helper function to build AST
const buildAST = (ruleString) => {
  // Dummy logic to convert a string to AST structure
  // You should expand this function according to the rule syntax
  return [{ type: 'operator', value: 'AND' }];
};

exports.evaluateRule = (req, res) => {
  const { ruleAST, data } = req.body;
  
  const result = evaluateAST(ruleAST, data);
  res.json({ result });
};

// Evaluate the AST
const evaluateAST = (ast, data) => {
  // Logic to evaluate AST based on the input data
  // Return true or false based on rule evaluation
  return true;
};
