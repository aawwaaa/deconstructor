function wrapper(ws){
  const handler = {
    ping: () => send('pong'),
    closed: () => void 0,
    error: (error) => void 0,
    unparsedData: (data) => void 0,
  };

  // Message handler
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (handler[message["$type"]]) {
        handler[message["$type"]](message);
      } else {
        handler.unparsedData(data);
      }
    } catch (e) {
      console.error(e)
      handler.unparsedData(data);
    }
  });

  // Close handler
  ws.on('close', () => {
    handler.closed()
  });

  // Error handler
  ws.on('error', (error) => {
    console.error("WebSocket error:", error);
    handler.error(error)
  });

  // Send function
  function send(type, obj = {}) {
    if (ws.readyState !== ws.OPEN) return;
    const message = { ...obj, $type: type };
    ws.send(JSON.stringify(message));
  }

  // Close function
  function close() {
    if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
      ws.close();
    }
  }

  // Return the same interface as the client version
  const obj = { close, handler, send };
  return obj;
}
exports.wrapper = wrapper
