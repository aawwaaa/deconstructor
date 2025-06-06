import input from "./interface/input.js";
import tree from "./interface/tree.js";
import popup from "./interface/popup.js";
import chat from "./interface/chat.js";
import players from "./interface/players.js";
import websocket from "./websocket.js";
import actions from "./interface/actions.js";
import announces from "./interface/announce.js";

const ws = websocket.connect("/api/room/" + localStorage.getItem("room"), {
  uuid: localStorage.getItem("uuid"),
  name: localStorage.getItem("playerName"),
  password: localStorage.getItem("password"),
  color: localStorage.getItem("color"),
});

actions.websocket(ws);
chat.websocket(ws);

const handler = ws.handler;
const networkAnnounce = announces.network;

handler.connecting = () => {
  networkAnnounce.setHeadTitle("连接中");
  networkAnnounce.setBodyTitle("连接中");
  networkAnnounce.show();
};
handler.reconnectWaiting = (timeout) => {
  networkAnnounce.setHeadTitle("等待重连中... " + timeout);
  networkAnnounce.setBodyTitle("等待重连中... " + timeout);
  networkAnnounce.show();
};
handler.reconnectFailed = () => {
  popup.set("重连失败，请刷新页面");
  popup.show();
};

handler.established = () => {
  networkAnnounce.setHeadTitle("等待数据中");
  networkAnnounce.setBodyTitle("等待数据中");
};
handler.unparsedData = (data) => {
  console.log(data);
};
handler.error = ({ error }) => {
  popup.set("出现错误: \n" + error + "\n请尝试刷新页面");
  popup.show();
  ws.close();
};

handler.playerList = (data) => {
  players.setPlayerList(data);
};
handler.team = ({ id, data }) => {
  players.updateTeamElement(id, data);
};
handler.player = ({ id, data }) => {
  players.updatePlayerElement(id, data);
};
handler.node = ({ id, node }) => {
  tree.updateNode(id, node);
};
handler.tree = (data) => {
  tree.loadTree(data);
  networkAnnounce.hide();
};
handler.statesList = ({ states }) => {
  console.log(states);
};
handler.status = (data) => {
  actions.status(data);
};
handler.chat = ({ message }) => {
  chat.addMessage(message);
};
handler.keystep = (data) => {
  const announce = announces.keystep;
  announce.setHeadTitle("关键一步");
  announce.setBodyTitle("关键一步");
  announce.content.innerText = `玩家 ${data.player} 做出了关键一步, 推动了 ${data.percent}% 的进度`;
  announce.show();
  setTimeout(() => announce.hide(), 5000);
};
handler.deconstructed = (data) => {
  const announce = announces.deconstructed;
  announce.setBodyTitle("解构!");
  const rank = announce.rank;
  let html = "";
  for (const {
    name,
    color,
    team,
    teamHidden,
    teamColor,
    score,
  } of data.players) {
    html += `
    <div class="player" style="--name-color: ${color}; --team-color: ${teamColor};">
      <div>
        ${teamHidden ? "" : `<span class="player-team">${team}</span>`}
        <span class="player-name">${name}</span>
      </div>
      <span class="player-score">${score}</span>
    </div>
`;
  }
  rank.innerHTML = html;
  announce.show();
};
handler.deconstructedTimer = (data) => {
  const announce = announces.deconstructed;
  const value = `下一关卡将于 ${data.time} 秒后开始`;
  announce.setHeadTitle("解构! " + value);
  announce.subtitle.innerText = value;
};
handler.deconstructedHide = () => {
  const announce = announces.deconstructed;
  announce.hide();
};

input.addSubmitHandler((data) => {
  ws.send("input", {
    parent: tree.getSelected(),
    data,
  });
});
