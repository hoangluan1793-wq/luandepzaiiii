const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

const scoreElement = document.getElementById("score");
const correctElement = document.getElementById("correct");
const levelDisplay = document.getElementById("levelDisplay");

const answerInput = document.getElementById("answerInput");
const shootBtn = document.getElementById("shootBtn");
const pauseBtn = document.getElementById("pauseBtn");

const messageElement = document.getElementById("message");

const pauseScreen = document.getElementById("pauseScreen");
const winScreen = document.getElementById("winScreen");

const pauseScore = document.getElementById("pauseScore");
const pauseCorrect = document.getElementById("pauseCorrect");

const winScore = document.getElementById("winScore");
const winCorrect = document.getElementById("winCorrect");

const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

const winRestartBtn = document.getElementById("winRestartBtn");
const winMenuBtn = document.getElementById("winMenuBtn");


// =====================================================
// CẤU HÌNH
// =====================================================

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

canvas.width = WIDTH;
canvas.height = HEIGHT;


// =====================================================
// DỮ LIỆU
// =====================================================

let allVocabulary = [];
let vocabulary = [];
let remainingVocabulary = [];

let currentMode = 1;

let score = 0;
let correct = 0;

let gameRunning = false;
let gamePaused = false;

let words = [];
let bullets = [];
let stars = [];

let lastTime = 0;
let spawnTimer = 0;


// =====================================================
// DANH SÁCH HSK 1
// =====================================================
// Dùng bộ từ HSK 1 phổ biến.
// Những từ còn lại trong danh sách của mày sẽ được
// xếp vào nhóm HSK 2 / từ mở rộng HSK2 để game hoạt động.
// =====================================================

const HSK1 = new Set([

    "你",
    "我",
    "他",
    "她",
    "我们",
    "你们",
    "他们",

    "这",
    "那",
    "哪",
    "谁",
    "什么",
    "怎么",
    "怎么样",

    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",

    "个",
    "本",
    "岁",
    "些",

    "人",

    "爸爸",
    "妈妈",
    "儿子",
    "女儿",

    "老师",
    "学生",
    "同学",
    "朋友",

    "先生",
    "小姐",

    "衣服",

    "水",
    "菜",
    "米饭",
    "水果",
    "苹果",

    "飞机",
    "出租车",

    "电视",
    "电影",
    "电脑",

    "天气",

    "猫",
    "狗",

    "东西",
    "钱",
    "名字",

    "书",
    "汉字",
    "汉语",

    "时间",
    "时候",

    "早上",
    "中午",
    "晚上",

    "年",
    "月",
    "日",
    "号",
    "星期",

    "今天",
    "明天",
    "昨天",

    "哪儿",
    "这儿",
    "那儿",

    "家",
    "学校",
    "医院",
    "商店",

    "中国",
    "北京",

    "是",
    "有",

    "做",
    "看",
    "听",
    "说",
    "读",
    "写",

    "买",
    "开",
    "坐",
    "住",
    "来",
    "去",
    "回",
    "到",

    "想",

    "知道",
    "认识",

    "会",
    "能",
    "可以",

    "爱",
    "喜欢",

    "喝",
    "吃",
    "玩",

    "睡觉",

    "工作",
    "学习",

    "好",
    "大",
    "小",
    "多",
    "少",
    "高",
    "冷",
    "热",

    "快",
    "慢",

    "远",
    "近",

    "累",
    "忙",

    "高兴",
    "漂亮",

    "贵",
    "便宜",
    "好吃",

    "不",
    "没",
    "很",
    "太",
    "都",
    "和",
    "在",

    "的",
    "了",
    "呢",
    "吗",
    "吧",

    "喂",
    "请",
    "谢谢",
    "不客气",
    "对不起",
    "没关系",
    "再见"

]);


// =====================================================
// LOAD VOCABULARY
// =====================================================

fetch("vocabulary.json")
    .then(response => {

        if (!response.ok) {
            throw new Error("Không tìm thấy vocabulary.json");
        }

        return response.json();
    })
    .then(data => {

        allVocabulary = data;

        console.log(
            "Đã tải",
            allVocabulary.length,
            "từ vựng"
        );

    })
    .catch(error => {

        console.error(error);

        alert(
            "Không thể tải vocabulary.json!\n\n" +
            "Hãy chắc chắn vocabulary.json nằm cùng thư mục với index.html."
        );

    });


