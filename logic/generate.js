const libxmljs = require('libxmljs')

function parseProblem(content){
  content = content.toString()
  const lines = content.split('\n')
  const output = {}
  let buffer = []
  let current = null
  function endCurrent() {
    if (!current) return
    output[current[0]] = buffer.join('\n')
    buffer = []
    current = null
  }
  for (let line of lines) {
    if (!line.startsWith('%')) {
      buffer.push(line)
      continue;
    }
    const [command, ...args] = line.replace('%', '').trim().split(' ')
    switch (command) {
      case 'rem':
        break
      case 'think':
      case 'problem':
      case 'solution':
      case 'hint':
        endCurrent()
        current = [command]
        break
      case 'end':
        endCurrent()
        break
      default:
        console.log('preset parse error: ', output.name, ': unknown command: ', command)
        break
    }
  }
  endCurrent()
  return output
}

const scores = {
  '由题得': 'ignore',
  '已知': 'ignore',
  '定义': 20,
  '公理': 20,
  '定理': 20,
  '证得': 30,
  '作图': 30,
  '假设': 50,
  '合并': 50,
  '代入': 10,
  '化简': 20,
  '证明': 20,
  '推理': 20,
  '验证': 'ignore',
  '答案': 100,
}
function parseSolution(content){
  content = content.toString()
  const lines = content.split('\n')
  const output = {}
  let buffer = []
  let totalScore = 0
  for (let line of lines) {
    if (!line.startsWith('%')) {
      buffer.push(line)
      continue;
    }
    const [command, ...args] = line.replace('%', '').trim().split(' ')
    if (command == 'rem') continue;
    const score = scores[command] ?? 'ignore'
    if (score != 'ignore') {
      const newLine = command + ' ' + args.join(' ') + ' 本步骤分数=' + score
      buffer.push(newLine)
      totalScore += score
    } else {
      buffer.push(line.replace('%', '').trim())
    }
  }
  buffer.push("% 本题总分=" + totalScore)
  return {
    solution: buffer.join('\n'),
    score: totalScore
  }
}

function parseScore(content){
  content = content.toString()
  const lines = content.split('\n')
  const output = {}
  const deltas = []
  const subproblems = {}
  let buffer = []
  let current = null
  let scoreSum = 0
  function endCurrent() {
    if (!current) return
    if (current[0] == 'score-delta') {
      deltas.push({
        score: current[1],
        reference: buffer.filter(line => line.startsWith('>')).map(a => a.substring(2)).join('\n'),
        reason: buffer.filter(line => !line.startsWith('>')).join('\n')
      })
      scoreSum += current[1]
    }
    buffer = []
    current = null
  }
  for (let line of lines) {
    if (!line.startsWith('%')) {
      buffer.push(line)
      continue;
    }
    const [rawCommand, ...args] = line.replace('%', '').trim().split(' ')
    const [command, ...values] = rawCommand.split('=')
    const value = values.pop() ?? ''
    switch (command) {
      case 'rem':
        break
      case 'score-delta':
        current = [command, parseInt(value)]
        break
      case 'score-delta-sum':
        output.scoreDelta = parseInt(value)
        break;
      case 'sub-problem':
        subproblems[args[0]] = args[1] == 'true'
        break
      case 'all-solved':
        output.solved = value == 'true'
        break
      case 'score':
        endCurrent()
        output.score = parseInt(value)
      case 'end':
        endCurrent()
        break
      default:
        console.log('preset parse error: ', output.name, ': unknown command: ', command)
        break
    }
  }
  endCurrent()
  return Object.assign(output, {
    deltas,
    subproblems
  })
}

