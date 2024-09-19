// Function to create the form for inputting coordinates and calculating bearing
function createCoordinateForm() {
    const form = document.createElement('form');
    
    const label1 = document.createElement('label');
    label1.textContent = 'Enter the coordinates of the first traverse station:';
    const x1Input = document.createElement('input');
    x1Input.type = 'number';
    x1Input.placeholder = 'X1 coordinate';
    
    const y1Input = document.createElement('input');
    y1Input.type = 'number';
    y1Input.placeholder = 'Y1 coordinate';
    
    const label2 = document.createElement('label');
    label2.textContent = 'Enter the coordinates of the second traverse station:';
    const x2Input = document.createElement('input');
    x2Input.type = 'number';
    x2Input.placeholder = 'X2 coordinate';
    
    const y2Input = document.createElement('input');
    y2Input.type = 'number';
    y2Input.placeholder = 'Y2 coordinate';
    
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.textContent = 'Submit Coordinates';

    const bearingResultDiv = document.createElement('div');
    bearingResultDiv.id = 'bearingResult';

    form.appendChild(label1);
    form.appendChild(x1Input);
    form.appendChild(y1Input);
    form.appendChild(document.createElement('br'));
    form.appendChild(label2);
    form.appendChild(x2Input);
    form.appendChild(y2Input);
    form.appendChild(document.createElement('br'));
    form.appendChild(submitButton);
    form.appendChild(bearingResultDiv);

    document.body.appendChild(form);

    submitButton.addEventListener('click', function() {
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
            const bearing = calculateBearing(x1, y1, x2, y2);
            const bearingDMS = convertToDMS(bearing);
            bearingResultDiv.textContent = `Initial Bearing: ${bearingDMS.deg}° ${bearingDMS.min}' ${bearingDMS.sec}"`;
            
            askForAngles(bearing, x1, y1); // Pass the initial bearing and initial coordinates
        } else {
            bearingResultDiv.textContent = 'Please enter valid numerical coordinates for both stations.';
        }
    });
}

// Function to calculate the bearing between two points
function calculateBearing(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const bearing = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
    return (bearing + 360) % 360;
}

