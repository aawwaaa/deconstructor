function getEndpoint(path) {
  // 确保路径以斜杠开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // 获取当前页面的协议（http 或 https）
  const protocol = window.location.protocol;
  // 根据当前协议决定 ws 或 wss
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  // 获取当前主机（hostname:port）
  const host = window.location.host;
  // 构建完整的 WebSocket URL
  const endpoint = `${wsProtocol}//${host}${normalizedPath}`;
  return endpoint;
}

function connect(path, initialObject = {}) {
  path = getEndpoint(path)
  let websocket = new WebSocket(path)
  let tries = 0
  let pingInterval = null
  let retryTimeout = null
  let handler = {
    reconnectFailed: () => void 0,
    reconnectWaiting: (timeout) => void 0,
    connecting: () => void 0,
    established: () => void 0,
    unparsedData: (data) => void 0,
  }
  function reconnectDelay(timeout = tries == 0? 0: 3) {
    clearInterval(pingInterval)
    pingInterval = null
    if (tries > 10) {
      handler.reconnectFailed()
      close()
      return
    }
    if (timeout <= 0){
      tries += 1
      retryTimeout = null
      reconnect()
      return;
    }
    handler.reconnectWaiting(timeout)
    retryTimeout = setTimeout(reconnectDelay, 1000, timeout-1)
  }
  function reconnect(ws = new WebSocket(path)){
    websocket = ws
    handler.connecting()
    websocket.addEventListener('open', () => {
      tries = 0
      send("init", initialObject)
      handler.established()
      pingInterval = setInterval(() => {
        send("ping")
      }, 5000)
    })
    websocket.addEventListener('message', ({data}) => {
      try {
        data = JSON.parse(data)
        if (data["$type"] == "pong") return
        const type = data["$type"]
        delete data["$type"]
        handler[type](data)
      } catch (e) {
        console.log(e)
        handler.unparsedData(data)
      }
    })
    websocket.addEventListener('close', () => {
      if (websocket == null) return
      reconnectDelay()
    })
    websocket.addEventListener('error', (event) => {
      if (!websocket) return;
      console.error("WebSocket error event:", event);
      console.error("WebSocket state:", websocket.readyState);
      reconnectDelay()
    });
  }
  reconnect(websocket)
  function close(){
    if (pingInterval != null) clearInterval(pingInterval)
    websocket.close()
    websocket = null
    if (retryTimeout != null) clearTimeout(retryTimeout)
  }
  function send(type, obj = {}) {
    const message = { ...obj, $type: type };
    websocket.send(JSON.stringify(message));
  }
  const obj = {close, handler, send}
  return obj
}

export default {connect}
