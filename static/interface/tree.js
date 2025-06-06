import { ArrowManager } from "./arrow.js";

const tree = document.getElementById('tree')
const body = document.getElementById('body')
const arrowManager = new ArrowManager(tree)

window.addEventListener('resize', () => {
  arrowManager.updateAllArrows();
});

const nodes = {}
const forks = []

function moveDomNodeWithAnimation(element, newParent, appendFunc = newParent.appendChild) {
  // 克隆元素用于过渡
  const clone = element.cloneNode(true);
  const rect = element.getBoundingClientRect();
  
  clone.style.position = 'absolute';
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.margin = '0';
  document.body.appendChild(clone);
  
  // 隐藏原元素
  element.style.visibility = 'hidden';
  
  // 实际移动DOM节点
  appendFunc.call(newParent, element);
  
  // 获取新位置
  const newRect = element.getBoundingClientRect();
  
  // 动画克隆元素到新位置
  clone.style.transition = 'all 0.3s ease';
  clone.style.left = newRect.left + 'px';
  clone.style.top = newRect.top + 'px';
  
  // 动画结束后清理
  setTimeout(() => {
    document.body.removeChild(clone);
    element.style.visibility = 'visible';
  }, 1);
  arrowManager.updateArrow()
}

class Fork {
  constructor(parentNode){
    this.parentNode = parentNode
    this.createElement()
    this.subforkElement = this.element
    this.nodes = []
    this.score = 0
    forks.push(this)
  }

  firstNodeChanged(from, to) {
    if (from) {
      arrowManager.removeArrow(from.data.id)
    }
    if (to) {
      const parentRect = this.parentNode.element.getBoundingClientRect()
      const bodyRect = body.getBoundingClientRect()
      const offset = parentRect.bottom - bodyRect.top
      this.element.style.setProperty('--fork-top', offset + 'px')
      arrowManager.createArrow(to.data.id, to.element, this.parentNode.element, {
        arrowSize: 4,
        curveRadius: 5
      })
    }
  }

  appendNode(node){
    node.fork = this
    this.nodes.push(node)
    if (node.element.parentNode != this.element) {
      this.element.appendChild(node.element)
    }
    if (this.nodes[0] == node) {
      this.firstNodeChanged(void 0, node)
    }
  }
  removeNode(node){
    if (this.nodes[0] == node) {
      this.firstNodeChanged(this.nodes[0], this.nodes[1])
    }
    this.nodes = this.nodes.filter(a => a != node)
  }

  swapFork() {
    const parentFork = this.parentNode.fork
    const moveToThis = parentFork.nodes.slice(parentFork.nodes.indexOf(this.parentNode)+1)
    const moveToParent = this.nodes.map(a => a)

    for (let node of moveToParent){
      this.removeNode(node)
      moveDomNodeWithAnimation(node.element, parentFork.element)
      parentFork.appendNode(node)
    }
    for (let node of moveToThis){
      parentFork.removeNode(node)
      moveDomNodeWithAnimation(node.element, this.element)
      this.appendNode(node)
    }

    [this.score, parentFork.score] = [parentFork.score, this.score]
    setTimeout(() => arrowManager.updateAllArrows())
    return parentFork
  }

  createElement(){
    this.element = document.createElement('div')
    this.element.classList.add('column')
    if (this.parentNode.fork?.subforkElement?.nextSibling) {
      body.insertBefore(this.element, this.parentNode.fork.subforkElement.nextSibling)
      this.parentNode.fork.subforkElement = this.element
      setTimeout(() => arrowManager.updateAllArrows())
    } else body.appendChild(this.element)
  }
  remove(){
    for (let node of this.nodes){
      node.remove()
    }
    this.element.remove()
    forks.splice(forks.indexOf(this), 1)
  }
}

class Node {
  constructor(fork, data){
    this.fork = fork
    if (data instanceof Element){
      this.parentNode = this
      this.data = {
        'id': 'root', 'data': 'Data', 'player': 'system',
        'score': 0, 'status': 'inputing', 'childs': []
      }
      this.element = data
      this.dataElement = data.querySelector('.data')
      this.playerElement = data.querySelector('.player')
      this.barElement = data.querySelector('.bar')
      this.selectButton = data.querySelector('.select')
      this.initElement()
      nodes.root = this
      return
    }
    this.parentNode = fork.nodes[fork.nodes.length-1] ?? rootNode
    this.data = data
    this.createElement()
    this.initElement()
    fork.appendNode(this)
    nodes[data.id] = this
    this.updateElement()
  }

