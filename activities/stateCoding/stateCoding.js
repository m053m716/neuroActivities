const BaselineTrials = 5;
const PerturbationTrials = 10;
const WashoutTrials = 5;
const Rotation = 30; // degrees
const TargetRingRadius = 200; // pixels
const TargetSize = 20; // pixels
const BoxRadius = 250;

// Create global state and data variables
var state = initState()
var data = initData()
const modeButton = document.getElementById("modeButton");
const context = document.getElementById('2d');

// Returns initial state data.
function initState() {
  return {
    running: false,
    taskMode: document.getElementById("modeButton").innerText, 
    taskState: null,
    trialType: null,
    numTrials: 0,
    trialStart: null,
    canvas: document.getElementById("taskCanvas"),
    figure: document.getElementById('figure')
  };
}

// Returns initial data structure for stored data.
function initData() {
  return {
    trialNum: [],
    trialPhase:[], 
    trialType: [],
    time: [],
    cursorX: [],
    cursorY: [],
    handX: [],
    handY:[]
    // For plotting
  };
}

function initTrial() {
  // initialize data and cursor position for this trial.
  var trialData;
  if (state.taskMode == "Cartesian") {
    trialData = {
      x: BoxRadius, 
      y: BoxRadius, 
    }

  } else { // "Polar"
    trialData = {

    }
  }

  // initialize

  return trialData
}

// Does the reset
async function resetData() {
  state.taskState = null;
  state.trialType = null;
  state.numTrials = 0;
  state.trialStart = null;
  data = initData()
  document.getElementById("saveButton").style.visibility = "hidden";
  Plotly.newPlot( state.figure, [{
    x: [], 
    y: [],
    }],
    {
      xaxis: {
        title: "X Position", 
        range: [0, 600]
      },
      yaxis: {
        title: "Y Position", 
        range: [0, 500]
      },
    }
  );
  baseGraphics();
  if (state.running) {
    state.running = false;
    await sleep(500);
    newTrial();
  }
}

// Start the "recording" session.
function startSession() {
  resetData();
  modeButton.disabled = true;
  state.canvas.style.cursor = 'none';
  state.running = true;
  newTrial();
}

async function newTrial() {
  
  if (state.numTrials > BaselineTrials + PerturbationTrials + WashoutTrials) {
    endSession();
  }
  
  // Determine trial type
  if (state.numTrials < BaselineTrials) {
    state.trialType = "baseline";
  }
  else if (state.numTrials < BaselineTrials + PerturbationTrials) {
    state.trialType = "vmr";
  }
  else {
    state.trialType = "washout";
  }

  // Start trial
  state.running = true;
  state.taskState = "startTarget";
  let d = new Date();
  state.trialStart = d.getTime();
}

// Sleep helper function 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Collect data helper function -- append data to arrays for each timestep
function appendData(handX, handY, cursorX, cursorY) {
  data.trialNum.push(state.numTrials);
  data.trialPhase.push(state.taskState);
  data.trialType.push(state.trialType);
  let d = new Date();
  data.time.push(d.getTime() - state.trialStart);
  data.cursorX.push(cursorX);
  data.cursorY.push(cursorY);
  data.handX.push(handX);
  data.handY.push(handY);
}

// Base Graphics
function baseGraphics() {
  context.width = 2*BoxRadius
  context.height = 2*BoxRadius

  // Background
  context.fillStyle = "gainsboro";
  context.fillRect(0, 0, state.canvas.width, state.canvas.height);
  
  // Start 
  context.beginPath();
  context.arc(state.canvas.width-BoxRadius, state.canvas.height-BoxRadius, TargetSize/2, 0, 2*Math.PI);
  context.fillStyle = "gray";
  context.fill();
  context.linewidth = 0;
  context.stroke();
  
  // Target
  var cx, cy, ctheta
  for (i = 0; i < 8; i++) {
    ctheta = i * Math.PI/4;
    cx = BoxRadius + TargetRingRadius*Math.cos(ctheta);
    cy = BoxRadius + TargetRingRadius*Math.sin(ctheta);
    drawCircle(context, cx, cy, TargetSize);
  }
}

// Draw a circle with radius r on the canvas context at <x,y> 
function drawCircle(context, x, y, r, c = "gray") {
  context.beginPath();
  context.arc(x, y, r, 0, 2*Math.PI);
  context.fillStyle = c;
  context.fill();
  context.linewidth = 0;
  context.stroke();
}

// Mouse move handler 
state.canvas.onmousemove = function(e) {
  if (state.running == false) {
    return;
  }
  baseGraphics();
  if (state.taskState != "runTrial") {
    context.beginPath();
    context.arc(e.offsetX, e.offsetY, 5, 0, 2*Math.PI);
    context.fillStyle = "gold";
    context.fill();
    context.linewidth = 1;
    context.stroke;
    
    //appendData(e.offsetX, e.offsetY, e.offsetX, e.offsetY);
  }
  
  if (startCheck(e.offsetX, e.offsetY) === true) {
      state.taskState = "runTrial";
  }
  
  runTrial(e.offsetX, e.offsetY);
  
}

