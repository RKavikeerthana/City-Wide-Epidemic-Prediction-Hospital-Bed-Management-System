
import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import { fileURLToPath } from 'url';

// Always use <backend>/lstm-model,
// regardless of which folder Node.js is started from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = path.resolve(__dirname, '..', 'lstm-model');


// ----------------------------------------
// 1. Create and compile the LSTM model
// ----------------------------------------

export const createLSTMModel = () => {
  const model = tf.sequential();

  model.add(
    tf.layers.lstm({
      units: 50,
      inputShape: [10, 1],
      kernelInitializer: 'glorotUniform',
      recurrentInitializer: 'glorotUniform',
      returnSequences: false,
    })
  );

  model.add(
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    })
  );

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
  });

  return model;
};


// ----------------------------------------
// 2. Train the LSTM model
// ----------------------------------------

export const trainLSTMModel = async (data) => {
  const model = createLSTMModel();

  // Validate training data
  if (
    !data ||
    !Array.isArray(data.inputs) ||
    !Array.isArray(data.outputs) ||
    data.inputs.length === 0 ||
    data.inputs.length !== data.outputs.length
  ) {
    throw new Error('Invalid training data.');
  }

  // Check that every input contains exactly 10 numeric values
  const validInputs = data.inputs.every(
    (sequence) =>
      Array.isArray(sequence) &&
      sequence.length === 10 &&
      sequence.every(
        (value) =>
          typeof value === 'number' &&
          Number.isFinite(value)
      )
  );

  // Check output values
  const validOutputs = data.outputs.every(
    (value) =>
      typeof value === 'number' &&
      Number.isFinite(value)
  );

  if (!validInputs || !validOutputs) {
    throw new Error(
      'Each input must contain 10 numeric values, and outputs must be numeric.'
    );
  }

  // Convert 2D input into 3D format:
  // [samples, time steps, features]
  const formattedInputs = data.inputs.map((sequence) =>
    sequence.map((value) => [value])
  );

  // Convert outputs into 2D format
  const formattedOutputs = data.outputs.map((value) => [value]);

  const xs = tf.tensor3d(formattedInputs);
  const ys = tf.tensor2d(formattedOutputs);

  try {
    console.log('Starting model training...');

    const epochs =
      Number.isInteger(data.epochs) && data.epochs > 0 ? data.epochs : 10;

    await model.fit(xs, ys, {
      epochs,
      verbose: 0,
    });

    console.log('Model training completed.');

    // Save the trained model
    const savePath = MODEL_DIR.split(path.sep).join('/');

    await model.save(`file://${savePath}`);

    console.log('Model saved at:', savePath);

  } catch (error) {
    console.error('Error during training:', error);
    throw error;

  } finally {
    xs.dispose();
    ys.dispose();
  }

  return model;
};


// ----------------------------------------
// 3. Load the trained LSTM model
// ----------------------------------------

export const loadLSTMModel = async () => {
  try {
    const loadPath = path
      .join(MODEL_DIR, 'model.json')
      .split(path.sep)
      .join('/');

    const model = await tf.loadLayersModel(`file://${loadPath}`);

    console.log('Model loaded successfully.');

    return model;

  } catch (error) {
    console.error('Error loading model:', error);

    return null;
  }
};


// ----------------------------------------
// 4. Make predictions using the LSTM model
// ----------------------------------------

export const predictLSTM = async (sequence) => {

  // Validate prediction input
  if (
    !Array.isArray(sequence) ||
    sequence.length !== 10 ||
    !sequence.every(
      (value) =>
        typeof value === 'number' &&
        Number.isFinite(value)
    )
  ) {
    throw new Error(
      'Input sequence must contain exactly 10 numeric values.'
    );
  }

  // Load the trained model
  const model = await loadLSTMModel();

  if (!model) {
    throw new Error(
      'Model not loaded. Train the model first.'
    );
  }

  // Convert input into 3D format:
  // [1 sample, 10 time steps, 1 feature]
  const input = tf.tensor3d(
    [sequence.map((value) => [value])],
    [1, 10, 1]
  );

  try {
    console.log('Making prediction...');

    const prediction = model.predict(input);

    const predictionData = prediction.dataSync();

    console.log('Prediction result:', predictionData);

    prediction.dispose();

    return Array.from(predictionData);

  } catch (error) {
    console.error('Error during prediction:', error);

    throw error;

  } finally {
    input.dispose();
  }
};

// ----------------------------------------
// 5. Predict many sequences with one model load
// ----------------------------------------

export const predictLSTMBatch = async (sequences) => {
  const valid =
    Array.isArray(sequences) &&
    sequences.length > 0 &&
    sequences.every(
      (seq) =>
        Array.isArray(seq) &&
        seq.length === 10 &&
        seq.every((v) => typeof v === 'number' && Number.isFinite(v))
    );

  if (!valid) {
    throw new Error('Each sequence must contain exactly 10 numeric values.');
  }

  const model = await loadLSTMModel();
  if (!model) {
    throw new Error('Model not loaded. Train the model first.');
  }

  const input = tf.tensor3d(
    sequences.map((seq) => seq.map((v) => [v])),
    [sequences.length, 10, 1]
  );

  try {
    const prediction = model.predict(input);
    const values = Array.from(prediction.dataSync());
    prediction.dispose();
    return values;
  } finally {
    input.dispose();
    model.dispose();
  }
};
