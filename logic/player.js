const { randomUUID } = require('crypto')
const { RoomConfig } = require("./config")

class Observer {
  constructor(room, uuid) {
    this.room = room
    this.uuid = uuid
    this.color = '#a0a0a0'
    this.name = "Player"
    this.online = false
    this.view = null
    this.ws = null
    this.handler = {
      join: this.join,
      chat: this.chat,
    }

    if (this.hasPermission()) Object.assign(this.handler, {
      getRoomConfig: this.getRoomConfig,
      setRoomConfig: this.setRoomConfig,

      startGame: this.startGame
    })
  }
  save() {
    return {
      uuid: this.uuid,
      name: this.name,
      view: this.view,
      color: this.color
    }
  }
  load(obj) {
    this.uuid = obj.uuid
    this.name = obj.name
    this.view = obj.view
    this.color = obj.color
    return this
  }
  
  log(...args) {
    this.room.log("Observer[" + this.uuid + "]", ...args)
  }
  send(type, obj = {}){
    if (!this.ws || !this.online) return
    this.ws.send(type, obj)
  }
  status() {
    return {
      name: this.name,
      type: "observer",
      online: this.online,
      color: this.color
    }
  }
  hasPermission() {
    return this.uuid == this.room.creator
  }
  syncStatus() {
    this.send("status", Object.assign(this.status(), {
      level: this.room.level,
      started: this.room.started,
      allowJoinWhenStarted: this.room.config.allowJoinWhenStarted,
      hasPermission: this.hasPermission()
    }))
  }

  join() {
    if (this.room.started && !this.room.config.allowJoinWhenStarted)
      return
    delete this.handler
    const player = this.room.gamemode.playerJoin(this)
    player.log("Player join.")
    this.room.assignPlayer(this.uuid, player)
  }
  chat({message}) {
    this.log("Chat:", message)
    this.room.gamemode.chat(this, message)
  }

  getRoomConfig() {
    this.send('config', {
      schema: this.room.config.schema(),
      data: this.room.config
    })
  }
  setRoomConfig(config) {
    if (this.room.started) return
    config = new RoomConfig(config)
    this.room.setConfig(config)
  }
  startGame() {
    this.room.startGame()
  }
}

class Player extends Observer {
  constructor(room, uuid) {
    super(room, uuid)
    this.team = null
    this.score = 0
    this.handler = Object.assign(this.handler, {
      join: this.join,
      input: this.input
    })
  }
  save() {
    return Object.assign(super.save(), {
      score: this.score
    })
  }
  load(obj) {
    super.load(obj)
    this.score = obj.score
    return this
  }

  join() {
    if (this.room.started) return
    const player = new Observer(this.room, this.uuid)
    delete this.handler
    Object.assign(player, this)
    this.log("Player exit.")
    this.room.assignPlayer(this.uuid, player)
  }
  sync() {
    this.room.sendAll('player', {id: this.uuid.substring(0, 8), data: this.status()})
  }
  log(...args) {
    this.room.log("Player[" + this.uuid + "]", ...args)
  }
  status() {
    return Object.assign(super.status(), {
      type: "player",
      score: this.score
    })
  }
  input({parent, data}){
    this.log("Inputed a data as child of " + parent + ":", data)
    const node = {
      data, player: this.uuid, score: 0, status: 'verifing',
      id: randomUUID(), childs: []
    }
    this.room.gamemode.nodeSubmitted(parent, node)
  }
}

class Team {
  constructor(room, name) {
    this.room = room
    this.id = randomUUID()
    this.name = name
    this.score = 0
    this.hidden = false
    this.autoDestroy = false
    this.creator = null
    this.players = []
    this.color = '#a0a0a0'
    this.password = ''
  }

  status() {
    return {
      name: this.name,
      score: this.score,
      hidden: this.hidden,
      creator: this.creator.substring(0, 8),
      color: this.color,
      players: Object.fromEntries(this.players.map(a => [a.uuid.substring(0, 8), a.status()]))
    }
  }

  save() {
    return {
      id: this.id,
      name: this.name,
      score: this.score,
      hidden: this.hidden,
      autoDestroy: this.autoDestroy,
      players: this.players.map(a => a.uuid),
      creator: this.creator,
      color: this.color,
      password: this.password
    }
  }
  load(obj) {
    this.id = obj.id
    this.name = obj.name
    this.score = obj.score
    this.hidden = obj.hidden
    this.autoDestroy = obj.autoDestroy
    this.players = obj.players.map(a => this.room.players[a]).filter(a => a)
    this.players.forEach(a => a.team = this)
    this.creator = obj.creator
    this.color = obj.color
    this.password = obj.password
    return this
  }
  sync() {
    this.room.sendAll('team', {id: this.id, data: this.status()})
  }

  getConfig() {
    return {
      name: this.name,
      creator: this.creator,
      color: this.color,
      password: this.password
    }
  }
  setConfig(config) {
    this.name = config.name
    this.creator = config.creator
    this.color = config.color
    this.password = config.password
  }

  addPlayer(player) {
    if (player.team) player.team.removePlayer(player)
    player.team = this
    this.players.push(player)
  }
  removePlayer(player) {
    this.players.splice(this.players.indexOf(player), 1)
    player.team = null
  }
}

module.exports = {
  Player,
  Observer,
  Team
}