// Check if mouse is in start target for 0.5s 
function startCheck(posX, posY) {
  let radius = Math.sqrt(Math.pow((state.canvas.height-25) - posY, 2) +
                Math.pow(posX - state.canvas.width/2, 2));
  if (radius < 20) {
    return true;
  }
  return false;
}

// Check if the cursor has entered the target.
function targetCheck(posX, posY) {
  let radius = Math.sqrt(Math.pow(25 - posY, 2) +
                Math.pow(posX - state.canvas.width/2, 2));
  if (radius < 20) {
    return true;
  }
  return false;
}

// Run the trial
function runTrial(posX, posY) {
  if (state.taskState != "runTrial") {
    return;
  }
  let xPos;
  let yPos;
  if (state.trialType === "vmr") {
    let radius = Math.sqrt(Math.pow((state.canvas.height-25) - posY, 2) +
                Math.pow(posX - state.canvas.width/2, 2))
    let theta = Math.atan2((state.canvas.height-25)-posY, posX - state.canvas.width / 2);
    if (Math.abs(posX - state.canvas.width/2) <= 0.0001) {
      theta = Math.PI/2;
    }
    let thetaShift = theta - (Rotation * Math.PI/180);
    xPos = radius * Math.cos(thetaShift) + state.canvas.width/2;
    yPos = (state.canvas.height-25) - (radius * Math.sin(thetaShift));
  }
  else {
    xPos = posX;
    yPos = posY;
  }
  context.beginPath();
  context.arc(xPos, yPos, 5, 0, 2*Math.PI);
  context.fillStyle = "dodgerblue";
  context.fill();
  context.linewidth = 1;
  context.stroke;
  
  appendData(posX, posY, xPos, yPos);
  
  if (targetCheck(xPos, yPos) === true) {
    state.taskState = "completedTrial";
    appendData(posX, posY, xPos, yPos);
    endTrial();
  }
}

// End the current trial by updating state parameters.
async function endTrial() {
  baseGraphics();
  plotData();
  state.running = false;
  state.numTrials += 1;
  await sleep(500);
  newTrial();
}

// Show data on the plot at the right-hand side of interface.
function plotData() {
  let startIdx = data.trialNum.indexOf(state.numTrials);
  let endIdx = data.trialNum.lastIndexOf(state.numTrials);
  let trialX = data.cursorX.slice(startIdx, endIdx);
  let trialY = data.cursorY.slice(startIdx, endIdx);
  let plotColor;
  let opacity;
  if (state.trialType === "baseline") {
    plotColor = 'black';
    plotName = "BL".concat(state.numTrials.toString());
  }
  else if (state.trialType === "vmr") {
    plotColor = 'blue';
    opacity = (state.numTrials - BaselineTrials)/PerturbationTrials;
    plotName = "VMR".concat(state.numTrials-BaselineTrials.toString());
  }
  else if (state.trialType === "washout") {
    plotColor = 'pink';
    opacity = (state.numTrials - PerturbationTrials)/WashoutTrials;
    plotName = "WO".concat(state.numTrials-PerturbationTrials.toString());
  }
  console.log(opacity);
  Plotly.plot(figure,  [{
    x: trialX,
    y: trialY,
    opacity: opacity,
    name: plotName,
    line: {
      color: plotColor,
    }
    }],
    {
      xaxis: {
        title: "X Position", 
        range: [0, 600]
      },
      yaxis: {
        title: "Y Position", 
        range: [0, 500]
      },
    }
  );
}

// End the "recording" session (no more trials)
function endSession() {
  state.taskState = "done";
  modeButton.disabled = false;
  document.getElementById("saveButton").style.visibility = "visible";
  state = initState(); // reset the state
}

// Save data to a csv file
function saveData() {
  var rows = [["trialNum", "trialPhase", "trialType", "time",
                "cursorX", "cursorY", "handX", "handY"]];
  for (let i=0; i < data.trialNum.length; i++) {
    let trialData = [data.trialNum[i], data.trialPhase[i], data.trialType[i],
                      data.time[i], data.cursorX[i], data.cursorY[i],
                      data.handX[i], data.handY[i]]; 
    rows.push(trialData);
  }
  let csvContent = "data:text/csv;charset=utf-8,"; 
  rows.forEach(function(rowArray) {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });
  var encodedURI = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedURI);
  link.setAttribute("download", "vmr_data.csv");
  document.body.appendChild(link);
  link.click();
}

// Toggle name and class of button
function toggleMode() {
  var label = modeButton.innerText;
  if (label == "Cartesian") {
    modeButton.innerText = "Polar"
    modeButton.classList = "btn btn-secondary"
  } else if (label == "Polar") {
    modeButton.innerText = "Cartesian"
    modeButton.classList = "btn btn-primary"
  } else {
    throw "Label should only match either 'Cartesian' or 'Polar'!"
  }
}