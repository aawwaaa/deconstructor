import websocket from './websocket.js'

const announce = document.getElementById('announce')
let announceTimeout = null
function showAnnounce(info){
  announce.innerHTML = info
  announce.setAttribute('shown', 'true')
  if (announceTimeout) clearTimeout(announceTimeout)
  announceTimeout = setTimeout(() => {
    announce.setAttribute('shown', 'false')
  }, 3000)
}

let ws
const connectInfoForm = document.getElementById('connect-info')
connectInfoForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = new FormData(connectInfoForm)
  ws = websocket.connect('/api/manager/' + data.get('id'), {
    token: data.get('token')
  })
  connecting()
})


const processList = document.getElementById('processes')
const processContent = document.getElementById('process-content')
function connecting(){
  let currentName = ''
  let currentRunnable = false
  ws.handler.list = (data) => {
    processList.innerHTML = ''
    for (const n in data) {
      const name = n
      const a = document.createElement('a')
      const status = data[name]
      a.innerText = data[name] + ":" + name
      a.href = "javascript:void(0)"
      a.style.display = 'block'
      a.addEventListener('click', () => {
        ws.send('disconnect')
        ws.send('select', {name})
        currentName = name
        currentRunnable = status == "waiting"
        ws.handler.reset()
      })
      processList.appendChild(a)
    }
  }
  ws.handler.reset = () => {
    currentDelta = null
    processContent.innerHTML = ''
    if (currentRunnable) {
      const a = document.createElement('a')
      a.href = "javascript:void(0)"
      a.innerText = "Run"
      a.addEventListener('click', () => {
        ws.send('run', {name: currentName})
        currentRunnable = false
        ws.send('disconnect')
        setTimeout(() => {
          ws.send('select', {name: currentName})
        }, 20)
      })
      processContent.appendChild(a)
    }
  }
  ws.handler.message = ({role, content}) => {
    const pre = document.createElement('pre')
    pre.innerText = role + ": \n" + content
    processContent.appendChild(pre)
  }
  let currentDelta = null
  ws.handler.delta = ({content}) => {
    const pre = currentDelta ?? document.createElement('pre')
    if (!currentDelta){
      pre.innerText = 'assistant: '
      processContent.appendChild(pre)
    }
    currentDelta = pre
    currentDelta.innerText += content
    if (Math.abs(processContent.scrollTop + processContent.clientHeight - processContent.scrollHeight) < 300)
      processContent.scrollTop = processContent.scrollHeight
  }
  ws.handler.end = () => {
    currentDelta = null
  }
  ws.handler.info = ({message}) => {
    showAnnounce(message)
  }
  ws.handler.error = ({error}) => {
    const font = document.createElement('font')
    font.color = 'red'
    font.innerText = '\n' + error
    processContent.appendChild(font)
    ws.close()
  }
}

const createProcessForm = document.getElementById('create-process')
createProcessForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = new FormData(createProcessForm)
  ws.send('create', {type: data.get('type'), data: data.get('data')})
})

showAnnounce('Page loaded.')

setTimeout(() => {
  if (localStorage.getItem('manager-connect')) {
    ws = websocket.connect('/api/manager/' + localStorage.getItem('manager-connect'), {
      token: localStorage.getItem('manager-token')
    })
    showAnnounce("Auto connect to " + localStorage.getItem('manager-connect'))
    localStorage.removeItem('manager-connect')
    localStorage.removeItem('manager-token')
    connecting()
    connectInfoForm.style.display = 'none'
  }
})
