const player = document.getElementById('player');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function getReducedColorImage(src, k) {
    let thresholds = [];
    for (let i = 0; i < k; i++) {
        thresholds.push(Math.floor(255 / (k - 1) * i));
    }
    for (let i = 0; i < src.data.length; i++) {
        if (i % 4 === 3) {
            continue
        }
        // 最も近いしきい値に分類
        let nearest = thresholds.reduce((acc, curr) => {
            return Math.abs(curr - src.data[i]) < Math.abs(acc - src.data[i]) ? curr : acc;
        });
        src.data[i] = nearest;
    }
    return src;
}

ctx.drawPixelImage = (src, k = 6, sample_size = 7) => {
    const __drawPixelImage = (src, k, sample_size) => {
        src = getReducedColorImage(src, k);
        let pixelArr = src.data;
        for (let y = 0; y < src.height; y += sample_size) {
            for (let x = 0; x < src.width; x += sample_size) {
                let p = (x + (y * src.width)) * 4;
                ctx.fillStyle = `rgba(${pixelArr[p]},${pixelArr[p + 1]},${pixelArr[p + 2]},${pixelArr[p + 3]})`;
                ctx.fillRect(x, y, sample_size, sample_size);
            }
        }
    }
    if (typeof src === 'string') {
        let image = new Image();
        image.src = src;
        image.onload = () => {
            ctx.drawImage(image, 0, 0, image.width, image.height);
            src = ctx.getImageData(0, 0, image.width, image.height);
            __drawPixelImage(src, k, sample_size);
        }
    }
    else if (src instanceof ImageData) {
        __drawPixelImage(src, k, sample_size);
    }
    else {
        throw new Error('invalid argument');
    }
}



const video = document.getElementById("player");
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
}).then(stream => {
    video.srcObject = stream;
    video.play();
    tick();
}).catch(e => {
    console.log(e);
});


function tick() {
    ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
    let src = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.drawPixelImage(src);

    // ctx.drawPixelImage("lena.jpg");
    window.requestAnimationFrame(tick);
}