import torch
from model import SimpleModel # Assuming model.py is in the same directory or accessible via PYTHONPATH
import os # For checking file existence

# 1. Load Model Function
def load_model(model_path="ml-worker/simple_model.pth", model_class=SimpleModel, input_features=10, output_features=1):
    """
    Loads a pre-trained model from the specified path.
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please train and save the model first.")

    model = model_class(input_features=input_features, output_features=output_features)
    model.load_state_dict(torch.load(model_path))
    model.eval() # Set the model to evaluation mode
    print(f"Model loaded from {model_path} and set to evaluation mode.")
    return model

# 2. Make Prediction Function
def make_prediction(model, input_data_tensor):
    """
    Makes a prediction using the loaded model and input data tensor.
    """
    model.eval() # Ensure model is in evaluation mode
    with torch.no_grad(): # Disable gradient calculations for inference
        output = model(input_data_tensor)
    return output

# 3. Main Execution Block
if __name__ == "__main__":
    MODEL_PATH = "ml-worker/simple_model.pth"
    INPUT_FEATURES = 10 # Must match the SimpleModel's input_features

    try:
        # Load the trained model
        trained_model = load_model(model_path=MODEL_PATH, input_features=INPUT_FEATURES)

        # Create sample input data (e.g., for a single prediction)
        # Dimensions should match the model's expected input: [batch_size, num_features]
        sample_input = torch.randn(1, INPUT_FEATURES)
        print(f"\nSample Input (Tensor with shape {sample_input.shape}):\n{sample_input}")

        # Make a prediction
        prediction_output = make_prediction(trained_model, sample_input)

        # The output is a sigmoid, so it's a probability (between 0 and 1)
        # For a binary classification, you might threshold it (e.g., > 0.5 means class 1)
        predicted_probability = prediction_output.item()
        predicted_class = 1 if predicted_probability > 0.5 else 0

        print(f"\nPrediction Output (Raw Sigmoid):\n{predicted_probability:.4f}")
        print(f"Predicted Class (threshold 0.5):\n{predicted_class}")

    except FileNotFoundError as e:
        print(e)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
