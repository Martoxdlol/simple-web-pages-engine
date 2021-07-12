const nav = document.getElementsByTagName('nav')[0]
const ul = document.getElementById('nav-ul')
const video = document.getElementById('landing-video')
const videoPlayer = document.getElementById('video')

let show = false
let fixed = false


window.addEventListener('scroll', function(e){
  if(window.scrollY > 1 && !show){
    nav.classList.toggle('nav-fixed-show')
    nav.classList.toggle('nav-fixed')
    show = true
  }else if(window.scrollY == 0 && show){
    nav.classList.toggle('nav-fixed-show')
    nav.classList.toggle('nav-fixed')
    show = false
  }
})

document.getElementById('menu-btn').addEventListener('click', function(e){
  ul.classList.toggle('show-menu')
})

document.getElementById('play-button').addEventListener('click', function(e){
  if(!videoPlayer.paused){
    videoPlayer.pause()
  }else{
    videoPlayer.play()
  }
})
