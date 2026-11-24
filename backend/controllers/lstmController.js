import { trainLSTMModel, predictLSTM } from '../models/LSTMModel.js'; // Import functions from the model file

// Function to train the LSTM model
export const trainModel = async (req, res) => {
  try {
    const { inputs, outputs } = req.body;

    // Validate inputs and outputs
    if (!inputs || !outputs || !Array.isArray(inputs) || !Array.isArray(outputs)) {
      return res.status(400).json({ message: 'Invalid inputs or outputs' });
    }

    // Train the LSTM model with the provided inputs and outputs
    await trainLSTMModel({ inputs, outputs });

    // Return a success message
    res.status(200).json({ message: 'Model trained successfully!' });
  } catch (error) {
    console.error('Error training model:', error);
    res.status(500).json({ message: 'Error training model' });
  }
};

// Function to make a prediction with the trained LSTM model
export const predictSequence = async (req, res) => {
  try {
    const { input } = req.body;

    // Validate input
    if (!input || !Array.isArray(input)) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Predict based on the input sequence
    const prediction = await predictLSTM(input);

    res.status(200).json({ prediction });
  } catch (error) {
    console.error('Error making prediction:', error);
    res.status(500).json({ message: 'Error making prediction' });
  }
};
