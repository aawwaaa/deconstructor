const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');

// 显示模态弹窗
function showModal() {
    modal.style.display = 'flex';
}

// 隐藏模态弹窗
function hideModal() {
    modal.style.display = 'none';
}

// 设置模态弹窗内容
function setContent(content) {
    modalContent.innerText = content;
    modalContent.innerHTML += `<br/>
<a href="./interface.html">刷新</a><br/>
<a href="./index.html">返回房间列表</a>
`
}

export default {show: showModal, hide: hideModal, set: setContent}