// =====================================================
// CHUẨN HÓA PINYIN
// =====================================================

function removeTone(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "")
        .replace(/'/g, "")
        .replace(/-/g, "")
        .replace(/[āáǎà]/g, "a")
        .replace(/[ēéěè]/g, "e")
        .replace(/[īíǐì]/g, "i")
        .replace(/[ōóǒò]/g, "o")
        .replace(/[ūúǔù]/g, "u")
        .replace(/[ǖǘǚǜü]/g, "v")
        .replace(/ń/g, "n")
        .replace(/ň/g, "n")
        .replace(/ǹ/g, "n")
        .replace(/ḿ/g, "m")
        .replace(/ǹ/g, "n");
}


// =====================================================
// PHÂN LOẠI HSK
// =====================================================

function getHSK(word) {

    if (HSK1.has(word.character)) {
        return 1;
    }

    return 2;
}


// =====================================================
// CHỌN CẤP ĐỘ
// =====================================================

function startGame(mode) {

    if (allVocabulary.length === 0) {

        alert("Từ vựng chưa tải xong. Hãy đợi một chút rồi thử lại.");

        return;
    }

    currentMode = mode;

    if (mode === 1) {

        vocabulary = allVocabulary.filter(
            word => getHSK(word) === 1
        );

        levelDisplay.textContent = "HSK 1";

    } else if (mode === 2) {

        vocabulary = allVocabulary.filter(
            word => getHSK(word) === 2
        );

        levelDisplay.textContent = "HSK 2";

    } else {

        vocabulary = [...allVocabulary];

        levelDisplay.textContent = "HSK 1 + 2";
    }


    if (vocabulary.length === 0) {

        alert("Không có từ vựng ở cấp độ này.");

        return;
    }


    menuScreen.style.display = "none";
    gameScreen.style.display = "block";

    resetGame();

    gameRunning = true;
    gamePaused = false;

    pauseScreen.style.display = "none";
    winScreen.style.display = "none";

    answerInput.focus();

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


// =====================================================
// RESET GAME
// =====================================================

function resetGame() {

    score = 0;
    correct = 0;

    scoreElement.textContent = "0";
    correctElement.textContent = `0 / ${vocabulary.length}`;
    remainingVocabulary = [...vocabulary];

    words = [];
    bullets = [];

    spawnTimer = 0;

    messageElement.textContent = "";

    createStars();

    // tạo sẵn 4 từ
    for (let i = 0; i < 4; i++) {

        spawnWord(-80 - i * 150);
    }
}


// =====================================================
// SAO
// =====================================================

function createStars() {

    stars = [];

    for (let i = 0; i < 60; i++) {

        stars.push({

            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,

            size: Math.random() * 2 + 1,

            speed: Math.random() * 20 + 10
        });
    }
}


// =====================================================
// TẠO TỪ RƠI
// =====================================================

function spawnWord(startY = -80) {

    if (remainingVocabulary.length === 0) {
        return;
    }

    if (words.length >= 5) {
        return;
    }


    const index = Math.floor(
        Math.random() * remainingVocabulary.length
    );

    const word = remainingVocabulary[index];


    const cardWidth = Math.max(
        100,
        word.character.length * 42 + 50
    );

    const cardHeight = 70;


    let x;

    let attempts = 0;

    do {

        x =
            Math.random() *
            Math.max(20, WIDTH - cardWidth - 20);

        attempts++;

    } while (
        attempts < 30 &&
        words.some(existing => {

            return Math.abs(
                existing.x - x
            ) < cardWidth;

        })
    );


    words.push({

        character: word.character,
        pinyin: word.pinyin,
        meaning: word.meaning,

        x: x,
        y: startY,

        width: cardWidth,
        height: cardHeight,

        speed: 30 + Math.random() * 20
    });
}


// =====================================================
// TÌM TỪ
// =====================================================

function findWord(input) {

    const answer = removeTone(input);

    return words.find(word => {

        const answers = word.pinyin
            .split("/")
            .map(x => removeTone(x));

        return answers.includes(answer);

    });
}


// =====================================================
// BẮN
// =====================================================

function submitAnswer() {

    if (!gameRunning || gamePaused) {
        return;
    }


    const input = answerInput.value.trim();

    if (!input) {
        return;
    }


    const target = findWord(input);


    if (!target) {

        showMessage(
            "❌ Sai hoặc không có từ này",
            true
        );

        answerInput.select();

        return;
    }


    // ĐÚNG

    score += 10;
    correct++;
    scoreElement.textContent = score;
    correctElement.textContent = `${correct} / ${vocabulary.length}`;

    // tạo đạn
    bullets.push({

        x: WIDTH / 2,

        y: HEIGHT - 90,

        target: target,

        speed: 900
    });


    // xóa khỏi danh sách còn lại
    const index = remainingVocabulary.findIndex(
        word => word.character === target.character
    );

    if (index !== -1) {

        remainingVocabulary.splice(index, 1);
    }


    showMessage(
        `✅ ${target.character} = ${target.pinyin} → ${target.meaning}`,
        false
    );


    answerInput.value = "";


    // nếu hết từ
    if (
        remainingVocabulary.length === 0 &&
        words.length <= 1
    ) {

        setTimeout(winGame, 500);
    }
}


// =====================================================
// MESSAGE
// =====================================================

let messageTimeout;

function showMessage(text, error = false) {

    messageElement.textContent = text;

    messageElement.style.color =
        error ? "#ff5555" : "#55ff9a";


    clearTimeout(messageTimeout);

    messageTimeout = setTimeout(() => {

        messageElement.textContent = "";

    }, 1800);
}


// =====================================================
// PAUSE
// =====================================================

function pauseGame() {

    if (!gameRunning) {
        return;
    }

    gamePaused = true;

    pauseScore.textContent = score;
    pauseCorrect.textContent = correct;

    pauseScreen.style.display = "flex";

    answerInput.blur();
}


// =====================================================
// RESUME
// =====================================================

function resumeGame() {

    gamePaused = false;

    pauseScreen.style.display = "none";

    answerInput.focus();

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


// =====================================================
// WIN
// =====================================================

function winGame() {

    gameRunning = false;
    gamePaused = true;

    winScore.textContent = score;
    winCorrect.textContent = correct;

    winScreen.style.display = "flex";

    answerInput.blur();
}


// =====================================================
// MENU
// =====================================================

function goToMenu() {

    gameRunning = false;
    gamePaused = false;

    pauseScreen.style.display = "none";
    winScreen.style.display = "none";

    gameScreen.style.display = "none";
    menuScreen.style.display = "flex";
}


// =====================================================
// DRAW BACKGROUND
// =====================================================

function drawBackground() {

    ctx.fillStyle = "#0a0c16";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    // sao

    ctx.fillStyle = "#ffffff";

    stars.forEach(star => {

        ctx.globalAlpha = 0.4 + Math.random() * 0.5;

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );
    });

    ctx.globalAlpha = 1;
}


// =====================================================
// DRAW AIRPLANE
// =====================================================

function drawAirplane() {

    const x = WIDTH / 2;
    const y = HEIGHT - 65;


    ctx.save();

    ctx.translate(x, y);


    // thân máy bay

    ctx.fillStyle = "#4ddcff";

    ctx.beginPath();

    ctx.moveTo(0, -28);
    ctx.lineTo(10, 18);
    ctx.lineTo(0, 28);
    ctx.lineTo(-10, 18);

    ctx.closePath();

    ctx.fill();


    // cánh

    ctx.beginPath();

    ctx.moveTo(-7, 0);
    ctx.lineTo(-38, 17);
    ctx.lineTo(-7, 14);

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(7, 0);
    ctx.lineTo(38, 17);
    ctx.lineTo(7, 14);

    ctx.closePath();

    ctx.fill();


    ctx.restore();
}


// =====================================================
// DRAW WORD
// =====================================================

function drawWord(word) {

    ctx.save();

    // --- HIỆU ỨNG PHÁT SÁNG VÀNG KIM CHO THẺ ---
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 10; // Tạo độ tỏa sáng giống CSS box-shadow

    ctx.beginPath();

    if (ctx.roundRect) {
        ctx.roundRect(
            word.x,
            word.y,
            word.width,
            word.height,
            8 // Bo tròn góc giống style.css
        );
    } else {
        // Dự phòng cho các trình duyệt cũ không hỗ trợ roundRect
        ctx.rect(word.x, word.y, word.width, word.height);
    }

    // Không dùng ctx.fill() để giữ cho nền thẻ TRONG SUỐT
    ctx.stroke();

    // Tắt shadow để chữ hiển thị sắc nét, không bị nhòe
    ctx.shadowBlur = 0;

    // CHỮ HÁN MÀU VÀNG KIM
    ctx.fillStyle = "#FFD700";

    ctx.font =
        "bold 24px Arial"; // Chỉnh kích thước chữ khớp với style.css

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(
        word.character,
        word.x + word.width / 2,
        word.y + word.height / 2
    );

    ctx.restore();
}


// =====================================================
// DRAW BULLETS
// =====================================================

function drawBullet(bullet) {

    ctx.fillStyle = "#ffff55";

    ctx.beginPath();

    ctx.arc(
        bullet.x,
        bullet.y,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// =====================================================
// UPDATE
// =====================================================

function update(deltaTime) {

    // sao

    stars.forEach(star => {

        star.y += star.speed * deltaTime;

        if (star.y > HEIGHT) {

            star.y = 0;
            star.x = Math.random() * WIDTH;
        }
    });


    // từ

    words.forEach(word => {

        word.y += word.speed * deltaTime;
    });


    // xóa từ đã rơi khỏi màn hình

    words = words.filter(word => {

        return word.y < HEIGHT + 100;
    });


    // sinh từ mới

    spawnTimer += deltaTime;

    if (
        spawnTimer >= 1.8 &&
        words.length < 5 &&
        remainingVocabulary.length > words.length
    ) {

        spawnWord();

        spawnTimer = 0;
    }


    // đạn

    bullets.forEach(bullet => {

        if (!bullet.target) {
            return;
        }


        const target = bullet.target;


        const targetX =
            target.x + target.width / 2;

        const targetY =
            target.y + target.height / 2;


        const dx =
            targetX - bullet.x;

        const dy =
            targetY - bullet.y;


        const distance =
            Math.sqrt(dx * dx + dy * dy);


        if (distance < 20) {

            // xóa từ

            const index =
                words.indexOf(target);

            if (index !== -1) {

                words.splice(index, 1);
            }


            bullet.hit = true;

            return;
        }


        const vx =
            dx / distance;

        const vy =
            dy / distance;


        bullet.x +=
            vx * bullet.speed * deltaTime;

        bullet.y +=
            vy * bullet.speed * deltaTime;
    });


    bullets = bullets.filter(bullet => {

        return (
            !bullet.hit &&
            bullet.x > -100 &&
            bullet.x < WIDTH + 100 &&
            bullet.y > -100 &&
            bullet.y < HEIGHT + 100
        );
    });


    // thắng

    if (
        remainingVocabulary.length === 0 &&
        words.length === 0 &&
        bullets.length === 0 &&
        gameRunning
    ) {

        winGame();
    }
}


// =====================================================
// GAME LOOP
// =====================================================

function gameLoop(timestamp) {

    if (!gameRunning || gamePaused) {
        return;
    }


    const deltaTime =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );


    lastTime = timestamp;


    update(deltaTime);


    drawBackground();


    words.forEach(drawWord);

    bullets.forEach(drawBullet);

    drawAirplane();


    requestAnimationFrame(gameLoop);
}


// =====================================================
// EVENTS
// =====================================================

shootBtn.addEventListener(
    "click",
    submitAnswer
);


answerInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            submitAnswer();
        }
    }
);


pauseBtn.addEventListener(
    "click",
    pauseGame
);


resumeBtn.addEventListener(
    "click",
    resumeGame
);


restartBtn.addEventListener(
    "click",
    () => {

        pauseScreen.style.display = "none";

        resetGame();

        gamePaused = false;
        gameRunning = true;

        answerInput.focus();

        lastTime = performance.now();

        requestAnimationFrame(gameLoop);
    }
);


menuBtn.addEventListener(
    "click",
    goToMenu
);


winRestartBtn.addEventListener(
    "click",
    () => {

        winScreen.style.display = "none";

        resetGame();

        gamePaused = false;
        gameRunning = true;

        answerInput.focus();

        lastTime = performance.now();

        requestAnimationFrame(gameLoop);
    }
);


winMenuBtn.addEventListener(
    "click",
    goToMenu
);


// =====================================================
// RESIZE
// =====================================================

window.addEventListener(
    "resize",
    () => {

        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;

        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        createStars();
    }
);