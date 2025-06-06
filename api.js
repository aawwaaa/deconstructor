const express = require('express');
const expressWs = require('express-ws');

const websocket = require('./websocket')
const logic = require('./logic/logic')
const ai = require('./logic/ai')

const api = express.Router()
expressWs(api)

api.get('/room', (req, res) => {
  res.send(logic.getRooms())
  res.end()
})
api.ws('/room/:id', handle_websocket);
api.get('/room/by-name/:name', (req, res) => {
  const name = req.params.name
  for (let id in logic.rooms) {
    if (logic.rooms[id].name == name){
      const obj = {}
      obj[id] = logic.rooms[id]
      res.send(obj)
      res.end()
      return
    }
  }
  res.status(404)
  res.end()
})
api.post('/room/by-name/:name', (req, res) => {
  const name = req.params.name
  const {uuid} = req.body
  const room = logic.createRoom(name, uuid)
  res.status(201)
  const obj = {}
  obj[room.id] = room.status()
  res.send(obj)
  res.end()
})
api.get('/room/:id', (req, res) => {
  const id = req.params.id
  if (id in logic.rooms) {
    res.send(logic.rooms[id])
    res.end()
    return
  }
  res.status(404)
  res.end()
})
api.delete('/room/:id', (req, res) => {
  const id = req.params.id
  if (id in logic.rooms) {
    const room = logic.rooms[id]
    const {uuid} = req.body
    if (uuid != room.creator){
      res.status(304).end()
      return
    }
    room.delete()
    res.status(204).end()
    return
  }
  res.status(404)
  res.end()
})

function handle_websocket(socket, req) {
  const wrapped = websocket.wrapper(socket)
  wrapped.handler.init = ({uuid, name, password, color}) => {
    const id = req.params.id
    if (!(id in logic.rooms)) {
      wrapped.send('error', {'error': '未知房间id: ' + id})
      wrapped.close()
      return
    }
    const room = logic.rooms[id]
    if (room.config.password.length != 0) {
      if (password != room.config.password){
        wrapped.send('error', {'error': '密码错误'})
        wrapped.close()
        return
      }
    }
    room.connectionJoin(uuid, {
      name: name,
      color: color
    }, wrapped)
    wrapped.handler.closed = () => room.connectionLeave(uuid)
    wrapped.handler.error = (error) => {
      console.error(error)
      room.connectionLeave(uuid)
    }
  }
}

api.ws('/manager/:id', function(socket, req) {
  const wrapped = websocket.wrapper(socket)
  const id = req.params.id
  wrapped.handler.init = ({token}) => {
    if(!ai.getManager(id)){
      wrapped.send('error', {'error': '未知manager id: ' + id})
      wrapped.close()
      return
    }
    const managerToken = ai.getManager(id).token
    if (!managerToken || managerToken != token){
      wrapped.send('error', {'error': 'token错误'})
      wrapped.close()
      return
    }
    ai.getManager(id).addSocket(wrapped)
  }
})

module.exports = api
