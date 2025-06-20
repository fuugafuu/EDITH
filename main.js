const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let currentFacingMode = 'environment'; // 初期カメラ：背面
let model;

// カメラ開始関数
async function startCamera(facingMode = 'environment') {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { exact: facingMode }
    },
    audio: false
  });
  video.srcObject = stream;
}

// カメラ切り替え
document.addEventListener('keydown', (e) => {
  if (e.key === 'c') { // Cキーで切り替え
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    startCamera(currentFacingMode);
  }
});

// モデルロードと初期化
Promise.all([
  cocoSsd.load(),
  faceapi.nets.tinyFaceDetector.loadFromUri('./models')
]).then(([cocoModel]) => {
  model = cocoModel;
  startCamera(currentFacingMode).then(() => {
    video.addEventListener('loadeddata', detect);
  });
});

// 検出ループ
async function detect() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  async function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // COCO物体認識
    const predictions = await model.detect(video);
    predictions.forEach(pred => {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(...pred.bbox);
      ctx.fillStyle = '#00FF00';
      ctx.fillText(pred.class, pred.bbox[0], pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10);
    });

    // 顔認識
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
    detections.forEach(det => {
      const { x, y, width, height } = det.box;
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = 'red';
      ctx.fillText('Face', x, y > 10 ? y - 5 : 10);
    });

    requestAnimationFrame(frame);
  }

  frame();
}
