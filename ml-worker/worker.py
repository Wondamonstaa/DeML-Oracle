import time
import torch
import os # For checking file existence, though load_model also does it.

# Attempt to import from local files
try:
    from model import SimpleModel # For model class reference
    from predict import load_model, make_prediction
except ImportError:
    print("Error: Could not import SimpleModel, load_model, or make_prediction.")
    print("Ensure model.py and predict.py are in the same directory or accessible via PYTHONPATH.")
    exit(1)

# 1. Placeholder/Configuration Variables
MODEL_PATH = "ml-worker/simple_model.pth"
INPUT_FEATURES = 10  # Must match the SimpleModel's input_features
OUTPUT_FEATURES = 1 # Must match the SimpleModel's output_features

# Simulated blockchain interaction details
RPC_URL = "http://localhost:8545"  # Simulated Ethereum node RPC URL
REQUEST_BRIDGE_ADDRESS = "0x SimulatedRequestBridgeAddress"
RESULT_VALIDATOR_ADDRESS = "0x SimulatedResultValidatorAddress"
WORKER_PRIVATE_KEY = "0x SimulatedWorkerPrivateKey" # For signing transactions

# Global request ID counter for mock requests
MOCK_REQUEST_ID_COUNTER = 0

# 2. Listen for Requests Function
def listen_for_requests():
    """
    Simulates listening for PredictionRequested events from the RequestBridge contract.
    Returns a list of mock request events.
    """
    global MOCK_REQUEST_ID_COUNTER
    print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Listening for prediction requests on {REQUEST_BRIDGE_ADDRESS} via {RPC_URL}...")
    # Simulate network delay and potential for new requests
    time.sleep(2)

    # Mock: Simulate finding one new request every other time it's called
    if MOCK_REQUEST_ID_COUNTER % 3 == 0:
        MOCK_REQUEST_ID_COUNTER += 1
        # Simulate varied input data (though we'll generate random tensor later)
        mock_input_data_hex = torch.randn(1, INPUT_FEATURES).numpy().tobytes().hex()
        request_event = {
            'requestId': MOCK_REQUEST_ID_COUNTER,
            'modelId': 0, # Assuming a single model for now
            'inputData': mock_input_data_hex, # Hex-encoded bytes
            'requestor': '0x SimulatedRequestorAddress'
        }
        print(f"Found 1 new request: ID {request_event['requestId']}")
        return [request_event]
    else:
        MOCK_REQUEST_ID_COUNTER += 1
        print("No new requests found this cycle.")
        return []

# 3. Process Request Function
def process_request(request_event, model):
    """
    Processes a single prediction request.
    """
    request_id = request_event['requestId']
    model_id = request_event['modelId'] # Could be used for model selection
    input_data_hex = request_event['inputData']

    print(f"Processing request ID: {request_id}, Model ID: {model_id}")

    # Simulate decoding/preparing inputData for the model
    # For SimpleModel, input is torch.randn(1, INPUT_FEATURES)
    # Here, we just generate fresh random data as a placeholder for actual decoding.
    # In a real scenario, input_data_hex would be decoded into a tensor.
    try:
        # Example: If input_data_hex was actual tensor bytes, one might do:
        # input_bytes = bytes.fromhex(input_data_hex)
        # loaded_tensor = torch.tensor(np.frombuffer(input_bytes, dtype=np.float32).reshape(1, INPUT_FEATURES))
        # For now, let's use fresh random data for simplicity
        dummy_tensor_data = torch.randn(1, INPUT_FEATURES)
        print(f"  Simulated input tensor for request {request_id}:\n{dummy_tensor_data}")
    except Exception as e:
        print(f"  Error preparing input data for request {request_id}: {e}")
        return None

    # Make prediction
    prediction_output_tensor = make_prediction(model, dummy_tensor_data)
    prediction_probability = prediction_output_tensor.item() # Get scalar value
    print(f"  Raw prediction (probability) for request {request_id}: {prediction_probability:.4f}")

    # Format prediction for submission (e.g., as bytes of the string representation)
    # This would depend on what ResultValidator.sol expects
    prediction_data_for_chain = str(prediction_probability).encode('utf-8')
    return prediction_data_for_chain

# 4. Submit Prediction to Chain Function
def submit_prediction_to_chain(request_id, prediction_data, worker_address):
    """
    Simulates submitting the prediction to the ResultValidator contract.
    """
    # In a real scenario, this would involve:
    # 1. Connecting to an Ethereum node (web3.py Web3(HTTPProvider(RPC_URL)))
    # 2. Loading the ResultValidator contract ABI and address
    # 3. Building the transaction (to call submitPrediction(requestId, predictionData))
    # 4. Signing the transaction with WORKER_PRIVATE_KEY
    # 5. Sending the transaction and waiting for receipt

    print(f"  Submitting prediction for request ID {request_id}...")
    print(f"    Worker: {worker_address}")
    print(f"    Contract: {RESULT_VALIDATOR_ADDRESS}")
    print(f"    Function: submitPrediction({request_id}, {prediction_data.decode()})")
    print(f"    Simulated Tx Hash: 0x{torch.randint(0, 2**32, (1,)).item():08x}{torch.randint(0, 2**32, (1,)).item():08x}...")
    # Simulate network delay for submission
    time.sleep(1)
    print(f"  Prediction for request ID {request_id} successfully submitted (simulated).")


# 5. Main Loop
if __name__ == "__main__":
    print("Starting ML Worker...")

    # Simulate worker's Ethereum address (derived from private key in a real scenario)
    # For simulation, we can just use a placeholder.
    # In a real web3 setup, you'd derive this from WORKER_PRIVATE_KEY.
    worker_wallet_address = "0x SimulatedWorkerWalletAddress"
    print(f"Worker Wallet Address (simulated): {worker_wallet_address}")


    # Load the ML model
    try:
        print(f"Loading model from {MODEL_PATH}...")
        # Ensure correct parameters for SimpleModel are passed if not default
        ml_model = load_model(
            model_path=MODEL_PATH,
            model_class=SimpleModel,
            input_features=INPUT_FEATURES,
            output_features=OUTPUT_FEATURES
        )
        print("Model loaded successfully.")
    except FileNotFoundError as e:
        print(f"ERROR: Model file not found at {MODEL_PATH}. Please train and save the model using model.py first.")
        print("Worker cannot start without the model. Exiting.")
        exit(1)
    except Exception as e:
        print(f"An unexpected error occurred while loading the model: {e}")
        print("Worker cannot start. Exiting.")
        exit(1)

    # Main worker loop
    try:
        while True:
            requests = listen_for_requests()

            if requests:
                for req_event in requests:
                    prediction_result_bytes = process_request(req_event, ml_model)
                    if prediction_result_bytes is not None:
                        submit_prediction_to_chain(req_event['requestId'], prediction_result_bytes, worker_wallet_address)
            else:
                # No new requests, wait before polling again
                pass

            print(f"Waiting for {10} seconds before next poll...")
            time.sleep(10) # Polling interval

    except KeyboardInterrupt:
        print("\nML Worker stopped by user (Ctrl+C).")
    except Exception as e:
        print(f"\nAn unexpected error occurred in the main loop: {e}")
    finally:
        print("ML Worker shutting down.")
