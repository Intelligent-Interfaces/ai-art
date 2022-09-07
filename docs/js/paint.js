function Paint(p) {

    let ppos = p.copy();
    let pos = p.copy();
    let vel = createVector(0, 0);
    let force = createVector(0, 0);

    let maxSpeed = 10;
    let perception = 5;
    let bound = 60;
    let boundForceFactor = 0.16;
    let noiseScale = 1.0;
    let noiseInfluence = 1 / 20.0;

    let dropRate = 0.004;
    let dropRange = 40;
    let dropAlpha = 150;
    let drawAlpha = 50;
    let drawColor = color(0, 0, 0, drawAlpha);
    // let drawWeight = .5;
    let drawWeight = 1;
    let count = 0;
    let maxCount = 100;

    this.update = function () {
        ppos = pos.copy();
        force.mult(0);

        // Add pixels force
        let target = createVector(0, 0);
        let count = 0;
        for (let i = -floor(perception / 2); i < perception / 2; i++) {
            for (let j = -floor(perception / 2); j < perception / 2; j++) {
                if (i == 0 && j == 0)
                    continue;
                let x = floor(pos.x + i);
                let y = floor(pos.y + j);
                if (x <= img.width - 1 && x >= 0 && y < img.height - 1 && y >= 0) {
                    let c = fget(x, y);
                    let b = brightness(c);
                    b = 1 - b / 100.0;
                    let p = createVector(i, j);
                    target.add(p.normalize().copy().mult(b).div(p.mag()));
                    count++;
                }
            }
        }
        if (count != 0) {
            force.add(target.div(count));
        }

        // Add noise force
        let n = noise(pos.x / noiseScale, pos.y / noiseScale, z);
        n = map(n, 0, 1, 0, 5 * TWO_PI);
        let p = p5.Vector.fromAngle(n);
        if (force.mag() < 0.01)
            force.add(p.mult(noiseInfluence * 5));
        else
            force.add(p.mult(noiseInfluence));

        // Add bound force
        let boundForce = createVector(0, 0);
        if (pos.x < bound) {
            boundForce.x = (bound - pos.x) / bound;
        }
        if (pos.x > width - bound) {
            boundForce.x = (pos.x - width) / bound;
        }
        if (pos.y < bound) {
            boundForce.y = (bound - pos.y) / bound;
        }
        if (pos.y > height - bound) {
            boundForce.y = (pos.y - height) / bound;
        }
        force.add(boundForce.mult(boundForceFactor));


        vel.add(force);
        vel.mult(0.9999);
        if (vel.mag() > maxSpeed) {
            vel.mult(maxSpeed / vel.mag());
        }

        pos.add(vel);
        if (pos.x > width || pos.x < 0 || pos.y > height || pos.y < 0) {
            this.reset();
        }

    }

    this.reset = function () {
        img.updatePixels();
        img.loadPixels();

        count = 0;
        //maxCount = 200;
        let hasFound = false;
        while (!hasFound) {
            pos.x = random(1) * width;
            pos.y = random(1) * height;
            let c = fget(floor(pos.x), floor(pos.y));
            let b = brightness(c);
            if (b < 35)
                hasFound = true;
        }
        drawColor = fget(floor(pos.x), floor(pos.y));
        drawColor.setAlpha(drawAlpha);
        ppos = pos.copy();
        vel.mult(0);
    }

    this.show = function () {
        count++;
        if (count > maxCount)
            this.reset();
        stroke(drawColor);
        strokeWeight(drawWeight);
        if (force.mag() > 0.1 && random(1) < dropRate) {
            drawColor.setAlpha(dropAlpha);
            stroke(drawColor);
            let boldWeight = drawWeight + random(5);
            strokeWeight(boldWeight);
            drawColor.setAlpha(drawAlpha);
        }
        line(ppos.x, ppos.y, pos.x, pos.y);

        this.fadeLineFromImg(ppos.x, ppos.y, pos.x, pos.y);
    }

    /* Fade the pixels of the line */
    this.fadeLineFromImg = function (x1, y1, x2, y2) {
        let xOffset = floor(abs(x1 - x2));
        let yOffset = floor(abs(y1 - y2));
        let step = xOffset < yOffset ? yOffset : xOffset;
        for (let i = 0; i < step; i++) {
            let x = floor(x1 + (x2 - x1) * i / step);
            let y = floor(y1 + (y2 - y1) * i / step);
            let originColor = fget(x, y);

            let r = red(originColor);
            let g = green(originColor);
            let b = blue(originColor);

            originColor.setRed(r + 50 > 255 ? 255 : r + 50);
            originColor.setGreen(g + 50 > 255 ? 255 : g + 50);
            originColor.setBlue(b + 50 > 255 ? 255 : b + 50);

            fset(x, y, originColor);

        }
    }

}
