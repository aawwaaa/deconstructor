const openai = require('openai')
const fs = require('fs')

const config = require('../config')

const clients = {}
for (const [name, endpoint] of Object.entries(config.endpoints)) {
  clients[name] = new openai.OpenAI({
    baseURL: endpoint.div,
    apiKey: endpoint.apikey,
    timeout: 10000
  })
}

const managers = {}

class AIManager {
  constructor(provider, id, options = {}) {
    this.provider = provider
    this.id = id
    this.processes = []
    this.prevoiusProcesses = []
    this.sockets = []
    this.token = options?.token ?? null
    managers[id] = this
  }
  destroy() {
    delete managers[this.id]
  }

  addSocket(ws) {
    ws.handler.closed = () => {
      this.sockets.splice(this.sockets.indexOf(ws), 1)
    }
    ws.handler.error = (error) => {
      this.sockets.splice(this.sockets.indexOf(ws), 1)
    }
    ws.handler.select = ({name}) => {
      const process = this.processes.find(a => a.name == name) ?? this.prevoiusProcesses.find(a => a.name == name)
      if (process) process.addSocket(ws)
      else ws.send('info', {message: 'Process not found'})
    }
    ws.handler.create = ({type, data}) => {
      this.createProcess(type, data)
      ws.send('info', {message: 'Process created'})
    }
    ws.handler.run = ({name}) => {
      const process = this.processes.find(a => a.name == name) ?? this.prevoiusProcesses.find(a => a.name == name)
      if (process) process.run()
      else ws.send('info', {message: 'Process not found'})
      this.sendList()
    }
    this.sockets.push(ws)
    ws.send('info', {message: 'Connected'})
    this.sendList()
  }
  send(type, data = {}) {
    for (let socket of this.sockets) {
      socket.send(type, data)
    }
  }
  sendList() {
    this.send('list', Object.fromEntries(this.processes.concat(this.prevoiusProcesses).map(a => [
      a.name, a.status
    ])))
  }

  createProcess(type, data) {
    const process = this.provider.createProcess(type, data)
    this.processes.push(process)
    process.listeners.push((status) => {
      if (status == 'done' || 'status' == 'error'){
        this.prevoiusProcesses.push(process)
        this.processes.splice(this.processes.indexOf(process), 1)
        if (this.prevoiusProcesses.length > 10) this.prevoiusProcesses.splice(0, 1)
      }
      this.sendList()
    })
    this.sendList()
    return process
  }
}

class AIProvider {
  createProcess(type, data) {
    const prompt = fs.readFileSync(__dirname + '/prompt/' + type + '.md', { encoding: 'utf-8' }).toString().split('\n')
    const buffer = []
    const options = {}
    for (const line of prompt) {
      if (!line.startsWith('%%')) {
        buffer.push(line)
        continue
      }
      const [key, value] = line.substring(2).trim().split(' ')
      if (key == 'rem') continue
      options[key] = isNaN(value) ? value : parseFloat(value)
    }
    const messages = options.prompt_mode == "user"
    ?[
      { role: 'user', content: buffer.join('\n') + "\n" + data },
    ]
    :[
      { role: 'system', content: buffer.join('\n') },
      { role: 'user', content: data }
    ]
    delete options.prompt_mode
    return new AIProcess(messages, type+'#'+Date.now(), options)
  }
}

class AIProcess {
  constructor(messages, name = "process#"+Date.now(), options = {}) {
    this.messages = messages
    this.options = options
    this.buffer = ''
    this.dataBuffer = ''
    this.status = 'waiting'
    this.name = name
    this.sockets = []
    this.listeners = []
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
    })
  }
  addSocket(ws){
    const oldClosed = ws.handler.closed
    const oldError = ws.handler.error
    ws.handler.closed = () => {
      this.sockets.splice(this.sockets.indexOf(ws), 1)
      oldClosed()
    }
    ws.handler.error = (error) => {
      this.sockets.splice(this.sockets.indexOf(ws), 1)
      oldError(error)
    }
    ws.handler.disconnect = () => {
      this.sockets.splice(this.sockets.indexOf(ws), 1)
      ws.handler.closed = oldClosed
      ws.handler.error = oldError
      ws.handler.disconnect = void 0
      ws.send('reset')
    }
    ws.send('reset')
    for (let message of this.messages) {
      // if (message.role == 'assistant') continue
      ws.send('message', message)
    }
    if (this.buffer != '')
      ws.send('delta', {content: this.buffer})
    this.sockets.push(ws)
  }
  send(type, data = {}){
    for (let socket of this.sockets){
      socket.send(type, data)
    }
  }
  run() {
    if (this.status == 'waiting') (async () => {
      this.status = 'running'
      this.listeners.map(a => a('running'))
      const client = clients[this.options.endpoint ?? Object.keys(config.endpoints)[0]]
      delete this.options.endpoint
      const response = await client.chat.completions.create(Object.assign({
        messages: this.messages.filter(a => a.role != 'assistant-thinking'),
        temperature: 0.55,
        stream: true,
      }, this.options))
      
      for await (const part of response) {
        if (part.choices[0].delta.reasoning_content) {
          if (this.buffer == ''){
            this.buffer += '\n------REASONING START-------\n'
            this.send('delta', {content: '\n------REASONING START-------\n'})
          }
          this.buffer += part.choices[0].delta.reasoning_content
          this.send('delta', {content: part.choices[0].delta.reasoning_content})
        }
        if (part.choices[0].delta.content) {
          let delta = part.choices[0].delta.content
          if (this.dataBuffer == ''){
            this.buffer += '\n------REASONING END-------\n'
            this.send('delta', {content: '\n------REASONING END-------\n'})
          }
          this.buffer += delta
          this.dataBuffer += delta
          this.send('delta', {content: delta})
        }
      }
      
      this.send('end')
      if (this.dataBuffer.includes('</think>\n')) {
        this.buffer = this.dataBuffer.substring(0, this.dataBuffer.indexOf('</think>\n'))
        this.dataBuffer = this.dataBuffer.substring(this.dataBuffer.indexOf('</think>\n') + '</think>\n'.length)
      }
      this.messages.push({role: 'assistant-thinking', content: this.buffer})
      this.messages.push({role: 'assistant', content: this.dataBuffer})
      this.buffer = ''
      this.dataBuffer = ''
      this.status = 'done'
      this.listeners.map(a => a('done'))
      this.resolve(this.messages[this.messages.length - 1].content)
    })().catch(error => {
      console.error('Error in AI process:', error)
      this.status = 'error'
      this.listeners.map(a => a('error'))
      this.messages.push({role: 'error', content: error.message + "\n" + error.stack})
      this.send('delta', {content: 'Error: ' + error.message + "\n" + error.stack})
      this.send('end')
    });
    return this.promise
  }
}

const provider = new AIProvider()
const main = new AIManager(provider, 'main', {
  token: config.mainManagerToken
})

module.exports = {
  main, getManager: (id) => managers[id], createManager: (id) => new AIManager(main, id)
}

