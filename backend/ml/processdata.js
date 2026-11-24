import * as tf from '@tensorflow/tfjs-node';

/**
 * Prepare data for LSTM input.
 * @param {Array} data Input data (e.g., patient records).
 * @param {Number} sequenceLength Length of sequences.
 * @returns {Object} Processed tensors for input and output.
 */
export const preprocessData = (data, sequenceLength) => {
  const sequences = [];
  const labels = [];

  for (let i = 0; i < data.length - sequenceLength; i++) {
    const sequence = data.slice(i, i + sequenceLength).map((record) => [
      record.diseaseSeverity, // Example numerical feature
    ]);
    const label = data[i + sequenceLength].alert; // Example binary label
    sequences.push(sequence);
    labels.push(label);
  }

  const inputTensor = tf.tensor3d(sequences);
  const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

  return { inputTensor, labelTensor };
};
