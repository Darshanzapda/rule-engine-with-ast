import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './../styles/Sidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const ITEMS_PER_PAGE = 5;

const CombineRules = () => {
  const [rules, setRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [combinedRules, setCombinedRules] = useState([]);
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Control modal visibility
  const [currentRulesPage, setCurrentRulesPage] = useState(1);
  const [currentCombinedPage, setCurrentCombinedPage] = useState(1);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rules/all');
        setRules(response.data);
      } catch (error) {
        setMessage('Error fetching rules');
        setModalVisible(true); // Show modal on error
      }
    };
    fetchRules();
  }, []);

  useEffect(() => {
    const fetchCombinedRules = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rules/combined');
        setCombinedRules(response.data);
      } catch (error) {
        setMessage('Error fetching combined rules');
        setModalVisible(true); // Show modal on error
      }
    };
    fetchCombinedRules();
  }, []);

  const handleSelectRule = (ruleId) => {
    if (selectedRules.includes(ruleId)) {
      setSelectedRules(selectedRules.filter((id) => id !== ruleId));
    } else {
      setSelectedRules([...selectedRules, ruleId]);
    }
  };

  const handleCombineRules = async () => {
    if (selectedRules.length < 2) {
      setMessage('Please select at least two rules to combine.');
      setModalVisible(true); // Show error message in modal
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/rules/combine', {
        ruleIds: selectedRules,
      });

      if (response.data) {
        setCombinedRules([...combinedRules, response.data]);
        setMessage('Rules combined successfully.');
      } else {
        setMessage('No combined rule returned from server.');
      }
      setModalVisible(true); // Show success message in modal
    } catch (error) {
      setMessage('Error combining rules: ' + (error.response?.data?.message || 'Unknown error'));
      setModalVisible(true); // Show error message in modal
    }
  };

  const indexOfLastRule = currentRulesPage * ITEMS_PER_PAGE;
  const indexOfFirstRule = indexOfLastRule - ITEMS_PER_PAGE;
  const currentRules = rules.slice(indexOfFirstRule, indexOfLastRule);
  const totalPagesForRules = Math.ceil(rules.length / ITEMS_PER_PAGE);

  const indexOfLastCombinedRule = currentCombinedPage * ITEMS_PER_PAGE;
  const indexOfFirstCombinedRule = indexOfLastCombinedRule - ITEMS_PER_PAGE;
  const currentCombinedRules = combinedRules.slice(indexOfFirstCombinedRule, indexOfLastCombinedRule);
  const totalPagesForCombined = Math.ceil(combinedRules.length / ITEMS_PER_PAGE);

  const handleRulesPageChange = (pageNumber) => {
    setCurrentRulesPage(pageNumber);
  };

  const handleCombinedPageChange = (pageNumber) => {
    setCurrentCombinedPage(pageNumber);
  };

  const getFilledRules = () => {
    const filledRules = [...currentRules];
    const emptyRowsCount = ITEMS_PER_PAGE - filledRules.length;
    for (let i = 0; i < emptyRowsCount; i++) {
      filledRules.push({ _id: '', ruleNumber: '' });
    }
    return filledRules;
  };

  const getFilledCombinedRules = () => {
    const filledCombinedRules = [...currentCombinedRules];
    const emptyRowsCount = ITEMS_PER_PAGE - filledCombinedRules.length;
    for (let i = 0; i < emptyRowsCount; i++) {
      filledCombinedRules.push({ _id: '', ruleString: '' });
    }
    return filledCombinedRules;
  };

  return (
    <div className="container mt-0"> {/* Removed top margin */}
      <h3>Combine Rules</h3>

      {/* Modal for success/error messages */}
      {modalVisible && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Message</h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <p>{message}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h4 className="text-center mt-4">Select Rules to Combine:</h4>
      {rules.length === 0 ? (
        <p>No rules available</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Rule ID</th>
                  <th>Rule Name</th>
                </tr>
              </thead>
              <tbody>
                {getFilledRules().map((rule, index) => (
                  <tr key={rule._id || index}>
                    {rule._id ? (
                      <>
                        <td>
                          <input
                            type="checkbox"
                            value={rule._id}
                            onChange={() => handleSelectRule(rule._id)}
                          />
                        </td>
                        <td>{rule._id}</td>
                        <td>{`Rule ${rule.ruleNumber}`}</td>
                      </>
                    ) : (
                      <>
                        <td></td>
                        <td></td>
                        <td></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Rules */}
          <div className="d-flex justify-content-center my-3">
            <button
              onClick={() => handleRulesPageChange(currentRulesPage - 1)}
              className="btn btn-outline-secondary"
              disabled={currentRulesPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPagesForRules }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handleRulesPageChange(index + 1)}
                className={`btn mx-1 ${currentRulesPage === index + 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handleRulesPageChange(currentRulesPage + 1)}
              className="btn btn-outline-secondary"
              disabled={currentRulesPage === totalPagesForRules}
            >
              Next
            </button>
          </div>

          {/* Space between Pagination and Combine Button */}
          <div className="d-flex justify-content-center mb-3">
            <button onClick={handleCombineRules} className="btn btn-primary"> {/* Changed button to blue and smaller */}
              Combine Selected Rules
            </button>
          </div>
        </>
      )}

      <h4 className="text-center mt-4">Combined Rules:</h4>

      {combinedRules.length === 0 ? (
        <p>No combined rules available</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Combined Rule String</th>
                </tr>
              </thead>
              <tbody>
                {getFilledCombinedRules().map((rule, index) => (
                  <tr key={rule._id || index}>
                    {rule._id ? (
                      <>
                        <td>{rule._id}</td>
                        <td>{rule.ruleString}</td>
                      </>
                    ) : (
                      <>
                        <td></td>
                        <td></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Combined Rules */}
          <div className="d-flex justify-content-center my-3">
            <button
              onClick={() => handleCombinedPageChange(currentCombinedPage - 1)}
              className="btn btn-outline-secondary"
              disabled={currentCombinedPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPagesForCombined }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handleCombinedPageChange(index + 1)}
                className={`btn mx-1 ${currentCombinedPage === index + 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handleCombinedPageChange(currentCombinedPage + 1)}
              className="btn btn-outline-secondary"
              disabled={currentCombinedPage === totalPagesForCombined}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CombineRules;
