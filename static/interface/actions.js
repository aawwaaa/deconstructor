let ws

const joinButton = document.getElementById('join')
const startGameButton = document.getElementById('start-game')
const roomConfigButton = document.getElementById('room-config')
const inputToggleBotton = document.querySelector('#input + button')
function status(data) {
  joinButton.style.display = !data.started || (data.allowJoinWhenStarted && data.type != "player")?
    'block' : 'none'
  joinButton.innerText = data.type != "player"? "加入游戏": "退出游戏"
  startGameButton.style.display = roomConfigButton.style.display
    = data.hasPermission && !data.started? 'block' : 'none'
  inputToggleBotton.style.display = data.started && data.type == "player"? 'block' : 'none'
}

joinButton.addEventListener('click', () => {
  ws.send('join')
})

let nowEditing = 'setRoomConfig'
const configPanel = document.getElementById('config-panel')
const editor = document.getElementById('editor-placeholder')
let editorObject = null
roomConfigButton.addEventListener('click', () => {
  configPanel.setAttribute('shown', 'true')
  nowEditing = 'setRoomConfig'
  ws.send('getRoomConfig')
  if (editorObject) editorObject.destroy()
  ws.handler.config = ({data, schema}) => editorObject = new JSONEditor(editor, {
    schema, startval: data,
    no_additional_properties: true,
  })
})
startGameButton.addEventListener('click', () => {
  ws.send('startGame')
})

const saveConfigButton = document.getElementById('save-config')
saveConfigButton.addEventListener('click', () => {
  configPanel.setAttribute('shown', 'false')
  ws.send(nowEditing, editorObject.getValue())
  if (editorObject) editorObject.destroy()
})

export default {status, websocket: (w) => ws = w}
