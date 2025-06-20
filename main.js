document.addEventListener('DOMContentLoaded', async () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const translateBtn = document.getElementById('translate');
  const captureBtn = document.getElementById('capture');
  const registerBtn = document.getElementById('register');
  const switchBtn = document.getElementById('switch');
  const gallery = document.getElementById('gallery');

  let currentFacingMode = 'environment';
  let model;

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode },
        audio: false
      });
      video.srcObject = stream;
    } catch (err) {
      alert("カメラの起動に失敗しました：" + err.message);
    }
  }

  async function init() {
    model = await cocoSsd.load();
    await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
    await startCamera();

    video.addEventListener('loadeddata', detect);
  }

  async function detect() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    async function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const predictions = await model.detect(video);
      predictions.forEach(pred => {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(...pred.bbox);
        ctx.fillStyle = '#00FF00';
        ctx.fillText(pred.class, pred.bbox[0], pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10);
      });

      const faces = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      faces.forEach(face => {
        const { x, y, width, height } = face.box;
        ctx.strokeStyle = 'red';
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = 'red';
        ctx.fillText("顔", x, y > 10 ? y - 5 : 10);
      });

      requestAnimationFrame(frame);
    }

    frame();
  }

  switchBtn.onclick = () => {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    startCamera();
  };

  captureBtn.onclick = () => {
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    gallery.appendChild(img);
  };

  translateBtn.onclick = () => {
    speechSynthesis.speak(new SpeechSynthesisUtterance("翻訳処理はまだ簡易です"));
  };

  registerBtn.onclick = () => {
    speechSynthesis.speak(new SpeechSynthesisUtterance("顔登録機能を準備中"));
  };

  init();
});
