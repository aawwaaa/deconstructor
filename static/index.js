function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

if (localStorage.getItem("uuid") == null){
  localStorage.setItem("uuid", generateUUID())
}

const playerName = document.getElementById('player-name')
playerName.value = localStorage.getItem('playerName') || ''
playerName.addEventListener('change', () => {
  localStorage.setItem('playerName', playerName.value)
})

const playerColor = document.getElementById('player-color')
playerColor.value = localStorage.getItem('color') || ''
playerColor.addEventListener('change', () => {
  localStorage.setItem('color', playerColor.value)
})

let rooms = {}

// DOM elements
const roomsContainer = document.getElementById('rooms');
const lengthDisplay = document.getElementById('length');
const createButton = document.getElementById('create');
const refreshButton = document.getElementById('refresh');

function refreshRooms() {
  roomsContainer.innerHTML = '加载中...';
  fetch('/api/room').then(r => r.json()).then(r => {
    rooms = r
    renderRooms()
  })
}

// Function to render rooms
function renderRooms() {
  roomsContainer.innerHTML = '';
  lengthDisplay.textContent = `共有 ${Object.keys(rooms).length} 个房间`;
  const uuid = localStorage.getItem('uuid')
  
  for (const [id, room] of Object.entries(rooms)) {
    const roomElement = document.createElement('div');
    roomElement.className = 'room';

    const info = `${room.hasPassword && "🔒" || ''}${room.started && "🏁" || ''}`
      + `${room.gamemode} | ${room.players} 个玩家`
      + ` | ${room.preset}[${room.level}]`;
    
    roomElement.innerHTML = `
      <span class="name">${room.name}</span>
      <div class="status">
        <span class="info">${info}</span>
        <span class="id">${id.substring(0, 8)}</span>
        <div class="buttons">
          ${uuid.startsWith(room.creator)? `<button class="delete">删除</button>`: ``}
          <button class="join">加入</button>
        </div>
      </div>
    `;

    const deleteButton = roomElement.querySelector('.delete');
    const target = id;
    if (deleteButton)
      deleteButton.addEventListener('click', () => {
        fetch(`/api/room/${target}`, {
          method: 'DELETE',
          body: JSON.stringify({uuid: localStorage.getItem('uuid')}),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(r => {
          refreshRooms()
        })
      })
    
    // Add join event listener
    const joinButton = roomElement.querySelector('.join');
    joinButton.addEventListener('click', () => {
      if (room.hasPassword) {
        localStorage.setItem('password', prompt('请输入密码'))
      }
      localStorage.setItem('room', id)
      location.href = '/interface.html'
    });
    
    roomsContainer.appendChild(roomElement);
  }
}

// Event listeners
createButton.addEventListener('click', () => {
  const playerName = localStorage.getItem('playerName');
  fetch(`/api/room/by-name/${encodeURIComponent(playerName+'的房间')}`, {
    method: 'POST',
    body: JSON.stringify({uuid: localStorage.getItem('uuid')}),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(r => {
    refreshRooms()
  })
});

refreshButton.addEventListener('click', () => {
  refreshRooms()
});

refreshRooms()
