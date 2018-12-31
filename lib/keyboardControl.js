document.addEventListener('keydown',press)
function press(e){
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */){
        keyboard.setUp(true);
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
        keyboard.setRight(true);
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
        keyboard.setDown(true);
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */){
        keyboard.setLeft(true);
    }
}
document.addEventListener('keyup',release)
function release(e){
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */){
        keyboard.setUp(false);
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
        keyboard.setRight(false);
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
        keyboard.setDown(false);
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */){
        keyboard.setLeft(false);
    }
}