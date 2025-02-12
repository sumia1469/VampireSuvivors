const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// 플레이어 상태
let player = {
    x: 400,
    y: 300,
    size: 20,
    speed: 3,
    direction: { x: 0, y: 0 },
    bullets: [],
};

// 적 리스트
let enemies = [];

// 방향 조작 (키 입력)
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") player.direction.y = -1;
    else if (event.key === "ArrowDown") player.direction.y = 1;
    else if (event.key === "ArrowLeft") player.direction.x = -1;
    else if (event.key === "ArrowRight") player.direction.x = 1;
});

document.addEventListener("keyup", (event) => {
    if (["ArrowUp", "ArrowDown"].includes(event.key)) player.direction.y = 0;
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) player.direction.x = 0;
});

// 플레이어 이동 (화면 밖으로 나가지 않도록 제한)
function movePlayer() {
    player.x += player.direction.x * player.speed;
    player.y += player.direction.y * player.speed;

    // 화면 경계를 벗어나지 않도록 제한
    if (player.x < 0) player.x = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y < 0) player.y = 0;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
}

// 무기 자동 발사 (1초마다)
function shootWeapon() {
    for (let angle = 0; angle < 360; angle += 45) {
        let rad = (angle * Math.PI) / 180;
        player.bullets.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(rad) * 5,
            dy: Math.sin(rad) * 5,
            size: 5,
            color: "yellow",
            lifetime: 0,
        });
    }
}
setInterval(shootWeapon, 1000);

// 적 생성 (화면 밖에서 등장)
function spawnEnemies() {
    if (Math.random() < 0.02) {
        let side = Math.floor(Math.random() * 4);
        let enemy = { size: 20, color: "red" };

        if (side === 0) {
            enemy.x = Math.random() * canvas.width;
            enemy.y = -enemy.size;
        } else if (side === 1) {
            enemy.x = Math.random() * canvas.width;
            enemy.y = canvas.height + enemy.size;
        } else if (side === 2) {
            enemy.x = -enemy.size;
            enemy.y = Math.random() * canvas.height;
        } else {
            enemy.x = canvas.width + enemy.size;
            enemy.y = Math.random() * canvas.height;
        }

        let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.dx = Math.cos(angle) * 1.5;
        enemy.dy = Math.sin(angle) * 1.5;

        enemies.push(enemy);
    }
}

// 적 이동 및 충돌 처리
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;

        if (
            Math.abs(enemy.x - player.x) < player.size &&
            Math.abs(enemy.y - player.y) < player.size
        ) {
            alert("Game Over!");
            location.reload();
        }
    });
}

// 총알 이동 및 적과 충돌 처리
function moveBullets() {
    player.bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        bullet.lifetime += 1;

        // 총알이 일정 시간이 지나면 제거
        if (bullet.lifetime > 50) {
            player.bullets.splice(bulletIndex, 1);
        }

        // 적과 충돌하면 적 제거
        enemies.forEach((enemy, enemyIndex) => {
            if (
                Math.abs(enemy.x - bullet.x) < enemy.size &&
                Math.abs(enemy.y - bullet.y) < enemy.size
            ) {
                enemies.splice(enemyIndex, 1);
                player.bullets.splice(bulletIndex, 1);
            }
        });
    });
}

// 화면 그리기
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어(캐릭터) 그리기
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // 적 그리기
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });

    // 총알 그리기
    player.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

// 게임 루프
function gameLoop() {
    movePlayer();
    spawnEnemies();
    moveEnemies();
    moveBullets();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();