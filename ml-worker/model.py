import torch
import torch.nn as nn
import torch.optim as optim
import os

# 1. Simple Model Class
class SimpleModel(nn.Module):
    def __init__(self, input_features=10, output_features=1):
        super(SimpleModel, self).__init__()
        self.linear = nn.Linear(input_features, output_features)

    def forward(self, x):
        return torch.sigmoid(self.linear(x))

# 2. Train Model Function
def train_model(model, dummy_data, dummy_labels, epochs=10):
    """
    Performs a mock training loop for the given model.
    """
    criterion = nn.BCELoss()  # Binary Cross Entropy Loss for binary classification
    optimizer = optim.SGD(model.parameters(), lr=0.01) # Stochastic Gradient Descent

    print(f"Starting training for {epochs} epochs...")
    for epoch in range(epochs):
        model.train() # Set the model to training mode

        # Forward pass
        outputs = model(dummy_data)
        loss = criterion(outputs, dummy_labels)

        # Backward pass and optimization
        optimizer.zero_grad() # Clear previous gradients
        loss.backward()       # Compute gradients
        optimizer.step()      # Update weights

        if (epoch + 1) % 2 == 0:
            print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')

    print("Training completed.")

# 3. Save Model Function
def save_model(model, path="ml-worker/simple_model.pth"):
    """
    Saves the model's state dictionary to the specified path.
    """
    # Ensure the directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(model.state_dict(), path)
    print(f"Model saved to {path}")

# 4. Main Execution Block
if __name__ == "__main__":
    # Define model parameters
    INPUT_FEATURES = 10
    OUTPUT_FEATURES = 1
    NUM_SAMPLES = 100

    # Instantiate the model
    model = SimpleModel(input_features=INPUT_FEATURES, output_features=OUTPUT_FEATURES)
    print("SimpleModel instantiated.")

    # Create dummy input data and labels
    # Data: 100 samples, 10 features each
    dummy_data = torch.randn(NUM_SAMPLES, INPUT_FEATURES)
    # Labels: 100 samples, 1 binary label each (0 or 1)
    dummy_labels = torch.randint(0, 2, (NUM_SAMPLES, OUTPUT_FEATURES)).float()
    print("Dummy data and labels created.")

    # Train the model
    train_model(model, dummy_data, dummy_labels, epochs=10)

    # Save the model
    model_path = "ml-worker/simple_model.pth"
    save_model(model, path=model_path)

    # Verify saved model by loading it (optional)
    loaded_model = SimpleModel(input_features=INPUT_FEATURES, output_features=OUTPUT_FEATURES)
    loaded_model.load_state_dict(torch.load(model_path))
    loaded_model.eval() # Set to evaluation mode
    print(f"Model loaded from {model_path} and set to evaluation mode.")

    # Example prediction with the loaded model (optional)
    # with torch.no_grad(): # Disable gradient calculations for inference
    #     sample_input = torch.randn(1, INPUT_FEATURES)
    #     prediction = loaded_model(sample_input)
    #     print(f"Example prediction for random input: {prediction.item()}")
