document.addEventListener("DOMContentLoaded", function () {
    let ship;
    let speed = 5;
    let keys = {};
    let score = 0;  // Счетчик сбитых астероидов
    let gameOverElement;  // Элемент с надписью "GAME OVER"

    // Загрузка звука выстрела и взрыва
    let shootSound = new Audio("assets/Sound Effects Shooting sounds 002/SHOOT017.mp3");
    shootSound.volume = 0.3; // Уменьшаем громкость

    let explosionSound = new Audio("assets/explosion.wav");
    explosionSound.volume = 1; // Громкость взрыва

    // Функция для создания корабля
    function createShip() {
        if (ship) {
            ship.remove();  // Удаляем старый корабль
        }

        ship = document.createElement('div');
        ship.classList.add('space-ship');
        document.body.appendChild(ship);

        // Размещение корабля внизу по центру экрана
        ship.style.position = "absolute";
        ship.style.left = `${window.innerWidth / 2 - 25}px`; // Центр экрана по горизонтали
        ship.style.top = `${window.innerHeight - 100}px`; // Внизу экрана (100px от нижнего края)
    }

    // Инициализация корабля
    createShip();

    // Добавление стилизованной надписи "Liam Galactic"
    const splashScreen = document.createElement('div');
    splashScreen.classList.add('splash-screen');
    splashScreen.textContent = 'Liam Galactic';
    document.body.appendChild(splashScreen);

    // Убираем надпись при нажатии ENTER
    document.addEventListener("keydown", function (event) {
        keys[event.key] = true;
        if (event.code === 'Space') {
            shoot();
        }

        if (event.code === 'Enter') {
            resetGame();  // При нажатии Enter сбрасываем игру
            splashScreen.style.display = 'none'; // Скрываем надпись
        }
    });

    document.addEventListener("keyup", function (event) {
        keys[event.key] = false;
    });

    function move() {
        let rect = ship.getBoundingClientRect();
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        if (keys["ArrowUp"] && rect.top > 0) ship.style.top = rect.top - speed + "px";
        if (keys["ArrowDown"] && rect.bottom < windowHeight) ship.style.top = rect.top + speed + "px";
        if (keys["ArrowLeft"] && rect.left > 0) ship.style.left = rect.left - speed + "px";
        if (keys["ArrowRight"] && rect.right < windowWidth) ship.style.left = rect.left + speed + "px";

        requestAnimationFrame(move);
    }

    move(); // Запуск анимации

    let bg = document.querySelector('.game-area');
    let posY = 0;
    let speedB = 2; // Скорость движения фона

    function moveBackground() {
        posY += speedB;
        bg.style.backgroundPosition = `0px ${posY}px`;
        requestAnimationFrame(moveBackground);
    }

    moveBackground(); // Запуск анимации

    // Функция создания астероида с случайным размером
    function createAsteroid() {
        let asteroid = document.createElement('div');
        asteroid.classList.add('asteroid');
        document.body.appendChild(asteroid);

        let startX = Math.random() * window.innerWidth;
        let speedY = 2 + Math.random() * 4;

        // Случайный размер астероида
        let asteroidWidth = 60 + Math.random() * 50; // Ширина от 30px до 80px
        let asteroidHeight = 60 + Math.random() * 50; // Высота от 30px до 80px

        asteroid.style.width = `${asteroidWidth}px`;
        asteroid.style.height = `${asteroidHeight}px`;

        asteroid.style.left = `${startX}px`;
        asteroid.style.top = `-50px`;

        function fall() {
            let topPos = parseFloat(asteroid.style.top);
            if (topPos > window.innerHeight) {
                asteroid.remove();
            } else {
                asteroid.style.top = `${topPos + speedY}px`;
                checkAsteroidCollision(asteroid); // Проверка столкновений с астероидом
                requestAnimationFrame(fall);
            }
        }
        fall();
    }

    setInterval(createAsteroid, 800); // Создаем астероид каждые 0.8 секунды

    function shoot() {
        let bullet = document.createElement('div');
        bullet.classList.add('bullet');
        document.body.appendChild(bullet);

        let shipRect = ship.getBoundingClientRect();
        let bulletX = shipRect.left + shipRect.width / 2 - 4; // Центр корабля
        let bulletY = shipRect.top; // Вылетает из носа корабля

        bullet.style.position = "absolute";
        bullet.style.left = `${bulletX}px`;
        bullet.style.top = `${bulletY}px`;

        // Воспроизведение звука выстрела с уменьшенной громкостью
        shootSound.currentTime = 0; // Перематываем звук, чтобы он проигрывался заново при каждом выстреле
        shootSound.play();

        function moveBullet() {
            bulletY -= 10;
            if (bulletY < 0) {
                bullet.remove();
            } else {
                bullet.style.top = `${bulletY}px`;
                requestAnimationFrame(moveBullet);
            }
            checkCollision(bullet);
        }
        moveBullet();
    }

    function checkCollision(bullet) {
        let bullets = document.querySelectorAll('.bullet');
        let asteroids = document.querySelectorAll('.asteroid');

        bullets.forEach(b => {
            let bRect = b.getBoundingClientRect();
            asteroids.forEach(a => {
                let aRect = a.getBoundingClientRect();
                if (
                    bRect.left < aRect.right &&
                    bRect.right > aRect.left &&
                    bRect.top < aRect.bottom &&
                    bRect.bottom > aRect.top
                ) {
                    // Взорвем астероид
                    a.remove();
                    b.remove();
                    increaseScore();  // Увеличиваем счет за сбитый астероид
                }
            });
        });
    }

    function checkAsteroidCollision(asteroid) {
        let shipRect = ship.getBoundingClientRect();
        let aRect = asteroid.getBoundingClientRect();

        if (
            shipRect.left < aRect.right &&
            shipRect.right > aRect.left &&
            shipRect.top < aRect.bottom &&
            shipRect.bottom > aRect.top
        ) {
            explodeShip(); // Взрыв корабля при столкновении с астероидом
            asteroid.remove(); // Удаляем астероид
        }
    }

    function increaseScore() {
        score++;  // Увеличиваем счет
        updateScoreDisplay(); // Обновляем отображение счета
    }

    function updateScoreDisplay() {
        let scoreDisplay = document.getElementById("score");
        scoreDisplay.textContent = `Бахнуто астероидов: ${score}`;
    }

    function explodeShip() {
        // Создаем элемент взрыва
        let explosion = document.createElement('div');
        explosion.classList.add('explosion');
        document.body.appendChild(explosion);

        // Размещаем взрыв в позиции корабля
        let shipRect = ship.getBoundingClientRect();
        explosion.style.left = `${shipRect.left + shipRect.width / 2 - 25}px`; // Центр корабля
        explosion.style.top = `${shipRect.top + shipRect.height / 2 - 25}px`; // Центр корабля

        // Воспроизведение звука взрыва
        explosionSound.currentTime = 0;
        explosionSound.play();

        // Анимация взрыва
        explosion.classList.add('explode');

        // Удаляем корабль
        ship.remove();

        // Удаляем взрыв через 1 секунду
        setTimeout(() => {
            explosion.remove();
            showGameOver();  // Показываем надпись "GAME OVER"
        }, 1000);
    }

    function showGameOver() {
        gameOverElement = document.createElement('div');
        gameOverElement.classList.add('game-over');
        gameOverElement.textContent = "GAME OVER";
        document.body.appendChild(gameOverElement);
    }

    // Функция сброса игры
    function resetGame() {
        score = 0;  // Сброс счета
        updateScoreDisplay();  // Обновляем отображение счета
        if (gameOverElement) {
            gameOverElement.remove();  // Удаляем надпись GAME OVER
        }
        createShip();  // Создаем новый корабль
    }

    // Изначально отображаем счет
    let scoreDisplay = document.createElement('div');
    scoreDisplay.id = "score";
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.right = '10px';
    scoreDisplay.style.fontSize = '24px';
    scoreDisplay.style.color = 'white';
    document.body.appendChild(scoreDisplay);
});