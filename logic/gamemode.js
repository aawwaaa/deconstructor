const generate = require('./generate')
const config = require('../config')

class Gamemode {
  constructor(room) {
    this.room = room
  }
  save() {
    return {
      presetData: this.presetData?.save() ?? null
    }
  }
  load(obj) {
    if (!this.presetData) this.presetData = new generate.PresetData(this.room.manager, this.room.preset)
    if (obj.presetData) this.presetData.load(obj.presetData)
  }

  state() {
    return this.room.currentState
  }

  initState() {
    this.presetData = new generate.PresetData(this.room.manager, this.room.preset)
    this.state().setRootNode({
      data: 'Loading...', player: 'system', score: 0, status: 'verifing',
      id: 'root', childs: []
    })
  }
  playerJoin(observer) {
    const { Player } = require("./player")

    const player = new Player(this.room, observer.uuid)
    Object.assign(player, observer)
    return player
  }
  nodeSubmitted(node) {

  }
  update() { }
  chat(observer, message) {}
}

function delay(seconds){
  return new Promise(resolve => setTimeout(resolve, seconds*1000))
}

class Personal extends Gamemode {
  constructor(room) {
    super(room)
    this.name = "个人"
    this.finished = false
  }
  save(obj) {
    return {
      ...super.save(),
      contributions: this.contributions
    }
  }
  load(obj) {
    super.load(obj)
    this.contributions = obj.contributions
    if (this.presetData.current == null)
      if (!this.presetData.generatingProcess && !this.finished)
        setTimeout(() => this.initState())
    setTimeout(() => {
      for (const node of Object.values(this.state().nodes)) {
        if (node.id != 'root' && node.status == 'verifing')
          this.checkNode(Object.values(this.state().nodes).find(a => a.childs.includes(node)), node)
      }
    })
  }
  async initState() {
    super.initState()
    this.contributions = {}
    this.nextTimer = -1
    const current = await this.presetData.pullCurrent()
    if (current == null || (this.room.config.levels != 0 && current.level >= this.room.config.levels)) {
      this.finished = true
      this.state().setRootNode({
        data: '通关!', player: 'system', score: 0, status: 'submitted',
        id: 'root', childs: []
      })
      this.room.syncTree()
      this.room.sendMessage('通关!')
      return
    }
    this.state().setRootNode({
      data: current.problem, player: 'system', score: current.score, status: 'submitted',
      id: 'root', childs: []
    })
    this.room.syncTree()
  }
  nodeSubmitted(parent, node) {
    if (this.presetData.current == null) return
    parent = this.state().nodes[parent]
    this.state().addNode(parent, node)
    this.checkNode(parent, node)
  }
  async checkNode(parent, node) {
    const iter = (node) => {
      if (node.id == 'root') return {
        data: '',
        deltas: []
      }
      const {data, deltas} = iter(Object.values(this.state().nodes).find(a => a.childs.includes(node)))
      return {
        data: data + '\n' + node.data,
        deltas: deltas.concat(node?.secret?.deltas ?? [])
      }
    }
    const {data, deltas} = iter(parent)
    const result = await this.presetData.validate(data, deltas, parent.id == 'root'? 0: parent.score, node.data)
    this.state().updateNode(Object.assign(node, {
      status: 'submitted',
      score: result.score,
      secret: Object.assign({}, node.secret, {
        deltas: result.deltas
      })
    }))
    const player = this.room.players[node.player]
    const delta = result.score - (parent.id == 'root'? 0: parent.score)
    player.score += delta
    player.team.score += delta
    this.contributions[node.player] = (this.contributions[node.player] ?? 0) + result.score
    const per = delta / this.presetData.current.score
    if (per > config.keystepRate) {
      this.room.sendAll('keystep', {
        player: player.name,
        percent: (per * 100).toFixed(2)
      })
    }
    if (result.solved) {
      this.nextTimer = 30
      this.room.deconstructed(this.contributions)
      this.room.deconstructedTimer(this.nextTimer)
    }
  }
  update() {
    if (this.nextTimer != -1) {
      this.nextTimer -= 1
      this.room.deconstructedTimer(this.nextTimer)
      if (this.nextTimer == 0){
        this.room.nextLevel()
        return;
      }
    }
  }
  chat(observer, message) {
    const { Player } = require("./player")
    if (message == '/skip' && observer.hasPermission()) {
      this.nextTimer = 3
      this.room.deconstructed(this.contributions)
      this.room.deconstructedTimer(this.nextTimer)
      return
    }
    if (observer instanceof Player) {
      this.room.sendMessage('[局内]' + observer.name + ": " + message)
      return
    }
    this.room.sendMessage('[观察]' + observer.name + ": " + message, a => !(a instanceof Player))
  }
}

module.exports = {
  Gamemode,
  Personal
}
