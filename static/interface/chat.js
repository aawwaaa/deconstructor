const chat = document.getElementById('chat')
function toggle(){
  if (chat.getAttribute('shown') != 'false') chat.setAttribute('shown', 'false');
  else chat.setAttribute('shown', 'true')
}
document.querySelector('#chat-toggle').addEventListener('click', toggle)

let ws
function websocket(w){
  ws = w
}

const chatContent = document.getElementById('chat-content')
function addMessage(msg){
  const chatLine = document.createElement('span')
  chatLine.classList.add('chat-line')
  chatLine.textContent = msg
  chatContent.appendChild(chatLine)
  chatContent.scrollTop = chatContent.scrollHeight
}

const chatInput = document.getElementById('chat-input')
document.querySelector('#chat-form').addEventListener('submit', (e) => {
  e.preventDefault()
  ws.send('chat', {'message': chatInput.value})
  chatInput.value = ''
})

export default { websocket, addMessage }
