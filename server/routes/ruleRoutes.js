const express = require('express'); 
const router = express.Router(); // Create a router instance
const Rule = require('../models/Rule'); // Import the Rule model

// Function to get the next rule number
async function getNextRuleNumber() {
    const lastRule = await Rule.findOne({}).sort('-ruleNumber');
    return lastRule ? lastRule.ruleNumber + 1 : 1; // Default to 1 if no rules exist
}


function parseRuleString(ruleString) {
    const tokens = ruleString.match(/\w+|[^\s]+/g); // Split into tokens
    const stack = []; // Stack to manage nested conditions
    let currentNode = null; // Pointer to the current node
    let operatorStack = []; // Stack for operators
    let conditionBuffer = ''; // To build full condition strings

    for (let token of tokens) {
        if (token === '(') {
            // Start a new sub-expression
            stack.push(currentNode);
            operatorStack.push(null); // Placeholder for operator
            currentNode = null; // Reset current node for new expression
        } else if (token === ')') {
            // End the current sub-expression
            if (conditionBuffer) {
                const conditionNode = {
                    type: 'condition',
                    value: conditionBuffer.trim() // Store full condition
                };
                if (operatorStack.length) {
                    const lastOperator = operatorStack.pop();
                    lastOperator.right = conditionNode; // Attach to the right of the operator
                    currentNode = lastOperator; // Move up the tree
                } else {
                    currentNode = conditionNode; // If no operator, set as current node
                }
            }

            // Attach completed sub-expression to parent
            if (stack.length > 0) {
                const parentNode = stack.pop();
                if (parentNode) {
                    parentNode.right = currentNode; // Attach to parent
                    currentNode = parentNode; // Move back to parent node
                }
            }
            conditionBuffer = ''; // Reset for next condition
        } else if (token === 'AND' || token === 'OR') {
            // Create a new operator node
            if (conditionBuffer) {
                const conditionNode = {
                    type: 'condition',
                    value: conditionBuffer.trim() // Store full condition
                };
                if (currentNode) {
                    const lastOperator = operatorStack[operatorStack.length - 1];
                    if (lastOperator) {
                        lastOperator.right = conditionNode; // Attach to the right of the last operator
                    } else {
                        currentNode = conditionNode; // If no operator, set as current node
                    }
                } else {
                    currentNode = conditionNode; // If no current node, set as current node
                }
                conditionBuffer = ''; // Reset for next condition
            }

            const operatorNode = {
                type: 'operator',
                value: token,
                left: currentNode,
                right: null
            };
            operatorStack.push(operatorNode); // Push operator onto stack
            currentNode = null; // Reset current node for next condition
        } else {
            // Build the condition, ensuring no parentheses are included
            conditionBuffer += (conditionBuffer ? ' ' : '') + token.replace(/^\(|\)$/g, '').trim(); // Remove any leading/trailing parentheses
        }
    }

    // Finalizing any remaining conditions
    if (conditionBuffer) {
        const conditionNode = {
            type: 'condition',
            value: conditionBuffer.trim() // Store full condition
        };
        if (operatorStack.length) {
            const lastOperator = operatorStack.pop();
            lastOperator.right = conditionNode; // Attach to the right of the operator
            currentNode = lastOperator; // Move up the tree
        } else {
            currentNode = conditionNode; // If no operator, set as current node
        }
    }

    // Finalize remaining operators
    while (operatorStack.length) {
        const opNode = operatorStack.pop();
        opNode.right = currentNode; // Attach the last condition
        currentNode = opNode; // Move up the tree
    }

    // Clean up the AST to remove unwanted parentheses
    return cleanAST(currentNode); // Return the root of the AST
}

// Function to clean up the AST and remove any unnecessary parentheses
function cleanAST(node) {
    if (!node) return null;

    if (node.type === 'operator' && node.value === 'AND' || node.value === 'OR') {
        node.left = cleanAST(node.left);
        node.right = cleanAST(node.right);
    } else if (node.type === 'condition') {
        node.value = node.value.replace(/^\(/, '').replace(/\)$/, ''); // Clean up parentheses around conditions
    }

    return node;
}


// Create a new rule
router.post('/create', async (req, res) => {
    try {
        const { ruleString } = req.body;

        // Validate ruleString input
        if (!ruleString) {
            return res.status(400).json({ error: 'ruleString is required' });
        }

        // Validate rule format
        if (!validateRuleString(ruleString)) {
            return res.status(400).json({ error: 'Invalid rule format. Please enter a valid rule.' });
        }

        // Build AST from rule string
        const ast = parseRuleString(ruleString);

        // Ensure that the AST is created
        if (!ast) {
            return res.status(400).json({ error: 'Invalid rule string, could not parse AST' });
        }

        // Create new rule with AST
        const newRule = new Rule({ ruleString, ast });

        // Check if the rule is combined
        if (newRule.isCombined) {
            newRule.ruleNumber = undefined; // No ruleNumber for combined rules
        } else {
            // Auto-assign ruleNumber if it's not combined
            const lastRule = await Rule.findOne({ isCombined: false }).sort('-ruleNumber');
            newRule.ruleNumber = lastRule ? lastRule.ruleNumber + 1 : 1; // Default to 1 if no rules exist
        }

        console.log('New Rule:', newRule); // Log the new rule before saving
        await newRule.save();

        res.status(201).json({ message: 'Rule created successfully', rule: newRule });
    } catch (error) {
        console.error('Error creating rule:', error); // Log the full error
        res.status(500).json({ error: 'Internal Server Error', details: error.message || error });
    }
});



