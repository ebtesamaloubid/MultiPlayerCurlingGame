const server = require('http').createServer(handler);
const io = require('socket.io')(server); // Wrap server app in socket.io capability
const fs = require('fs'); // File system to serve static files
const url = require('url'); // To parse URL strings
const PORT = process.env.PORT || 3000; // Useful if you want to specify the port through an environment variable

const ROOT_DIR = 'html'; // Directory to serve static files from

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
};

// Initialize button availability
const availableButtons = {
  JoinAsHomeButton: true,
  JoinAsVisitorButton: true,
  JoinAsSpectatorButton: true,
};



function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext];
    }
  }
  return MIME_TYPES['txt'];
}

server.listen(PORT); // Start http server listening on PORT

function handler(request, response) {
  // Handler for http server requests
  let urlObj = url.parse(request.url, true, false);
  console.log('\n============================');
  console.log("PATHNAME: " + urlObj.pathname);
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
  console.log("METHOD: " + request.method);

  let filePath = ROOT_DIR + urlObj.pathname;
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html';

  fs.readFile(filePath, function(err, data) {
    if (err) {
      // Report error to console
      console.log('ERROR: ' + JSON.stringify(err));
      // Respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err));
      return;
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath),
    });
    response.end(data);
  });
}
const playersButtons = {};
io.on('connection', (socket) => {
  console.log('A player has connected');

  // Notify the new client 
  socket.emit('availableButtons', availableButtons);

  socket.on('sending', (message) => {
    console.log(`Received action: ${message}`);

    // Process the action 
    function processAction(action, buttonKey) {
      if (message === action && availableButtons[buttonKey]) {
        io.emit('Recieved', action);
        availableButtons[buttonKey] = false;
        socket.buttonId = buttonKey;
        playersButtons[socket.id] = playersButtons[socket.id] || [];
        playersButtons[socket.id].push(buttonKey);
      }
    }

    processAction('Disable Home', 'JoinAsHomeButton');
    processAction('Disable Visitor', 'JoinAsVisitorButton');
    processAction('Disable Spectator', 'JoinAsSpectatorButton');
  });

  // Emit mouse events to all clients
  socket.on('mousedown', (x, y) => io.emit('handleMouseDown', x, y));
  socket.on('findMousePositionMossion', (x, y) => io.emit('handlefindMousePositionMossion', x, y));
  socket.on('mouseup', (data) => io.emit('handleMouseUp', data));

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    if (playersButtons[socket.id]) {
      playersButtons[socket.id].forEach((buttonId) => {
        availableButtons[buttonId] = true;
      });
      delete playersButtons[socket.id];
      io.emit('availableButtons', availableButtons);
    }
  });
});


console.log(`Server Running at port ${PORT}  CNTL-C to quit`);
console.log(`To Test:`);
console.log("http://localhost:3000/curling.html");
