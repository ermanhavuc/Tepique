document.addEventListener('keydown',press)
function press(e){
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */){
        keyboard.up = true;
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
        keyboard.right = true;
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
        keyboard.down = true;
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */){
        keyboard.left = true;
    }
    if (e.keyCode === 32 /* space */ || e.keyCode == 88 /* x */){
        keyboard.kick = true;
    }
}
document.addEventListener('keyup',release)
function release(e){
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */){
        keyboard.up = false;
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
        keyboard.right = false;
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
        keyboard.down = false;
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */){
        keyboard.left = false;
    }
    if (e.keyCode === 32 /* space */ || e.keyCode == 88 /* x */){
        keyboard.kick = false;
    }
}