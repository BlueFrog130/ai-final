const brain = require("brain.js");

window.makeNeuralNet = function() {
    return new brain.default.NeuralNetworkGPU();
}