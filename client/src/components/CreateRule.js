import React, { useState } from 'react';
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const CreateRule = () => {
  const [ruleString, setRuleString] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Function to generate AST from rule string
  const generateAST = (ruleString) => {
    const operators = ['AND', 'OR'];
    const tokens = ruleString.split(/\s+/); // Split by whitespace
    const ast = [];
    let currentNode = null;

    tokens.forEach(token => {
      if (operators.includes(token)) {
        if (currentNode) {
          ast.push(currentNode);
        }
        currentNode = { type: "operator", value: token, left: null, right: null };
      } else {
        const operand = { type: "operand", value: token };
        if (currentNode && !currentNode.left) {
          currentNode.left = operand; // Assign to left if available
        } else if (currentNode) {
          currentNode.right = operand; // Assign to right if available
        } else {
          ast.push(operand); // Push directly if no current node
        }
      }
    });

    if (currentNode) {
      ast.push(currentNode); // Push the last node
    }

    return ast;
  };

  const handleCloseModal = () => setShowModal(false);

  const validateRuleString = (ruleString) => {
    // Match tokens like ( or ) or AND/OR or valid conditions (age > 30, gender = 'male')
    const tokens = ruleString.match(/(\(|\)|AND|OR|\w+\s*(>=|<=|>|<|=)\s*\d+|\w+\s*=\s*'[^']+'|\w+)/g);
  
    if (!tokens) return false; // No valid tokens
  
    const stack = [];
    let expectingOperator = false; // We expect an operator (AND/OR) after a condition or closing parenthesis
  
    for (const token of tokens) {
      if (token === '(') {
        stack.push(token);
        expectingOperator = false; // After '(', we expect a condition
      } else if (token === ')') {
        if (stack.length === 0 || expectingOperator === false) return false; // Unmatched ')' or no valid condition before ')'
        stack.pop(); // Close a parenthesis block
        expectingOperator = true; // After ')', expect an operator
      } else if (token === 'AND' || token === 'OR') {
        if (!expectingOperator) return false; // If we get an operator without a preceding condition or closing parenthesis
        expectingOperator = false; // After an operator, expect a condition
      } else {
        // Valid condition like age > 30 or gender = 'male'
        if (expectingOperator) return false; // If we get a condition when we expect an operator
        expectingOperator = true; // After a valid condition, expect an operator or closing parenthesis
      }
    }
  
    // The stack should be empty (all parentheses closed), and the last token should be a condition or a closing parenthesis
    return stack.length === 0 && expectingOperator;
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateRuleString(ruleString)) {
      setMessage('Invalid rule format. Please enter a valid rule.');
      setShowModal(true);
      return;
    }
  
    const ast = generateAST(ruleString);
    const requestBody = { ruleString, ast };
  
    console.log('Request Body:', requestBody); // Log the request body
  
    try {
      const response = await axios.post('http://localhost:5000/api/rules/create', requestBody);
  
      console.log('Response:', response); // Log the response
  
      if (response.status === 200) {
        setMessage('Rule created successfully.');
      } else {
        setMessage('Rule created successfully.');
      }
    } catch (error) {
      let errorMessage = 'Server not reachable';
  
      if (error.response) {
        errorMessage = error.response.data.message || `Invalid rule format. Please enter a valid rule.`;
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = `Request error: ${error.message}`;
      }
  
      console.error('Error:', errorMessage); // Log the error for debugging
      setMessage(errorMessage);
    } finally {
      setShowModal(true);
    }
  };
  

  return (
    <div>
      <h3>Create a New Rule</h3>
      <br />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rule String</label>
          <input
            type="text"
            placeholder="Enter String Here"
            className="form-control"
            value={ruleString}
            onChange={(e) => setRuleString(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Create Rule</button>
      </form>
      <br />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{message.includes('Error') || message.includes('Invalid') ? 'Error' : 'Success'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{message}</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRule;
