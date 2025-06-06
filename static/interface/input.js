function updateInputPosition() {
  const keyboard = document.querySelector('div.ML__keyboard');
  const input = document.getElementById('input');

  setTimeout(() => {
    if (keyboard) {
      // 获取键盘的 `--_keyboard-height` 值
      const keyboardHeight = getComputedStyle(keyboard).getPropertyValue('--_keyboard-height');
      input.style.bottom = "calc( " + keyboardHeight + " + 15px )"; // 应用到 #input
    } else {
      input.style.bottom = null; // 默认值
    }
  })
}

// 监听键盘出现/消失（MutationObserver 或事件监听）
new MutationObserver(updateInputPosition).observe(document.body, {
  childList: true,
  subtree: true,
});

// 初始检查
updateInputPosition();

const input = document.getElementById('input')
function toggle(){
  if (input.getAttribute('shown') != 'false') input.setAttribute('shown', 'false');
  else input.setAttribute('shown', 'true')
}
document.querySelector('#input > #close').addEventListener('click', toggle)
document.querySelector('#input + button').addEventListener('click', toggle)

const defaultValue = '\\displaylines{}'

function displaylines2normal(text){
  return text.replace(/\\displaylines\{(.*)\}/g, (_, match) => match.replace(/\\\\ (\n)?/g, "\n"))
}
function normal2displaylines(text){
  return '\\displaylines{' + text.replace(/\n/g, '\\\\ \n') + '}'
}

function toggleMode(){
  if (input.getAttribute('mode') == 'math'){
    input.setAttribute('mode', 'text');
    textarea.value = displaylines2normal(mathField.value)
  }
  else {
    input.setAttribute('mode', 'math')
    mathField.value = normal2displaylines(textarea.value)
  }
}
document.querySelector('#toggle-mode').addEventListener('click', toggleMode)

const submit = document.getElementById('submit')
const mathField = input.querySelector('math-field')
const textarea = input.querySelector('textarea')
mathField.value = defaultValue
textarea.value = ''
function addSubmitHandler(handler) {
  submit.addEventListener('click', () => {
    const value = input.getAttribute('mode') == 'math'?
      mathField.value : normal2displaylines(textarea.value)
    handler("$" + value + "$")
    setTimeout(() => {
      mathField.value = defaultValue
      textarea.value = ''
    })
  })
}

export default {addSubmitHandler}
