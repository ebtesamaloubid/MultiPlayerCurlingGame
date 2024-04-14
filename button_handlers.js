const socket = io('http://' + window.document.location.host);

function buttonState(buttonId, disabled) {
    const btn = document.getElementById(buttonId);
    btn.disabled = disabled;
    btn.style.backgroundColor = disabled ? "lightgray" : ""; // Set background color if disabled
}
function showPopup(message) {
    alert(message); // Show a simple alert dialog with the provided message
}
function buttonListenerButtonListener(buttonId, message) {
    const btn = document.getElementById(buttonId);

    // Flag 
    let isButtonDisabled = false;

    socket.on('Recieved', function (msg) {
        if (msg === message && !isButtonDisabled) {
            buttonState(buttonId, true); 
            if (socket.buttonId === buttonId) {
                showPopup(message); 
            }
            isButtonDisabled = true; 
        }
    });

    socket.on('availableButtons', function (availability) {
        // Check if the buttonId is available 
        if (availability[buttonId]) {
            buttonState(buttonId, false); // Enable the button
        } else {
            buttonState(buttonId, true); // Disable the button
        }
    });

    return function () {
        console.log(`handle${buttonId}()`);
        socket.emit('sending', message);

        // Additional logic to handle button click if needed
        if (buttonId === 'JoinAsHomeButton' && !isHomePlayerAssigned) {
            isHomePlayerAssigned = true;
            isHomeClient = true;
            showPopup('you joined as a home.'); // Show a popup when the button is clicked
        } else if (buttonId === 'JoinAsVisitorButton' && !isVisitorPlayerAssigned) {
            isVisitorPlayerAssigned = true;
            isVisitorClient = true;
            socket.emit('availableButtons', { [buttonId]: false }); // Notify server to lock the button
            showPopup('You joined as a Visitor .'); // Show a popup when the button is clicked
        } else if (buttonId === 'JoinAsSpectatorButton' && !isSpectatorClient) {
            const btnSpectator = document.getElementById("JoinAsSpectatorButton");
            btnSpectator.disabled = true;
            btnSpectator.style.backgroundColor = "lightgray";
            isSpectatorClient = true;
            showPopup('You joined  Spectator.'); // Show a popup when the button is clicked
        }
    };
}


// Usage
const handleJoinAsHomeButton = buttonListenerButtonListener('JoinAsHomeButton', 'Disable Home');
const handleJoinAsVisitorButton = buttonListenerButtonListener('JoinAsVisitorButton', 'Disable Visitor');
const handleJoinAsSpectatorButton = buttonListenerButtonListener('JoinAsSpectatorButton', 'Disable Spectator');
