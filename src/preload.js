const brain = require("brain.js");

window.makeNeuralNet = function() {
    return new brain.default.NeuralNetworkGPU();
}

window.visualizeNeuralNet = function(net) {
    return brain.default.utilities.toSVG(net);
}