const players = document.getElementById('players')
function toggle(){
  if (players.getAttribute('shown') != 'false') players.setAttribute('shown', 'false');
  else players.setAttribute('shown', 'true')
}
document.querySelector('#players-toggle').addEventListener('click', toggle)

const teamElements = {}
const playerElements = {}

function createTeamElement(id, team){
  const teamDiv = document.createElement('div')
  teamDiv.classList.add('team')
  if (!team.hidden) {
    teamDiv.classList.add('non-hidden')
    const teamStatus = document.createElement('div')
    teamStatus.classList.add('team-status')
    teamDiv.appendChild(teamStatus)
    const teamName = document.createElement('span')
    teamName.classList.add('team-name')
    teamStatus.appendChild(teamName)
    const teamScore = document.createElement('span')
    teamScore.classList.add('team-score')
    teamStatus.appendChild(teamScore)
  }
  const teamPlayers = document.createElement('div')
  teamDiv.appendChild(teamPlayers)
  players.appendChild(teamDiv)
  teamElements[id] = teamDiv
  teamPlayers.classList.add('team-players')
}

function updateTeamElement(id, team){
  teamElements[id].style.setProperty('--team-color', team.color)
  if (!team.hidden) {
    teamElements[id].querySelector('.team-name').innerText = team.name
    teamElements[id].querySelector('.team-score').innerText = team.score
  }}

function createPlayerElement(teamPlayers, id, player){
  const playerDiv = document.createElement('div')
  playerDiv.classList.add('player')
  const playerName = document.createElement('span')
  playerName.classList.add('player-name')
  playerDiv.appendChild(playerName)
  const playerScore = document.createElement('span')
  playerScore.classList.add('player-score')
  playerDiv.appendChild(playerScore)
  teamPlayers.appendChild(playerDiv)
  playerElements[id] = playerDiv
  updatePlayerElement(id, player)
}

function updatePlayerElement(id, player){
  playerElements[id].querySelector('.player-name').innerText = player.name
  playerElements[id].querySelector('.player-score').innerText = player.score
  playerElements[id].style.setProperty('--name-color', player.color)
  if (player.online) playerElements[id].classList.add('online')
  else playerElements[id].classList.remove('online')
}

function setPlayerList(teams) {
  const teamIds = Object.keys(teamElements)
  for (const team in teamElements){
    if (!teamIds.includes(team)) {
      teamElements[team].remove()
      delete teamElements[team]
    }
  }
  const playerIds = []
  for (const id in teams){
    if (!teamElements[id]) createTeamElement(id, teams[id])
    updateTeamElement(id, teams[id])
    const teamPlayers = teamElements[id].querySelector('.team-players')
    for (const playerId in teams[id].players){
      const player = teams[id].players[playerId]
      if (!playerElements[playerId]) createPlayerElement(teamPlayers, playerId, player)
      updatePlayerElement(playerId, player)
      playerIds.push(playerId)
    }
  }
  for (const player in playerElements){
    if (!playerIds.includes(player)) {
      playerElements[player].remove()
      delete playerElements[player]
    }
  }
}

export default { setPlayerList, updateTeamElement, updatePlayerElement }
