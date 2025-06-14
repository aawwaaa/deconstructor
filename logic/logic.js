const { randomUUID } = require('crypto')
const ai = require('./ai')
const { Observer, Player, Team } = require('./player')
const { RoomConfig, gamemodes } = require('./config')
const fs = require('fs')
const { setInterval } = require('timers')

const roomDir = require('../config').saveDir? require('../config').saveDir + '/rooms/': null
if (roomDir && !fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true })

const rooms = {}
function translateNode(room, node, noChild = false){
  if (node.player === void 0) node.player = 'system'
  if (node.childs === void 0) node.childs = []
  const translatedNode = Object.assign({}, node, {
    'secret': null,
    'player': node.player == 'system'? 'System': room.players[node.player]?.name ?? node.player,
    'teamColor': room.players[node.player]?.team?.color ?? '#a0a0a0',
    'color': room.players[node.player]?.color ?? '#000000',
    'childs': noChild? void 0: node.childs.map(node => translateNode(room, node))
  })
  return translatedNode
}

class State {
  constructor() {
    this.name = "State"
    this.tree = {}
    this.nodes = {}
    this.changed = []
    this.onchanged = () => void 0
  }

  save() {
    return {
      name: this.name,
      tree: this.tree
    }
  }

  load(obj) {
    this.name = obj.name
    this.tree = obj.tree
    function iter(node) {
      this.nodes[node.id] = node
      for (let id in node.childs) {
        iter.call(this, node.childs[id])
      }
    }
    iter.call(this, this.tree)
    return this
  }
  
  getNode(id) {
    return this.nodes[id]
  }
  addNode(parent, node) {
    parent.childs.push(node)
    node.parent = parent.id
    this.nodes[node.id] = node
    this.changed.push(node.id)
    this.onchanged()
  }
  setRootNode(node) {
    node.id = 'root'
    this.tree = node
    this.nodes[node.id] = node
    this.changed.push(node.id)
    this.onchanged()
  }
  removeNode(node) {
    const parent = this.nodes[node.parent]
    parent.childs = parent.childs.filter(a => a != node.id)
    delete this.nodes[node.id]
    this.changed.push(node.id)
    this.onchanged()
  }
  updateNode(node) {
    this.nodes[node.id] = node
    this.changed.push(node.id)
    this.onchanged()
  }

  pullChanged() {
    const ret = this.changed
    this.changed = []
    return ret
  }
}

class Room {
  constructor(data = {}){
    if (data.noload) return;
    this.id = data?.id ?? randomUUID()
    rooms[this.id] = this
    this.creator = data?.creator ?? "system"
    this.observers = {}
    this.players = {}
    this.teams = {}

    this.manager = ai.createManager(this.id)

    this.level = 0
    this.started = false
    this.gamemode = null
    this.preset = null

    this.historyStates = []
    this.setConfig(new RoomConfig(), false)

    this.log("Created")
    this.resetState()
  }

  save() {
    return {
      id: this.id,
      creator: this.creator,
      config: this.config.save(),

      gamemode: this.gamemode.save(),
      started: this.started,
      level: this.level,
      currentState: this.currentState.save(),
      historyStates: this.historyStates.slice(0, this.historyStates.length-1).map(a => a.save()),

      players: Object.fromEntries(
        Object.values(this.players).map(a => [a.uuid, a.save()])
      ),
      teams: Object.fromEntries(
        Object.values(this.teams).map(a => [a.id, a.save()])
      )
    }
  }
  saveToFile() {
    if (!roomDir) return
    fs.writeFileSync(roomDir + this.id + '.json', JSON.stringify(this.save(), null, 2))
    this.log(">> " + roomDir + this.id + '.json')
  }

  load(obj) {
    this.id = obj.id
    this.manager = ai.createManager(this.id)
    rooms[this.id] = this
    this.creator = obj.creator
    this.setConfig(new RoomConfig(obj.config), false)
    this.gamemode.load(obj.gamemode)
    this.started = obj.started
    this.level = obj.level
    this.currentState = new State()
    this.currentState.load(obj.currentState)
    this.currentState.onchanged = () => this.syncNode()
    this.historyStates = obj.historyStates.map(a => new State().load(a))
    this.historyStates.push(this.currentState)
    this.observers = {}
    this.players = Object.fromEntries(
      Object.entries(obj.players).map(a => [a[0], new Player(this, a[1].uuid).load(a[1])])
    )
    this.teams = Object.fromEntries(
      Object.entries(obj.teams).map(a => [a[0], new Team(this, "").load(a[1])])
    )
  }

