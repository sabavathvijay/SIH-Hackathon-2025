// PASTE YOUR MODEL LINK BACK IN HERE!
const URL = "https://teachablemachine.withgoogle.com/models/S84arzio_/"; 

let model, webcam, labelContainer, maxPredictions;

// This p5.js function runs once when the page loads
async function setup() {
    let canvas = createCanvas(400, 400); // Creates the "canvas" for the video
    canvas.parent('webcam-container'); // Puts the canvas into our HTML div

    // Load the model
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup webcam
    const flip = true; // Flips the webcam (more natural)
    webcam = new tmImage.Webcam(400, 400, flip); 
    await webcam.setup(); // Request webcam access
    await webcam.play();
    
    // RENAMED 'loop' to 'updatePredictionLoop' to fix console warning
    window.requestAnimationFrame(updatePredictionLoop); 

    // Get the HTML element to show the labels
    labelContainer = document.getElementById('label-container');
    labelContainer.innerHTML = "Thinking...";
    labelContainer.classList.add('waiting');
}

// RENAMED 'loop' to 'updatePredictionLoop'
// This function runs over and over (like a game loop)
async function updatePredictionLoop() {
    webcam.update(); // Update the webcam frame
    await predict(); // Make a prediction
    window.requestAnimationFrame(updatePredictionLoop);
}

// p5.js draw function (needed for the canvas)
// This runs automatically by p5.js
function draw() {
    // Draw the video to the canvas
    // Check if webcam is initialized before drawing
    if (webcam) {
        image(webcam.canvas, 0, 0);
    }
}

// The main prediction function
async function predict() {
    // Predict based on the current webcam frame
    const prediction = await model.predict(webcam.canvas);
    
    // Find the prediction with the highest probability
    let bestPrediction = "";
    let bestProbability = 0.0;
    
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > bestProbability) {
            bestProbability = prediction[i].probability;
            bestPrediction = prediction[i].className;
        }
    }

    // Update the label text and style
    if (bestPrediction.includes("Recycle")) {
        labelContainer.innerHTML = "RECYCLE ♻️";
        updateStyle("recycle");
    } else if (bestPrediction.includes("Compost")) {
        labelContainer.innerHTML = "COMPOST 🍎";
        updateStyle("compost");
    } else if (bestPrediction.includes("Landfill")) {
        labelContainer.innerHTML = "LANDFILL 🗑️";
        updateStyle("landfill");
    } else {
        labelContainer.innerHTML = "Thinking...";
        updateStyle("waiting");
    }
}

// Helper function to change the CSS style
function updateStyle(newClass) {
    labelContainer.classList.remove('recycle', 'compost', 'landfill', 'waiting');
    labelContainer.classList.add(newClass);
}