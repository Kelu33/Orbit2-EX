
/**
 * return a number >= 0 and < max (ex: dice(3) return 0, 1 or 2)
 * @param max
 * @returns {number}
 */
function dice(max) {
    return Math.floor(Math.random() * max);
}

/**
 * return true if nb is even
 * @param nb
 * @returns {boolean}
 */
function isEven(nb) {
    return nb % 2 === 0;
}

/**
 * convert given nb of kilometers to meters
 * @param nb
 * @returns {number}
 */
function kmToM(nb) {
    return 1000 * nb;
}

/**
 * convert given nb of astronomical units to meters
 * @param nb
 * @returns {number}
 */
function uaToM(nb) {
    return 150000000000 * nb;
}

/**
 * convert years to seconds
 * @param years
 * @returns {number}
 */
function yearsToSec(years) {
    return years * 31536000;
}

/**
 * convert degrees to radians
 * @param degrees
 * @returns {number}
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI/180);
}

/**
 * convert radians to degrees
 * @param radians
 * @returns {number}
 */
function radiansToDegrees(radians) {
    return radians * (180/Math.PI);
}

/**
 *
 * @param nb
 * @param fullscreen
 * @returns {HTMLCanvasElement|*[]|boolean}
 */
function createCanvas(nb = 1, fullscreen = true) {
    if (nb === 1) {
        const newCanvas = document.createElement('canvas');
        newCanvas.style.position = 'absolute';
        if (fullscreen) {
            newCanvas.width = window.innerWidth;
            newCanvas.height = window.innerHeight;
        }
        newCanvas.style.zIndex = '0';
        document.body.appendChild(newCanvas);
        return newCanvas;
    } else if (nb > 1) {
        let layers = [];
        for (let i = 0; i < nb; i++) {
            let newCanvas = document.createElement('canvas');
            newCanvas.style.position = 'absolute';
            if (fullscreen) {
                newCanvas.width = window.innerWidth;
                newCanvas.height = window.innerHeight;
            }
            newCanvas.style.zIndex = '"' + i + '"';
            document.body.appendChild(newCanvas);
            layers.push(newCanvas);
        }
        console.log(nb + ' canvas created');
        return layers;

    } else {
        console.log('please define a nb of canvas >= 1');
        return false;
    }
}

/**
 *
 * @param ctx
 */
function clearCanvas(ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.restore();
}

/**
 *
 * @param objectA
 * @param objectB
 * @returns {number}
 */
function calcDistance(objectA, objectB) {
    return Math.sqrt(
        Math.pow(objectA.x - objectB.x, 2)
        + Math.pow(objectA.y - objectB.y, 2)
    )
}