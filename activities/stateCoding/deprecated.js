// const keys = [];

// Key press handlers
// document.addEventListener('keyup', removeKey);
// document.addEventListener('keydown', handleKeys);

// // Initialize starting conditions for this trial
// var trialData = initTrial();

// // Helper callback function to remove pressed key from array
// function removeKey(e) {
//   const index = keys.indexOf(e.key);
//   if (index > -1) {
//     keys.splice(index, 1);
//   }
// }

// // Initialize trial data
// function initTrial() {
//   var trialTheta = 0;
//   if (state.trialType === "vmr") {
//     trialTheta = Rotation;
//   }
//   // Initialize trial data
//   var tdata = {
//     x: BoxRadius, 
//     y: BoxRadius, 
//     theta: deg2rad(getRandomOrientation()), 
//     color: "gold", 
//     thetaOffset: trialTheta, 
//     mode: modeButton.innerText, 
//     target: getRandomTargetIndex()
//   };
//   return tdata;
// }

// // Draw a triangle pointing in the desired direction "out" of the circle body
// function drawPointedCursor(context) {
//   context.beginPath();
//   context.arc(trialData.x, trialData.y, CursorSize, trialData.theta + 0.5*Math.PI, trialData.theta + 1.5*Math.PI);
//   context.lineTo(trialData.x + PointerRadius*Math.cos(trialData.theta), trialData.y + PointerRadius*Math.sin(trialData.theta));
//   context.closePath();
//   context.fillStyle = trialData.color;
//   context.fill();
//   context.linewidth = 0;
//   context.stroke();
// }

// async function handleKeys(e) {
//   if (e.repeat === false) {
//     keys.push(e.key);
//     return;
//   } else {
//     baseGraphics(trialData.target);
//     if (state.taskMode === "Cartesian") {
//       if (await handleCartesianKeybinds()) {
//         return;
//       }
//     } else {
//       if (await handlePolarKeybinds()) {
//         return;
//       }
//     }
//   }
//   drawPointedCursor(context);
//   if (startCheck) {
//     appendData();
//     if (targetCheck(trialData.target)) {
//       await sleep(100);
//       if (targetCheck(trialData.target)) {
//         state.taskState = "successful";
//         appendData();
//         endTrial();
//       } else {
//         state.taskState = "overshoot";
//         appendData();
//       }
//     } else {
//       appendData();
//     }
//   } else {
//     appendData();
//   }
// }

// async function handleCartesianKeybinds(key) {
//   var tf = true;
//   if (keys.includes('w')) { // up
//     trialData.y = trialData.y - FixedVelocity;
//     tf = false;
//   }
//   if (keys.includes('s')) { // down
//     trialData.y = trialData.y + FixedVelocity;
//     tf = false;
//   } 
//   if (keys.includes('a')) { // left
//     trialData.x = trialData.x - FixedVelocity;
//     tf = false;
//   }
//   if (keys.includes('d')) { // right
//     trialData.x = trialData.x + FixedVelocity;
//     tf = false;
//   }
//   return tf;
// }

// async function handlePolarKeybinds(key) {
//   var tf = true;
//   if (keys.includes('w')) { // up
//     trialData.x = trialData.x + FixedRadialVelocity * Math.cos(trialData.theta);
//     trialData.y = trialData.y + FixedRadialVelocity * Math.sin(trialData.theta);
//     tf = false;
//   }
//   if (keys.includes('s')) { // down
//     trialData.x = trialData.x - FixedRadialVelocity * Math.cos(trialData.theta);
//     trialData.y = trialData.y - FixedRadialVelocity * Math.sin(trialData.theta);
//     tf = false;
//   }
//   if (keys.includes('a')) { // left
//     trialData.theta = trialData.theta + FixedAngularVelocity;
//     tf = false;
//   }
//   if (keys.includes('d')) { // right
//     trialData.theta = trialData.theta - FixedAngularVelocity;
//     tf = false;
//   }
//   return tf;
// }

// // Run the trial
// function runTrial(x, y, c) {
//     let xPos;
//     let yPos;
//     if (state.trialType === "vmr") {
//         let radius = Math.sqrt(Math.pow((state.canvas.height - 25) - y, 2) +
//             Math.pow(x - state.canvas.width / 2, 2))
//         let theta = Math.atan2((state.canvas.height - 25) - y, x - state.canvas.width / 2);
//         if (Math.abs(x - state.canvas.width / 2) <= 0.0001) {
//             theta = Math.PI / 2;
//         }
//         let thetaShift = theta - (Rotation * Math.PI / 180);
//         xPos = radius * Math.cos(thetaShift) + state.canvas.width / 2;
//         yPos = (state.canvas.height - 25) - (radius * Math.sin(thetaShift));
//     }
//     else {
//         xPos = x;
//         yPos = y;
//     }
//     drawCursor(xPos, yPos, CursorSize, 0, 2 * Math.PI);
//     appendData(x, y, xPos, yPos);
// }