// Function to convert bearing to degrees, minutes, and seconds
function convertToDMS(bearing) {
    const deg = Math.floor(bearing);
    const minFloat = (bearing - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = Math.round((minFloat - min) * 60);
    return { deg, min, sec };
}

// Function to ask for the number of angles and then display inputs for angles
function askForAngles(initialBearing, initialX, initialY) {
    const angleForm = document.createElement('form');
    const label = document.createElement('label');
    label.textContent = 'Enter the number of internal angles:';
    const angleCountInput = document.createElement('input');
    angleCountInput.type = 'number';
    angleCountInput.id = 'angleCount';
    const submitAngleButton = document.createElement('button');
    submitAngleButton.textContent = 'Submit Angle Count';
    submitAngleButton.type = 'button';

    angleForm.appendChild(label);
    angleForm.appendChild(angleCountInput);
    angleForm.appendChild(submitAngleButton);
    document.body.appendChild(angleForm);

    const angleInputDiv = document.createElement('div');
    angleInputDiv.id = 'angleInputsDiv';
    document.body.appendChild(angleInputDiv);

    const angleResultDiv = document.createElement('div');
    angleResultDiv.id = 'angleResult';
    document.body.appendChild(angleResultDiv);

    submitAngleButton.addEventListener('click', function() {
        const angleCount = parseInt(angleCountInput.value);
        if (!isNaN(angleCount) && angleCount > 0) {
            displayAngleInputs(angleCount, angleInputDiv, angleResultDiv, initialBearing, initialX, initialY);
        } else {
            alert('Please enter a valid number of angles.');
        }
    });
}

// Function to dynamically display input fields for angles
function displayAngleInputs(count, angleInputDiv, angleResultDiv, initialBearing, initialX, initialY) {
    angleInputDiv.innerHTML = '';

    const angleInputs = [];
    
    for (let i = 1; i <= count; i++) {
        const label = document.createElement('label');
        label.textContent = `Enter the ${i}° angle (in degrees):`;
        const angleInput = document.createElement('input');
        angleInput.type = 'number';
        angleInput.className = 'angleInput';
        angleInputDiv.appendChild(label);
        angleInputDiv.appendChild(angleInput);
        angleInputDiv.appendChild(document.createElement('br'));
        angleInputs.push(angleInput);
    }

    const submitAnglesButton = document.createElement('button');
    submitAnglesButton.textContent = 'Submit Angles';
    submitAnglesButton.type = 'button';
    angleInputDiv.appendChild(submitAnglesButton);

    submitAnglesButton.addEventListener('click', function() {
        const observedAngles = angleInputs.map(input => parseFloat(input.value)).filter(val => !isNaN(val));
        if (observedAngles.length === count) {
            calculateAngularCheck(count, observedAngles, angleResultDiv, initialBearing, initialX, initialY);
        } else {
            alert('Please enter valid angles for all fields.');
        }
    });
}

// Function to calculate angular check and bearings of all sides
function calculateAngularCheck(count, observedAngles, angleResultDiv, initialBearing, initialX, initialY) {
    const totalObserved = observedAngles.reduce((sum, angle) => sum + angle, 0);
    const totalActual = (count - 2) * 180;
    let error = totalObserved - totalActual;

    // Adjust error for positive correction
    if (error < 0) {
        error = Math.abs(error);
    } else {
        error = -error;
    }

    const angleCorrection = error / count;
    const adjustedAngles = observedAngles.map(angle => angle + angleCorrection);
    const totalAdjusted = adjustedAngles.reduce((sum, angle) => sum + angle, 0);

    const adjustedAnglesDMS = adjustedAngles.map(angle => convertToDMS(angle));
    const totalAdjustedDMS = convertToDMS(totalAdjusted);
    const errorDMS = convertToDMS(Math.abs(error));

    // Calculate the bearings of all sides
    const bearings = [];
    let currentBearing = initialBearing;
    for (let i = 0; i < count; i++) {
        bearings.push(currentBearing);
        currentBearing = (currentBearing + adjustedAngles[i]) % 360;
    }
    
    // Convert bearings to DMS
    const bearingsDMS = bearings.map(bearing => convertToDMS(bearing));

    // Display results
    const adjustedAnglesText = adjustedAnglesDMS.map((dms, index) =>
        `Adjusted Angle ${index + 1}: ${dms.deg}° ${dms.min}' ${dms.sec}"`).join('<br>');

    const bearingsText = bearingsDMS.map((dms, index) =>
        `Bearing ${index + 1}: ${dms.deg}° ${dms.min}' ${dms.sec}"`).join('<br>');

    angleResultDiv.innerHTML = `Sum of Observed Angles: ${convertToDMS(totalObserved).deg}° ${convertToDMS(totalObserved).min}' ${convertToDMS(totalObserved).sec}" <br>
                                Total Actual Sum: ${convertToDMS(totalActual).deg}° ${convertToDMS(totalActual).min}' ${convertToDMS(totalActual).sec}" <br>
                                Error: ${errorDMS.deg}° ${errorDMS.min}' ${errorDMS.sec}" <br><br>
                                ${adjustedAnglesText} <br><br>
                                Sum of Adjusted Angles: ${totalAdjustedDMS.deg}° ${totalAdjustedDMS.min}' ${totalAdjustedDMS.sec}" <br><br>
                                ${bearingsText}`;

    // Call function to ask for side lengths
    askForSideLengths(count, bearings, initialX, initialY);
}

// Function to ask for the lengths of all sides
function askForSideLengths(count, bearings, initialX, initialY) {
    const sideForm = document.createElement('form');
    const label = document.createElement('label');
    label.textContent = `Enter the lengths of all ${count} sides:`;
    
    const sideInputsDiv = document.createElement('div');
    sideInputsDiv.id = 'sideInputsDiv';
    
    const sideInputs = [];
    for (let i = 1; i <= count; i++) {
        const label = document.createElement('label');
        label.textContent = `Length of side ${i}:`;
        const sideInput = document.createElement('input');
        sideInput.type = 'number';
        sideInput.className = 'sideInput';
        sideInputsDiv.appendChild(label);
        sideInputsDiv.appendChild(sideInput);
        sideInputsDiv.appendChild(document.createElement('br'));
        sideInputs.push(sideInput);
    }

    const submitSidesButton = document.createElement('button');
    submitSidesButton.textContent = 'Submit Side Lengths';
    submitSidesButton.type = 'button';
    sideForm.appendChild(label);
    sideForm.appendChild(sideInputsDiv);
    sideForm.appendChild(submitSidesButton);
    document.body.appendChild(sideForm);

    const resultDiv = document.createElement('div');
    resultDiv.id = 'finalResults';
    document.body.appendChild(resultDiv);

    submitSidesButton.addEventListener('click', function() {
        const sideLengths = sideInputs.map(input => parseFloat(input.value)).filter(val => !isNaN(val));
        if (sideLengths.length === count) {
            calculateEastingNorthing(count, sideLengths, bearings, initialX, initialY);
        } else {
            alert('Please enter valid lengths for all sides.');
        }
    });
}

// Function to calculate the easting and northing for each line, and display results
function calculateEastingNorthing(count, sideLengths, bearings, initialX, initialY) {
    const coordinates = calculateCoordinates(initialX, initialY, sideLengths, bearings);

    // Display calculated easting and northing without correction
    const resultDiv = document.getElementById('finalResults');
    const eastingNorthingText = coordinates.map((coord, index) =>
        `Station ${index + 1}: X = ${coord.x.toFixed(3)}, Y = ${coord.y.toFixed(3)}`
    ).join('<br>');

    resultDiv.innerHTML = `<br><br>Calculated Coordinates of Stations:<br>
                            ${eastingNorthingText}`;

    // Calculate adjusted easting and northing
    const { correctedEastingNorthing } = applyBowditchCorrection(sideLengths, bearings);

    const totalCorrectedEasting = correctedEastingNorthing.reduce((sum, correction) => sum + correction.correctedEasting, 0);
    const totalCorrectedNorthing = correctedEastingNorthing.reduce((sum, correction) => sum + correction.correctedNorthing, 0);

    const correctedEastingText = correctedEastingNorthing.map((correction, index) =>
        `Line ${index + 1}: Corrected Easting = ${correction.correctedEasting.toFixed(3)}, Corrected Northing = ${correction.correctedNorthing.toFixed(3)}`
    ).join('<br>');

    resultDiv.innerHTML += `<br><br>Adjusted Easting and Northing:<br>
                            ${correctedEastingText}<br>
                            <br>Total Corrected Easting: ${totalCorrectedEasting.toFixed(3)}<br>
                            Total Corrected Northing: ${totalCorrectedNorthing.toFixed(3)}`;

    // Display the corrected coordinates based on adjusted easting and northing
    const correctedCoordinates = calculateCoordinates(initialX, initialY, sideLengths, bearings, true);
    const correctedCoordinatesText = correctedCoordinates.map((coord, index) =>
        `Corrected Station ${index + 1}: X = ${coord.x.toFixed(3)}, Y = ${coord.y.toFixed(3)}`
    ).join('<br>');

    resultDiv.innerHTML += `<br><br>Corrected Coordinates of Stations:<br>
                            ${correctedCoordinatesText}`;
}

// Function to apply Bowditch correction
function applyBowditchCorrection(sideLengths, bearings) {
    const totalLength = sideLengths.reduce((sum, length) => sum + length, 0);
    const averageBearing = bearings.reduce((sum, bearing) => sum + bearing, 0) / bearings.length;

    const correctionFactorEasting = (totalLength * Math.cos(averageBearing * (Math.PI / 180))) / sideLengths.length;
    const correctionFactorNorthing = (totalLength * Math.sin(averageBearing * (Math.PI / 180))) / sideLengths.length;

    const correctedEastingNorthing = bearings.map((bearing, index) => {
        const length = sideLengths[index];
        const correctedEasting = length * Math.cos(bearing * (Math.PI / 180)) - correctionFactorEasting;
        const correctedNorthing = length * Math.sin(bearing * (Math.PI / 180)) - correctionFactorNorthing;
        return { correctedEasting, correctedNorthing };
    });

    return { correctedEastingNorthing };
}

// Function to calculate coordinates based on corrected easting and northing
function calculateCoordinates(initialX, initialY, sideLengths, bearings, corrected = false) {
    const coordinates = [{ x: initialX, y: initialY }];
    let currentX = initialX;
    let currentY = initialY;

    for (let i = 0; i < sideLengths.length; i++) {
        const bearing = bearings[i];
        const length = sideLengths[i];
        const newX = currentX + (corrected ? length * Math.cos(bearing * (Math.PI / 180)) : length * Math.cos(bearing * (Math.PI / 180)));
        const newY = currentY + (corrected ? length * Math.sin(bearing * (Math.PI / 180)) : length * Math.sin(bearing * (Math.PI / 180)));
        coordinates.push({ x: newX, y: newY });
        currentX = newX;
        currentY = newY;
    }

    return coordinates;
}

// Call the function to create the initial coordinate form
createCoordinateForm();
