const board = document.getElementById('board');
const scorePainel = document.getElementById('score');
const apples = [];
const body = [];
const angles = { up: -90, left: 180, right: 0, down: 90 };
let score = 0;
let speed = 160;
const levels = [ 10, 20, 30, 40, 50, 70, 100, 150 ];

let runTimer;

function getLimits() {
    return {
      top: Math.floor(board.offsetHeight / 16),
      left: Math.floor(board.offsetWidth / 16)
    };
}

function getNumbers(stringNumber) {
    if (!stringNumber) return 0;
    return Number(stringNumber.replace('rem', ''));
}

function getNewPosition(direction, stringPosition, number) {
    const actualPosition = getNumbers(stringPosition);
    return actualPosition + number;
}

function initialize() {
    setBoardSizes();
    addBodyToSnake(0,0);
    addKeyListen();
    for (let i = 0; i < 10; i++) addApple();

    window.addEventListener('resize', function() {
        location.reload();
    }, true);
}

function setBoardSizes() {
    board.style.width = `${Math.floor(window.innerWidth / 16) - 2}rem`;
    board.style.height = `${Math.floor(window.innerHeight / 16) - 2}rem`;
}

function addBodyToSnake(top, left) {
    const circle = getCircle(top, left);
    body.push(circle)
    board.append(circle);
}

function getCircle(top, left) {
    const circle = document.createElement('span');
    circle.className = 'snake-body';
    circle.style.left = `${left}rem`;
    circle.style.top = `${top}rem`;
    return circle;
}

function addKeyListen() {
    window.addEventListener("keyup", move);
}

function move(event) {
    if (event.code === 'ArrowDown' || event.code === 'KeyS') { plusSnakeTop(1, angles.down); }
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') { plusSnakeLeft(-1, angles.left); }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') { plusSnakeLeft(1, angles.right); }
    if (event.code === 'ArrowUp' || event.code === 'KeyW') { plusSnakeTop(-1, angles.up); }
}

function plusSnakeLeft(number, angle) {
    const canMove = moveBody('left', number, angle);
    if (canMove) {
        run(() => plusSnakeLeft(number));
        checkCollisions('left', number);
    }
}

function plusSnakeTop(number, angle) {
    const canMove = moveBody('top', number, angle);
    if (canMove) {
        run(() => plusSnakeTop(number));
        checkCollisions('top', number);
    }
}

function run(moveCallback) {
    clearInterval(runTimer);
    runTimer = setInterval(moveCallback , speed);
}

function moveBody(direction, number, angle) {
    const oldBody = body.map((c) => ({ top: getNumbers(c.style.top), left: getNumbers(c.style.left) }));

    if (oldBody.length > 2) {
        const newHead = {top: oldBody[0].top, left: oldBody[0].left};
        newHead[direction] = newHead[direction] + number;

        if (newHead.top === oldBody[1].top && newHead.left === oldBody[1].left) {
            return false;
        }
    }

    body.forEach((circle, index) => {
        if (index === 0) {
            const position = getNewPosition(direction, circle.style[direction], number);
            circle.style[direction] = `${position}rem`;
            circle.style.transform = `rotate(${angle}deg)`;
            return;
        }

        const before = oldBody[index - 1];
        circle.style.top = `${before.top}rem`;
        circle.style.left = `${before.left}rem`;
    });

    return true;
}


function checkCollisions(direction, number) {
    checkWallsCollision();
    checkAppleCollision(direction, number);
    checkBodyCollision();
}

function checkWallsCollision() {
    const head = body[0];
    const limits = getLimits();

    if (getNumbers(head.style.top) < 0) finishGame();
    if (getNumbers(head.style.left) < 0) finishGame();
    if (getNumbers(head.style.top) >= limits.top) finishGame();
    if (getNumbers(head.style.left) >= limits.left) finishGame();

    scorePainel.innerText = String(score);
    if (levels.includes(score)) {
        speed = 160 - score;
        scorePainel.innerHTML = `<b>${scorePainel.innerText}</b><br/><small>+speed</small>`;
    }
}

function checkBodyCollision() {
    const head = body[0];
    const hasCollision = body.some((circle, index) => {
        if (index === 0) return false;
        return head.style.top === circle.style.top && head.style.left === circle.style.left;
    });

    if (hasCollision) finishGame();
}

function finishGame() {
    clearInterval(runTimer);
    window.removeEventListener('keyup', move);
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'initial';

    const restartPanel = document.getElementById('restart');
    restartPanel.style.display = 'initial';
}

function checkAppleCollision(direction, number) {
    const apple = apples.find((apple) => isAppleEnableToEat(apple));
    if (apple) {
        board.removeChild(apple);

        const end = body[body.length - 1];
        if (direction === 'top') addBodyToSnake(getNumbers(end.style.top) - number, getNumbers(end.style.left));
        if (direction === 'left') addBodyToSnake(getNumbers(end.style.top), getNumbers(end.style.left) - number);

        apples.splice(apples.indexOf(apple), 1);
        score++;
        addApple();
    }
}

function isAppleEnableToEat(apple) {
    if (!apple) return false;

    const appleLeft = getNumbers(apple.style.left);
    const snakeLeft = getNumbers(body[0].style.left);

    const appleTop = getNumbers(apple.style.top);
    const snakeTop = getNumbers(body[0].style.top);

    return snakeLeft === appleLeft && snakeTop === appleTop;
}

function addApple() {
    const apple = getApple();
    apples.push(apple);
    board.append(apple);
}

function getApple() {
    const limits = getLimits();

    const apple = document.createElement('div');
    apple.className = 'apple';
    apple.style.top = `${getRandomPosition(limits.top)-1}rem`;
    apple.style.left = `${getRandomPosition(limits.left)-1}rem`;
    return apple;
}

function getRandomPosition(max) {
    return Math.floor(Math.random() * max) + 1;
}

initialize();
