let beResponsive = function () {
    let navIcon = document.getElementsByClassName('nav-icon')
    for (let i = 0; i < navIcon.length; ++i) {
        navIcon[i].onclick = function () {
            let e = document.getElementById('nav-ul-id')
            if (e.classname === 'nav-ul') {
                e.className += ' responsive'
            } else {
                e.className = 'nav-ul'
            }
        }
    }
}

window.onload = function () {
    beResponsive()
}