// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RequestBridge {
    // Counter to generate unique request IDs
    uint256 public nextRequestId = 1;

    // Struct to store request details (optional, but good practice)
    struct PredictionRequest {
        address requestor;
        uint256 modelId;
        bytes inputData;
        // bool fulfilled; // Example for future expansion
        // bytes result;   // Example for future expansion
    }

    // Event emitted when a prediction request is made
    event PredictionRequested(
        uint256 indexed requestId,
        address indexed requestor,
        uint256 modelId,
        bytes inputData
    );

    // Mapping to store requests (optional, can be added if needed for on-chain tracking beyond events)
    // mapping(uint256 => PredictionRequest) public requests;

    /**
     * @dev Allows users or other contracts to request a prediction.
     * @param inputData The data to be fed into the ML model.
     * @param modelId An identifier for the specific ML model to be used.
     * @return requestId The unique ID of the prediction request.
     */
    function requestPrediction(bytes calldata inputData, uint256 modelId) public returns (uint256) {
        uint256 currentRequestId = nextRequestId;

        // Store the request details (optional, can be uncommented if needed)
        // requests[currentRequestId] = PredictionRequest({
        //     requestor: msg.sender,
        //     modelId: modelId,
        //     inputData: inputData
        // });

        emit PredictionRequested(currentRequestId, msg.sender, modelId, inputData);

        nextRequestId++;
        return currentRequestId;
    }
}
