const announces = {}
for (let element of document.getElementsByClassName('announce')) {
  announces[element.id] = applyWrapper(element)
}

function applyWrapper(element){
  element.style.animation = 'none';
  const headTitle = element.querySelector('.head > span')
  const unfoldButton = element.querySelector('.head > button')

  const bodyTitle = element.querySelector('.body > .title')
  const foldButton = element.querySelector('.body > button')

  const others = {}

  for (const child of element.querySelector('.body').children){
    if (child in [bodyTitle, foldButton]) continue
    others[child.className] = child
  }

  unfoldButton.addEventListener('click', () => {
    element.style.animation = 'announce-unfold 0.4s ease';
    element.setAttribute('folded', 'false')
    element.addEventListener('animationend', () => {
      element.style.animation = 'none';
    }, {
      once: true
    })
  })
  foldButton.addEventListener('click', () => {
    element.style.animation = '';
    element.setAttribute('folded', 'true')
  })

  function setHeadTitle(title){
    headTitle.innerHTML = title
  }
  function setBodyTitle(title){
    bodyTitle.innerHTML = title
  }
  function show(){
    element.style.animation = '';
    if (element.getAttribute('shown') == 'false')
      element.setAttribute('folded', 'false')
    element.setAttribute('shown', 'true')
  }
  function hide(){
    element.setAttribute('folded', 'true')
    element.setAttribute('shown', 'false')
      element.style.animation = '';
  }

  return {
    setHeadTitle,
    setBodyTitle,
    show,
    hide,
    ...others
  }
}

export default announces
