let player = null;
let playerReady = false;
let pendingVideoId = null;

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    playerVars: { controls: 1, rel: 0, playsinline: 1 },
    events: {
      onReady: () => {
        playerReady = true;
        if (pendingVideoId) {
          player.cueVideoById(pendingVideoId);
          pendingVideoId = null;
        }
      },
    },
  });
}

function extractVideoId(url) {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function loadFromInput() {
  const url = document.getElementById("urlInput").value.trim();
  const id = extractVideoId(url);
  if (!id) {
    alert("有効なYouTubeリンクではありません");
    return;
  }
  if (playerReady) {
    player.cueVideoById(id);
  } else {
    pendingVideoId = id;
  }
}

document.getElementById("setBtn").addEventListener("click", loadFromInput);

document.addEventListener("keydown", (e) => {
  if (document.activeElement === document.getElementById("urlInput")) return;
  if (!playerReady) return;

  if (e.code === "Space") {
    e.preventDefault();
    player.pauseVideo();
  } else if (e.code === "Enter") {
    e.preventDefault();
    player.playVideo();
  }
});

// --- マイク検知 ---
let micStream = null;
let audioCtx = null;
let analyser = null;
let micRafId = null;
let micEnabled = false;
let threshold = 0.18;
let cooldownUntil = 0;
const COOLDOWN_MS = 900;

const micToggle = document.getElementById("micToggle");
const meterFill = document.getElementById("meterFill");
const meterThreshold = document.getElementById("meterThreshold");
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValue = document.getElementById("thresholdValue");

// スライダーの値を反映
function updateThreshold() {
  const pct = Number(thresholdSlider.value);
  threshold = pct / 100;
  meterThreshold.style.left = pct + "%";
  thresholdValue.textContent = pct + "%";
}
thresholdSlider.addEventListener("input", updateThreshold);
updateThreshold();

// マイクON
async function enableMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    alert(
      "マイクを使用できませんでした。ブラウザの権限設定を確認してください。",
    );
    return;
  }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);

  micEnabled = true;
  micToggle.textContent = "マイクをOFF";
  monitorMic();
}

// マイクOFF
function disableMic() {
  micEnabled = false;
  if (micRafId) cancelAnimationFrame(micRafId);
  micRafId = null;
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  analyser = null;
  micToggle.textContent = "マイクをON";
  meterFill.style.width = "0%";
  meterFill.classList.remove("buzz");
}

// 音量を測り続ける
function monitorMic() {
  if (!micEnabled || !analyser) return;

  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);

  // 音量(RMS)を0〜1で計算
  let sumSquares = 0;
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128;
    sumSquares += v * v;
  }
  const rms = Math.sqrt(sumSquares / data.length);

  // メーター表示(見やすいように4倍)
  meterFill.style.width = Math.min(100, rms * 100 * 4) + "%";

  const now = performance.now();
  const isLoud = rms > threshold;
  meterFill.classList.toggle("buzz", isLoud);

  // しきい値を超えたら停止
  if (isLoud && now > cooldownUntil) {
    if (playerReady && player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    }
    cooldownUntil = now + COOLDOWN_MS;
  }

  micRafId = requestAnimationFrame(monitorMic);
}

micToggle.addEventListener("click", () => {
  if (micEnabled) disableMic();
  else enableMic();
});
