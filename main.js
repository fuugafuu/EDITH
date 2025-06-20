let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

let model;
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  requestAnimationFrame(detectFrame);
});

function detectFrame() {
  if (model && video.readyState === 4) {
    model.detect(video).then((predictions) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      predictions.forEach((pred) => {
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.strokeRect(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]);
        ctx.fillStyle = "#00FF00";
        ctx.fillText(pred.class, pred.bbox[0], pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10);
        speak(pred.class);
      });
    });
  }
  requestAnimationFrame(detectFrame);
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}