function parsePreset(content){
  content = content.toString()
  const lines = content.split('\n')
  const output = {}
  const entry = []
  const definition = {}
  let buffer = []
  let current = null
  function endApply() {
    const [_, name, old, oldBuffer] = current
    const string = buffer.join('\n')
    const pattern = "{{" + name + "}}"
    const replaced = oldBuffer.map(a => a.replace(pattern, string))
    buffer = reaplced
    current = old
  }
  function endCurrent() {
    if (!current) return
    if (current[0] == 'apply') endApply()
    switch(current[0]) {
      case 'define':
        definition[current[1]] = buffer.join('\n')
        break
      case 'entry':
        entry.push({
          'type': current[1],
          'repeat': current[2],
          'data': buffer.join('\n')
        })
        break
    }
    buffer = []
    current = null
  }
  for (let line of lines) {
    if (!line.startsWith('%')) {
      buffer.push(line)
      continue;
    }
    const [command, ...args] = line.replace('%', '').trim().split(' ')
    switch (command) {
      case 'name':
        output.name = args.join(' ')
        break
      case 'id':
        output.id = args.join(' ')
        break
      case 'levels':
        output.levels = parseInt(args.join(' '))
        break
      case 'set':
        output[args[0]] = args.slice(1).join(' ')
        break
      case 'define':
        endCurrent()
        current = ['define', args.join(' ')]
        break
      case 'entry':
        endCurrent()
        current = ['entry', args[0], parseInt(args[1] ?? 1)]
        break
      case 'use':
        if (!definition[args.join(' ')])
          console.log('preset parse error: ', output.name, ': unknown definition: ', args.join(' '))
        buffer.push(definition[args.join(' ')])
        break
      case 'apply':
        if (current && current[0] == 'apply') endApply()
        current = ['apply', args.join(' '), current, buffer]
        buffer = []
        break
      case 'end':
        endCurrent()
        break
      default:
        console.log('preset parse error: ', output.name, ': unknown command: ', command)
        break
    }
  }
  endCurrent()
  return Object.assign(output, {
    entry
  })
}

class PresetData {
  constructor(manager, preset) {
    this.manager = manager
    this.preset = preset
    this.repeats = preset.entry.map(a => a.repeat)

    this.current = null
    this.buffer = null

    this.generatingProcess = null
  }

  save() {
    return {
      repeats: this.repeats,
      current: this.current,
      buffer: this.buffer
    }
  }

  load(data) {
    this.repeats = data.repeats
    this.current = data.current
    this.buffer = data.buffer
  }

  async catch(func){
    let tries = 0
    while (tries++ < 5) {
      try {
        return await func()
      } catch (e) {
        console.log(e)
      }
    }
    throw new Error('failed to generate')
  }

  async startGenerating() {
    if (this.generatingProcess) return
    if (this.current && this.buffer) return
    const beginTime = Date.now()
    const available = this.repeats.map((a, i) => a>0? i: -1).filter(a => a != -1)
    if (available.length == 0) return
    const index = available[Math.floor(Math.random() * available.length)]
    const entry = this.preset.entry[index]
    let result = entry.data, hint = void 0
    if (entry.type == 'generate') {
      const ret = await this.catch(async () => {
        this.generatingProcess = this.manager.createProcess('generate', entry.data)
        const ret = await this.generatingProcess.run()
        return parseProblem(ret)
      })
      result = ret.problem
      hint = ret.hint
    }
    let {score, solution} = await this.catch(async () => {
      this.generatingProcess = this.manager.createProcess('solve', result + (hint ?? ''))
      const ret = await this.generatingProcess.run();
      return parseSolution(ret)
    })
    const data = {
      problem: result,
      solution,
      score
    }
    if (this.current) this.buffer = data
    else {
      this.current = data
      this.startGenerating() // throw it away
    }
    this.generatingProcess = null
    this.repeats[index] --
    const deltaTime = Date.now() - beginTime
    console.log(`Generated in ${Math.round(deltaTime/1000)}s`)
  }
  async pullCurrent() {
    if (!this.current) {
      await this.startGenerating()
      return this.current
    }
    this.current = this.buffer
    this.buffer = null
    this.startGenerating()
    return this.current
  }
  async validate(verified, deltas, verifiedScore, data) {
    const beginTime = Date.now()
    const payload = `
% problem
${this.current.problem}
% reference-solution
${this.current.solution}
% data-verified
${verified} 
${deltas.map(a => `
% score-verified-delta=${a.score}
${a.reason}
`)}
% score-verified=${verifiedScore}
% data-to-be-verified(user-input)
${data}
`
    const ret = await this.catch(() => this.manager.createProcess('validate', payload).run())
    const deltaTime = Date.now() - beginTime
    console.log(`Validated in ${Math.round(deltaTime/1000)}s`)
    return parseScore(ret)
  }
}

module.exports = {
  parsePreset,
  PresetData
}
