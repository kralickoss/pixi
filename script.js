const app = new PIXI.Application({ background: '#111', resizeTo: window });

document.body.appendChild(app.view);

const movementSpeed = 0.05;
const impulsePower = 5;

function testForAABB(object1, object2) {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width &&
        bounds1.x + bounds1.width > bounds2.x &&
        bounds1.y < bounds2.y + bounds2.height &&
        bounds1.y + bounds1.height > bounds2.y;
}

function collisionResponse(object1, object2) {
    const vCollision = new PIXI.Point(
        object2.x - object1.x,
        object2.y - object1.y,
    );

    const distance = Math.sqrt(
        vCollision.x * vCollision.x +
        vCollision.y * vCollision.y
    );

    const vCollisionNorm = new PIXI.Point(
        vCollision.x / distance,
        vCollision.y / distance,
    );

    const vRelativeVelocity = new PIXI.Point(
        object1.acceleration.x - object2.acceleration.x,
        object1.acceleration.y - object2.acceleration.y,
    );

    const speed = vRelativeVelocity.x * vCollisionNorm.x +
        vRelativeVelocity.y * vCollisionNorm.y;

    const impulse = impulsePower * speed / (object1.mass + object2.mass);

    return new PIXI.Point(
        impulse * vCollisionNorm.x,
        impulse * vCollisionNorm.y,
    );
}

function distanceBetweenTwoPoints(p1, p2) {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;

    return Math.hypot(a, b);
}

const fufos = PIXI.Texture.from("fufos.jpg");

const greenSquare = new PIXI.Sprite(fufos);
greenSquare.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2);
greenSquare.width = 50;
greenSquare.height = 50;
greenSquare.acceleration = new PIXI.Point(0);
greenSquare.mass = 3;

const markos = PIXI.Texture.from("markos.png");

const redSquare = new PIXI.Sprite(markos);
redSquare.position.set(0, 0);
redSquare.width = 100;
redSquare.height = 100;
redSquare.acceleration = new PIXI.Point(0);
redSquare.mass = 1;

const mouseCoords = { x: 0, y: 0 };

app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('mousemove', (event) => {
    mouseCoords.x = event.data.global.x;
    mouseCoords.y = event.data.global.y;
});

window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    greenSquare.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2);
    redSquare.position.set(0, 0);
});

app.ticker.add((delta) => {
    redSquare.acceleration.set(redSquare.acceleration.x * 0.99, redSquare.acceleration.y * 0.99);
    greenSquare.acceleration.set(greenSquare.acceleration.x * 0.99, greenSquare.acceleration.y * 0.99);

    if (greenSquare.x < 0 || greenSquare.x > (app.screen.width - 100)) {
        greenSquare.acceleration.x = -greenSquare.acceleration.x;
    }

    if (greenSquare.y < 0 || greenSquare.y > (app.screen.height - 100)) {
        greenSquare.acceleration.y = -greenSquare.acceleration.y;
    }

    if ((greenSquare.x < -30 || greenSquare.x > (app.screen.width + 30)) ||
        greenSquare.y < -30 || greenSquare.y > (app.screen.height + 30)) {
        greenSquare.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2);
    }

    if (app.screen.width > mouseCoords.x && mouseCoords.x > 0 &&
        app.screen.height > mouseCoords.y && mouseCoords.y > 0) {

        const redSquareCenterPosition = new PIXI.Point(
            redSquare.x + (redSquare.width * 0.5),
            redSquare.y + (redSquare.height * 0.5),
        );

        const toMouseDirection = new PIXI.Point(
            mouseCoords.x - redSquareCenterPosition.x,
            mouseCoords.y - redSquareCenterPosition.y,
        );

        const angleToMouse = Math.atan2(
            toMouseDirection.y,
            toMouseDirection.x,
        );

        const distMouseRedSquare = distanceBetweenTwoPoints(
            mouseCoords,
            redSquareCenterPosition,
        );
        const redSpeed = distMouseRedSquare * movementSpeed;

        redSquare.acceleration.set(
            Math.cos(angleToMouse) * redSpeed,
            Math.sin(angleToMouse) * redSpeed,
        );
    }

    if (testForAABB(greenSquare, redSquare)) {
        const collisionPush = collisionResponse(greenSquare, redSquare);

        redSquare.acceleration.set(
            (collisionPush.x * greenSquare.mass),
            (collisionPush.y * greenSquare.mass),
        );
        greenSquare.acceleration.set(
            -(collisionPush.x * redSquare.mass),
            -(collisionPush.y * redSquare.mass),
        );
    }

    greenSquare.x += greenSquare.acceleration.x * delta;
    greenSquare.y += greenSquare.acceleration.y * delta;

    redSquare.x += redSquare.acceleration.x * delta;
    redSquare.y += redSquare.acceleration.y * delta;
});

app.stage.addChild(redSquare, greenSquare);
