// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OracleManager.sol";

contract ResultValidator {
    // Reference to the OracleManager contract
    OracleManager public oracleManager;

    // Struct to store individual prediction details
    struct Prediction {
        address provider; // Address of the ML worker
        bytes data;       // Actual prediction data
        uint256 timestamp; // Timestamp of submission
    }

    // Mapping from requestId to an array of Prediction structs
    mapping(uint256 => Prediction[]) public submittedPredictions;

    // Event emitted when a prediction is submitted
    event PredictionSubmitted(
        uint256 indexed requestId,
        address indexed provider,
        bytes predictionData
    );

    /**
     * @dev Constructor that initializes the OracleManager address.
     * @param _oracleManagerAddress The address of the OracleManager contract.
     */
    constructor(address _oracleManagerAddress) {
        require(_oracleManagerAddress != address(0), "OracleManager address cannot be zero");
        oracleManager = OracleManager(_oracleManagerAddress);
    }

    /**
     * @dev Allows a registered and staked provider to submit a prediction.
     * @param requestId The ID of the request being fulfilled.
     * @param predictionData The prediction data.
     */
    function submitPrediction(uint256 requestId, bytes calldata predictionData) public {
        // Check if the sender is a registered and staked provider
        // Assumes getProviderStake > 0 means they are active and staked.
        // OracleManager's stake() function requires registration, so this check is sufficient.
        require(oracleManager.getProviderStake(msg.sender) > 0, "Provider not registered or not staked");

        // Store the prediction
        submittedPredictions[requestId].push(Prediction({
            provider: msg.sender,
            data: predictionData,
            timestamp: block.timestamp
        }));

        emit PredictionSubmitted(requestId, msg.sender, predictionData);
    }

    /**
     * @dev Retrieves all submitted predictions for a given request ID.
     * @param requestId The ID of the request.
     * @return An array of Prediction structs.
     */
    function getPredictionsForRequest(uint256 requestId) public view returns (Prediction[] memory) {
        return submittedPredictions[requestId];
    }
}
