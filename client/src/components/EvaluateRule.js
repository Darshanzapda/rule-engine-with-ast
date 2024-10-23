import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Evaluate = () => {
  const [criteria, setCriteria] = useState('');
  const [result, setResult] = useState(null);

  const handleEvaluate = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/rules/evaluate_rule', { data: criteria });
      setResult(response.data.result);
    } catch (error) {
      setResult("Error evaluating the rule: " + error.message);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '0px' }}>
      <div className="row">
        <div className="col-md-8">  {/* Makes the width of the content narrower */}
          <h3 className="mb-4">Evaluate Rules</h3>
          <div className="mb-3" style={{ width: '152%' }}>
            <input 
              type="text" 
              className="form-control" 
              value={criteria} 
              onChange={(e) => setCriteria(e.target.value)} 
              placeholder="Enter evaluation criteria (JSON format)" 
            />
          </div>
          <button className="btn btn-primary mb-4" onClick={handleEvaluate}>Evaluate</button>
          <div>
            <h4>Evaluation Result:</h4>
            <div className="alert alert-info" style={{ width: '152%' }}>
              {result !== null ? (
                result === true ? "User meets the criteria." : "User does not meet the criteria."
              ) : (
                "No results available."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluate;
