const { Personal } = require('./gamemode')
const fs = require('fs')
const generate = require('./generate')

const gamemodes = {
  'personal': Personal
}

class Preset {
  constructor (data = {}) {
    this.name = 'Preset'
    this.id = 'preset'
    this.levels = 0
    this.entry = []
    Object.assign(this, data)
  }
}

const presets = {}

for (const preset of fs.readdirSync(__dirname + '/../data/preset')) {
  const data = fs.readFileSync(__dirname + '/../data/preset/' + preset)
  const parsed = generate.parsePreset(data)
  presets[parsed.id] = new Preset(parsed)
}

class RoomConfig {
  constructor (data = {}) {
    this.name = 'Room'
    this.password = ''
    this.gamemode = 'personal'
    this.preset = 'default'
    this.levels = 0 // 0 is unlimited
    this.allowJoinWhenStarted = false
    Object.assign(this, data)
  }

  save() {
    return {
      name: this.name,
      password: this.password,
      gamemode: this.gamemode,
      preset: this.preset,
      levels: this.levels,
      allowJoinWhenStarted: this.allowJoinWhenStarted
    }
  }

  schema(){
    return {
      type: 'object',
      title: '房间配置',
      format: 'tabs',
      properties: {
        name: {
          title: '房间名称',
          type: 'string'
        },
        password: {
          title: '房间密码(留空为不设置)',
          type: 'string'
        },
        gamemode: {
          title: '游戏模式',
          type: 'string',
          enum: Object.keys(gamemodes)
        },
        preset: {
          title: '房间预设',
          type: 'string'
        },
        levels: {
          title: '关卡数',
          type: 'number'
        },
        allowJoinWhenStarted: {
          title: '允许在游戏开始后加入',
          type: 'boolean'
        }
      }
    }
  }

  applyTo(room){
    room.gamemode = new gamemodes[this.gamemode](room)
    room.preset = presets[this.preset]
  }
}

module.exports = {
  presets, gamemodes,
  Preset, RoomConfig
}