  log(...args) {
    console.log("Room[" + this.id + "]", ...args)
  }
  status() {
    return {
      players: Object.keys(this.observers).length,
      name: this.config.name,
      creator: this.creator.substring(0, 8),
      gamemode: this.gamemode.name,
      preset: this.preset.name,
      started: this.started,
      level: this.currentState.name,
      hasPassword: this.config.password.length > 0
    }
  }
  delete() {
    this.manager.destroy()
    delete rooms[this.id]
    if (roomDir) {
      fs.unlinkSync(roomDir + this.id + '.json')
      this.log("-- " + roomDir + this.id + '.json')
    }
  }
  sendAll(type, obj = {}, overrideView = false){
    for (let uuid in this.observers) {
      if (!overrideView && this.observers[uuid].view != null) continue
      this.observers[uuid].send(type, obj)
    }
  }
  syncPlayerList() {
    this.sendAll('playerList', Object.fromEntries(
      Object.values(this.teams).map(a => [a.id, a.status()])
    ), true)
    this.saveToFile()
  }
  syncNode(){
    const changed = this.currentState.pullChanged()
    for (let id of changed) {
      this.sendAll('node', {
        id,
        node: translateNode(this, this.currentState.getNode(id), true)
      })
    }
    this.saveToFile()
  }
  syncTree(target = null) {
    const targetFunc = target? target.send.bind(target): this.sendAll.bind(this)
    targetFunc('tree', translateNode(this, this.currentState.tree))
    this.saveToFile()
  }
  syncHistoryState(observer, target) {
    observer.view = target
    if (target != null)
      observer.send('tree', translateNode(this, this.historyStates[target].tree))
    else
      syncTree(observer)
    this.saveToFile()
  }
  syncStatesList() {
    this.sendAll('statesList', {'states': this.historyStates.map(a => a.name)})
    this.saveToFile()
  }
  syncStatus() {
    for (let uuid in this.observers) {
      this.observers[uuid].syncStatus()
    }
  }
  sendMessage(message, filter = (a) => true){
    for (let uuid in this.observers) {
      if (!filter(this.observers[uuid])) continue
      this.observers[uuid].send('chat', {message})
    }
  }
  assignPlayer(uuid, player){
    if (this.players[uuid]) {
      const team = this.players[uuid].team
      if (team) {
        team.removePlayer(this.players[uuid])
        player.team = null
        if (team.autoDestroy && team.players.length == 0) {
          delete this.teams[team.id]
        }
      }
    }
    if ((player instanceof Player) && !player.team) {
      const team = new Team(this, player.name)
      team.hidden = true
      team.autoDestroy = true
      team.creator = player.uuid
      team.color = player.color
      team.score = player.score
      this.teams[team.id] = team
      team.addPlayer(player)
    }
    this.observers[uuid] = player
    if (player instanceof Player) this.players[uuid] = player
    else delete this.players[uuid]
    for (let name in player.handler){
      player.ws.handler[name] = player.handler[name].bind(player)
    }
    this.syncPlayerList()
    player.syncStatus()
    return player
  }
  connectionJoin(uuid, props, ws) {
    if (this.players[uuid]) {
      this.observers[uuid] = this.players[uuid]
    }
    if (!this.observers[uuid]){
      this.observers[uuid] = new Observer(this, uuid)
      this.log("New observer.")
    }
    const player = this.observers[uuid]
    player.ws = ws
    player.online = true
    Object.assign(player, props)
    this.assignPlayer(uuid, player)
    this.syncTree(player)
    this.log("Observer " + player.name + " [" + uuid + "] joined.")
    return this.observers[uuid]
  }
  connectionLeave(uuid) {
    if (!this.observers[uuid]) return
    this.observers[uuid].online = false
    this.observers[uuid].ws = null
    this.observers[uuid].view = null
    if (this.observers[uuid] instanceof Player){
      this.log("Player " + this.observers[uuid].name + " [" + uuid + "] left.")
      this.observers[uuid].sync()
    } else {
      this.log("Observer " + this.observers[uuid].name + " [" + uuid + "] left.")
      this.log("Observer destroy.")
    }
    delete this.observers[uuid]
  }
  resetState() {
    this.currentState = new State()
    this.currentState.onchanged = () => this.syncNode()
    this.currentState.setRootNode({
      data: 'Waiting...', player: 'system', score: 0, status: 'inputing',
      id: 'root', childs: []
    })
    this.currentState.name = "Level " + this.historyStates.length
    this.historyStates.push(this.currentState)
    this.syncTree()
  }
  
  setConfig(config, save = true) {
    this.config = new RoomConfig(config)
    config.applyTo(this)
    if (save) this.saveToFile()
  }
  startGame() {
    this.started = true
    this.gamemode.initState()
    this.syncStatus()
  }
  deconstructed(players){
    const out = []
    for (const uuid in players) {
      out.push({
        name: this.players[uuid].name,
        color: this.players[uuid].color,
        team: this.players[uuid].team.name,
        teamHidden: this.players[uuid].team.hidden,
        teamColor: this.players[uuid].team.color,
        score: players[uuid]
      })
    }
    this.sendAll('deconstructed', {players: out}, true)
  }
  deconstructedTimer(time) {
    this.sendAll('deconstructedTimer', {time}, true)
  }
  nextLevel() {
    this.level++
    this.resetState()
    this.gamemode.initState()
    this.syncStatus()
    this.sendAll('deconstructedHide', true)
  }

  update() {
    if (!this.started) return
    this.gamemode.update()
  }
}

if (roomDir) {
  fs.readdirSync(roomDir).forEach(file => {
    const room = new Room({
      noload: true
    })
    room.load(JSON.parse(fs.readFileSync(roomDir + file)))
    room.log("<< " + roomDir + file)
    rooms[room.id] = room
  })
}

setInterval(() => {
  for (let id in rooms) {
    rooms[id].update()
  }
}, 1000)

exports.rooms = rooms

function getRooms() {
  const ret = {}
  for (let id in rooms) {
    ret[id] = rooms[id].status()
  }
  return ret
}

exports.getRooms = getRooms

function createRoom(name, creator) {
  return new Room({
    name, creator
  })
}

exports.createRoom = createRoom