const validateRuleString = (ruleString) => {
    // Remove whitespace for easier processing
    ruleString = ruleString.replace(/\s+/g, ' ').trim();

    const tokens = ruleString.match(/(\(|\)|AND|OR|\w+\s*(>=|<=|>|<|=)\s*('.*?'|\d+))/g);

    if (!tokens) return false;

    const stack = [];
    let expectingCondition = false;

    for (const token of tokens) {
        if (token === '(') {
            stack.push(token);
            expectingCondition = true; // We expect a condition or another opening parenthesis next
        } else if (token === ')') {
            if (stack.length === 0 || expectingCondition) return false; // Unmatched parenthesis or malformed
            stack.pop(); // Closing a valid parenthesis
            expectingCondition = false; // After closing, we expect an operator or closing
        } else if (token === 'AND' || token === 'OR') {
            if (expectingCondition) return false; // Operator without valid preceding condition
            expectingCondition = true; // After an operator, we expect a condition or opening parenthesis
        } else {
            // It's a condition
            if (!expectingCondition) return false; // Invalid condition where an operator was expected
            expectingCondition = false; // Found a condition, now expect an operator or closing parenthesis
        }
    }

    // Must not have unmatched parentheses and must end with a valid expression
    return stack.length === 0 && !expectingCondition;
};


// Fetch all original rules (not combined)
router.get('/all', async (req, res) => {
    try {
        const rules = await Rule.find({ isCombined: false });
        res.status(200).json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ message: 'Error fetching rules' });
    }
});

// Fetch all combined rules
router.get('/combined', async (req, res) => {
    try {
        const combinedRules = await Rule.find({ isCombined: true });
        res.status(200).json(combinedRules);
    } catch (error) {
        console.error('Error fetching combined rules:', error);
        res.status(500).json({ message: 'Error fetching combined rules' });
    }
});

// Combine multiple rules
router.post('/combine', async (req, res) => {
    const { ruleIds } = req.body;

    try {
        // Fetch rules by IDs
        const rules = await Rule.find({ _id: { $in: ruleIds } });

        // Combine the rules (e.g., concatenate all rule strings)
        const combinedRuleString = rules.map(rule => rule.ruleString).join(' AND ');

        // Create the root of the AST
        const combinedAst = {
            type: 'operator',
            value: 'AND',
            left: null,
            right: null
        };

        // Track the current node for linking
        let currentAstNode = combinedAst;

        // Iterate over rules to build the AST
        rules.forEach((rule, index) => {
            const ruleAst = rule.ast; // AST of the current rule
            
            if (index === 0) {
                // For the first rule, set its AST as the left node
                currentAstNode.left = ruleAst;
            } else {
                // Create a new operator node for subsequent rules
                const newOperatorNode = {
                    type: 'operator',
                    value: 'AND',
                    left: currentAstNode.right || ruleAst, // Link the last AST node
                    right: ruleAst // Current rule's AST becomes the right child
                };

                // If current node already has a right child, chain the new operator node
                if (currentAstNode.right) {
                    currentAstNode.right = newOperatorNode;
                } else {
                    currentAstNode.right = ruleAst; // Otherwise, set the right to the current rule's AST
                }
                
                // Move to the new operator node
                currentAstNode = newOperatorNode;
            }
        });

        // Get the next ruleNumber for combined rules
        const newRuleNumber = await getNextRuleNumber(); // Use the function defined earlier

        // Save the combined rule
        const newCombinedRule = new Rule({
            ruleString: combinedRuleString,
            ast: combinedAst, // Set the constructed AST
            isCombined: true,
            ruleNumber: newRuleNumber // Assign the next ruleNumber
        });

        await newCombinedRule.save();
        res.status(201).json(newCombinedRule);
    } catch (error) {
        console.error('Error combining rules:', error);
        res.status(500).json({ message: 'Error combining rules', error: error.message });
    }
});

// Evaluate a rule based on the provided data
router.post('/evaluate_rule', async (req, res) => {
    const { data } = req.body;

    // Validate the input data
    if (!data) {
        return res.status(400).json({ error: 'Data is required for evaluation' });
    }

    // Ensure the data is already in JSON format (Postman should send as JSON)
    let userData;
    try {
        userData = JSON.parse(data); // Parse the JSON input if it's a string
    } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON format' });
    }

    try {
        // Retrieve all combined rules from the database
        const combinedRules = await Rule.find({ isCombined: true });

        // Evaluate the AST against the user data
        const evaluateAST = (node) => {
            if (node.type === 'condition') {
                const condition = node.value;
                const [attribute, operator, value] = condition.split(' ');

                // Handle string and numeric comparisons separately
                if (userData[attribute] === undefined) return false;

                // Handle numeric comparisons
                if (!isNaN(userData[attribute])) {
                    switch (operator) {
                        case '>':
                            return userData[attribute] > Number(value);
                        case '<':
                            return userData[attribute] < Number(value);
                        case '=':
                            return userData[attribute] === Number(value);
                        default:
                            return false;
                    }
                }
                
                // Handle string comparisons (remove single quotes around string values)
                if (isNaN(userData[attribute])) {
                    const stringValue = value.replace(/'/g, ""); // Remove single quotes around strings
                    switch (operator) {
                        case '=':
                            return userData[attribute] === stringValue;
                        default:
                            return false;
                    }
                }

            } else if (node.type === 'operator') {
                const leftResult = evaluateAST(node.left);
                const rightResult = evaluateAST(node.right);
                return node.value === 'AND' ? leftResult && rightResult : leftResult || rightResult;
            }
            return false;
        };

        // Evaluate each combined rule against the user data
        const meetsCriteria = combinedRules.some(rule => evaluateAST(rule.ast));

        // Return the evaluation result
        res.status(200).json({ result: meetsCriteria });
    } catch (error) {
        console.error('Error evaluating rules:', error);
        res.status(500).json({ error: 'Error evaluating rules', details: error.message });
    }
});



module.exports = router; // Export the router
