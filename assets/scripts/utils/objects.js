class Celestial_Object {
    constructor(
        x,y,r,
        orbit = null
    ) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.orbit = orbit;
        this.selected = false;
    }
    draw(ctx) {
        ctx.fillStyle = 'rgb(0,0,255)';
        ctx.beginPath();
        ctx.arc(
            this.x, this.y, this.r,
            0, 2 * Math.PI);
        ctx.fill();

        /*if (this.orbit && orbit) {
            this.orbit.draw(ctx);
        }*/
    }
    detectPointer(pointer) {
        let d = calcDistance(pointer, this);
        return d < 25;
    }
}

class Orbit {
    constructor(focus,apogee,perigee,orientation,timeToApogee,period) {
        this.focus = focus;
        this.apogee = apogee;
        this.perigee = perigee;
        this.orientation = orientation;
        this.timeToApogee = timeToApogee;
        this.period = period;
        this.start = this.timeToApogee;
    }
    getApses() {
        let Ax = this.apogee
            * Math.cos(degreesToRadians(this.orientation))
            + this.focus.x;
        let Ay = this.apogee
            * Math.sin(degreesToRadians(this.orientation))
            + this.focus.y;
        let Px = this.perigee
            * Math.cos(degreesToRadians(this.orientation + 180))
            + this.focus.x;
        let Py = this.perigee
            * Math.sin(degreesToRadians(this.orientation + 180))
            + this.focus.y;
        let Cx = this.a/2
            * Math.cos(degreesToRadians(this.orientation))
            + Px;
        let Cy = this.a/2
            * Math.sin(degreesToRadians(this.orientation))
            + Py;
        return {
            'Ax': Ax,
            'Ay': Ay,
            'Px': Px,
            'Py': Py,
            'Cx': Cx,
            'Cy': Cy,
        }
    }
    getEccentricity() {
        return  (
            Math.sqrt(
                Math.pow(this.a / 2, 2)
                - Math.pow(this.b / 2, 2))
        ) / (this.a / 2);
    }
    calcPosition(time, deltaTime = 0) {
        this.a = this.apogee + this.perigee;
        this.b = Math.sqrt(this.apogee * this.perigee) * 2;
        let e = this.getEccentricity();

        let apses = this.getApses();
        let Cx = apses.Cx;
        let Cy = apses.Cy;

        // src : https://nbodyphysics.com/blog/2016/05/29/planetary-orbits-in-javascript/
        let M = ( 2.0 * Math.PI ) * ( (time - this.start) / this.period );
        let u = M;
        let u_next = 0;
        let loopCount = 0;
        while(loopCount++ < 100) {
            u_next = u + (M - (u + e * Math.sin(u)))/(1 + e * Math.cos(u));
            if (Math.abs(u_next - u) < 1E-6)
                break;
            u = u_next;
        }
        //-------------------------------------------------------------------------------
        let bx = (this.b/2)
            * Math.cos(degreesToRadians(this.orientation) + u)
            + Cx;
        let by = (this.b/2)
            * Math.sin(degreesToRadians(this.orientation) + u)
            + Cy;
        let Zx = ((this.a/2) - (this.b/2))
            * Math.cos(u)
            + bx;
        this.x = (Zx - bx)
            * Math.cos(degreesToRadians(this.orientation))
            + bx;
        this.y = (Zx - bx)
            * Math.sin(degreesToRadians(this.orientation))
            + by;

        this.timeToApogee -= deltaTime;
        if (this.timeToApogee < 0) {
            this.timeToApogee = this.period + this.timeToApogee;
        }
        return {
            'x': this.x,
            'y': this.y
        };
    }
    show(ctx, time, maneuverNode = false) {
        if (!maneuverNode) return;
        let apses = this.getApses();
        let Ax = apses.Ax;
        let Ay = apses.Ay;
        let Cx = apses.Cx;
        let Cy = apses.Cy;
        let d = calcDistance(maneuverNode, {'x': Cx, 'y': Cy});
        let angle = Math.asin(
            (maneuverNode.y - Cy)
            / d
        );
        let orientation;
        if (maneuverNode.x < Cx) orientation = degreesToRadians(this.orientation);
        else orientation = - degreesToRadians(this.orientation);
        let r = Math.sqrt(
            1 / (
                (Math.pow(Math.cos(angle + orientation), 2) / Math.pow(this.a/2,2))
                + (Math.pow(Math.sin(angle + orientation), 2) / Math.pow(this.b/2,2))
            )
        );
        let hitWidth = 20;
        if (Math.abs(d - r) > hitWidth) return false;
        let zAngle = angle;
        if (maneuverNode.x < Cx) zAngle = - angle + degreesToRadians(180);
        let x = r * Math.cos(zAngle) + Cx;
        let y = r * Math.sin(zAngle) + Cy;

        let t = this.start;
        let shadow = {'orbit':this};
        let shadowPos = shadow.orbit.calcPosition(t);
        let shadowFromApogee = calcDistance({'x': Ax,'y': Ay}, shadowPos);
        let lastCalc = shadowFromApogee - 1;
        let shadowToNode;
        let f = false;
        while (shadowFromApogee > lastCalc) {
            t += 0.1;
            lastCalc = shadowFromApogee;
            shadowPos = shadow.orbit.calcPosition(t);
            shadowFromApogee = calcDistance({'x': Ax,'y': Ay}, shadowPos);
            shadowToNode = calcDistance({'x': x,'y': y}, shadowPos);
            if (shadowToNode < 10) { // TODO remove 10
                f = true;
                break;
            }
        }
        while (shadowFromApogee < lastCalc) {
            if (f) break;
            t += 0.1;
            lastCalc = shadowFromApogee;
            shadowPos = shadow.orbit.calcPosition(t);
            shadowFromApogee = calcDistance({'x': Ax,'y': Ay}, shadowPos);
            shadowToNode = calcDistance({'x': x,'y': y}, shadowPos);
            if (shadowToNode < 10) {
                break;
            }
        }
        t -= this.start;
        let timeToNode = t - (this.period - this.timeToApogee);
        if (timeToNode < 0) timeToNode += this.period;
        timeToNode = Math.round(timeToNode * 10) / 10;

        ctx.fillStyle = 'rgb(0,0,255)';
        ctx.beginPath();
        ctx.arc(
            x, y, maneuverNode.r,
            0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.fillText(timeToNode.toString() + ' s', x+10, y-10);

        return {'x': x,'y': y,'timeToNode': timeToNode};
    }
    draw(ctx) {
        let apses = this.getApses();
        let Ax = apses.Ax;
        let Ay = apses.Ay;
        let Px = apses.Px;
        let Py = apses.Py;
        let Cx = apses.Cx;
        let Cy = apses.Cy;
        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.beginPath();
        ctx.arc(
            Ax, Ay, 2,
            0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.arc(
            Px, Py, 2,
            0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'rgb(0,0,255)';
        ctx.beginPath();
        ctx.ellipse(
            Cx, Cy,
            this.a/2, this.b/2,
            this.orientation * Math.PI/180, 0, 2 * Math.PI);
        ctx.stroke();
    }
}