  createElement() {
    const element = this.element = document.createElement('div')
    element.classList.add('node')
    
    const dataElement = document.createElement('div')
    dataElement.classList.add('data')
    element.appendChild(dataElement)
    this.dataElement = dataElement

    const status = document.createElement('div')
    status.classList.add('status')
    element.append(status)

    const player = document.createElement('div')
    player.classList.add('player')
    status.appendChild(player)
    this.playerElement = player

    const bar = document.createElement('div')
    bar.classList.add('bar')
    status.appendChild(bar)
    this.barElement = bar

    const selectButton = document.createElement('button')
    selectButton.innerText = '选择'
    selectButton.classList.add('select')
    status.appendChild(selectButton)
    this.selectButton = selectButton
  }

  initElement() {
    this.selectButton.addEventListener('click', () => {
      if (currentSelectedNode) currentSelectedNode.element.classList.remove('selected')
      currentSelectedNode = this
      this.element.classList.add('selected')
    })
  }

  getPrecentage() {
    if (maxScore == 0) return 0.5
    if (this == rootNode) return totalScore / maxScore
    return this.data.score / maxScore
  }
  updateElement() {
    if (this == rootNode) maxScore = this.data.score
    this.element.setAttribute('status', this.data.status)
    this.element.style.setProperty('--team-color', this.data.teamColor)
    this.element.style.setProperty('--name-color', this.data.color)
    this.dataElement.innerText = this.data.data
    this.playerElement.innerText = this.data.player
    this.barElement.style.setProperty('--bar-value', this.getPrecentage())
    this.barElement.innerText = Math.round(this.getPrecentage() * 100) + "%"
    this.barElement.style.visibility = this.data.status == 'submitted'? 'visible': 'hidden'
    this.selectButton.style.visibility = this.data.status == 'submitted'? 'visible': 'hidden'
  
    if (this != rootNode && this.data.score > this.fork.score) {
      this.fork.score = this.data.score
      while (this.fork.score > this.fork.parentNode.data.score) {
        if (this.fork.parentNode == rootNode) break
        this.fork.swapFork()
      }
      if (this.fork.score > totalScore) {
        totalScore = this.fork.score
        rootNode.updateElement()
        moveDomNodeWithAnimation(this.fork.element, body,
          (a) => body.insertBefore(a, body.firstElementChild))
        setTimeout(() => arrowManager.updateAllArrows())
      }
    }
  }

  remove() {
    this.fork.removeNode(this)
    delete nodes[this.data.id]
    this.element.remove()
    if (this == currentSelectedNode) {
      currentSelectedNode = rootNode
    }
  }
}

const rootElement = document.getElementById('root')
const rootNode = new Node(null, rootElement)
let currentSelectedNode = rootNode
let totalScore = 0, maxScore = 0

function reset() {
  for (let node in nodes) {
    if (node == 'root') continue
    nodes[node].remove()
  }
  while (forks.length != 0) forks[0].remove()
  currentSelectedNode = rootNode
  totalScore = 0
  maxScore = 0
  arrowManager.removeAllArrows()
}

function loadTree(tree) {
  reset()
  rootNode.data = tree
  rootNode.updateElement()
  function iter(parent, data){
    let fork = new Fork(parent)
    do {
      if (fork.nodes.length == 0)
        fork.remove()
      if (fork.nodes[fork.nodes.length-1] != parent)
        fork = new Fork(parent)
      parent = new Node(fork, data)
      for (let i=1; i<data.childs.length; i++)
        iter(parent, data.childs[i])
    } while (data = data.childs[0])
    if (fork.nodes.length == 0)
      fork.remove()
  }
  for (let child of tree.childs) {
    iter(rootNode, child)
  }
  MathJax.typeset();
}

function updateNode(id, data) {
  if (!nodes[id]) {
    const parent = nodes[data.parent]
    if (parent.fork && parent.fork.nodes[parent.fork.nodes.length-1] == parent) {
      new Node(parent.fork, data)
    } else {
      const fork = new Fork(parent)
      new Node(fork, data)
    }
    return
  }
  const element = nodes[id]
  if (data == null) {
    element.remove()
    return
  }
  element.data = data
  element.updateElement()
  if (element.data.player == localStorage.getItem('playerName') && element.data.status == "submitted"){
    if (currentSelectedNode) currentSelectedNode.element.classList.remove('selected')
    element.element.classList.add('selected')
    currentSelectedNode = element
  }
  MathJax.typeset();
}

function getSelected() {
  return currentSelectedNode.data.id
}

export default {reset, loadTree, updateNode, getSelected}

