const canvas = createCanvas();
let ctx = canvas.getContext('2d');
let cX = canvas.width/2;
let cY = canvas.height/2;

let earth = new Celestial_Object(cX,cY,10);
let sats = [];

let sat = new Celestial_Object(
    0,0,5,
    new Orbit(
        earth,
        250,
        25,
        69,
        12,
        24,
    )
);
sats.push(sat);

sat = new Celestial_Object(
    0,0,5,
    new Orbit(
        earth,
        150,
        50,
        270,
        12,
        24,
    )
);
sats.push(sat);

sat = new Celestial_Object(
    0,0,5,
    new Orbit(
        earth,
        200,
        69,
        180,
        12,
        24,
    )
);
sats.push(sat);

let pointer = {'x': 0, 'y': 0,'r': 4, 'click': 0, 'select': false, 'active': true};

canvas.onmousemove = function (e) {
    if (pointer.active) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    }
}
canvas.onmousedown = function () {
    pointer.click++;
    setTimeout(function () {
        pointer.click = 0;
    },350);
}

let then = 0;
function loop(time) {
    let timeInSec = time * 0.001;
    let deltaTime = timeInSec - then;
    then = timeInSec;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for (let sat of sats) {
        let position = sat.orbit.calcPosition(timeInSec, deltaTime);
        sat.x = position.x;
        sat.y = position.y;
        sat.draw(ctx);

        let detections = [];
        if (sat.detectPointer(pointer)) {
            detections.push(0);
            sat.orbit.draw(ctx);
            if (pointer.click === 1 && !sat.selected) {
                pointer.click = 0;
                pointer.select.selected = false;
                pointer.select = sat;
                sat.selected = true;
            }
        }
        if (
            detections.length === 0
            && pointer.click === 1
            && pointer.select
            && !pointer.select.orbit.show(ctx, 0, pointer)
        ) {
            pointer.select.selected = false;
            pointer.select = false;
            pointer.active = true;
        }

        if (sat.selected) {
            sat.orbit.draw(ctx);
            sat.orbit.show(ctx, timeInSec, pointer);
            if (pointer.click === 1) {
                pointer.click = 0;
                pointer.active = !pointer.active;
            }
        }
    }

    earth.draw(ctx);

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
