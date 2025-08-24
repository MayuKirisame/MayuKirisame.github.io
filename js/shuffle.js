// Xorshiftアルゴリズムを実装した疑似乱数生成器
function createSeededRandom(seed) {
  let x = seed;
  return function () {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return Math.abs(x / 2147483647); // 32-bit signed integerの最大値で割って0-1の範囲に正規化
  };
}

// Fisher-Yatesシャッフルアルゴリズム
function shuffle(array, seededRandom) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

document.addEventListener("DOMContentLoaded", () => {
  const minInput = document.getElementById("min");
  const maxInput = document.getElementById("max");
  const seedInput = document.getElementById("seed");
  const shuffleButton = document.getElementById("shuffle-button");
  const shuffledArrayOutput = document.getElementById("shuffled-array");
  const queryKInput = document.getElementById("query-k");
  const findNextButton = document.getElementById("find-next-button");
  const resultNextK = document.getElementById("result-next-k");
  const queryIInput = document.getElementById("query-i");
  const findIndexButton = document.getElementById("find-index-button");
  const resultIndexI = document.getElementById("result-index-i");
  const nextButton = document.getElementById("next-button");
  const currentValueSpan = document.getElementById("current-value");
  const nextValueSpan = document.getElementById("next-value");

  let shuffledArray = [];
  let currentIndex = -1; // -1から始めることで、初回に0番目を表示可能

  // Xorshiftアルゴリズムを実装した疑似乱数生成器
  function createSeededRandom(seed) {
    let x = seed;
    return function () {
      x ^= x << 13;
      x ^= x >> 17;
      x ^= x << 5;
      return Math.abs(x / 2147483647);
    };
  }

  // Fisher-Yatesシャッフルアルゴリズム
  function shuffle(array, seededRandom) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(seededRandom() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }

  // 「現在の数値」と「次の数値」を更新するヘルパー関数
  function updateNextGroup(index) {
    currentIndex = index;
    if (currentIndex >= 0 && currentIndex < shuffledArray.length) {
      currentValueSpan.textContent = shuffledArray[currentIndex];
      if (currentIndex + 1 < shuffledArray.length) {
        nextValueSpan.textContent = shuffledArray[currentIndex + 1];
      } else {
        nextValueSpan.textContent = "最後の要素です。";
      }
    } else {
      currentValueSpan.textContent = "--";
      nextValueSpan.textContent = "--";
    }
  }

  // 並び替えボタンの処理
  shuffleButton.addEventListener("click", () => {
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);
    const seed = parseInt(seedInput.value);

    if (isNaN(min) || isNaN(max) || isNaN(seed) || min > max) {
      alert("有効な数値を入力してください。");
      return;
    }

    let initialArray = [];
    for (let i = min; i <= max; i++) {
      initialArray.push(i);
    }

    const seededRandom = createSeededRandom(seed);
    shuffledArray = shuffle(initialArray, seededRandom);

    shuffledArrayOutput.textContent = `[ ${shuffledArray.join(", ")} ]`;
    updateNextGroup(-1);
  });

  // 条件3: 特定の数値kの次のindexを検索
  findNextButton.addEventListener("click", () => {
    if (shuffledArray.length === 0) {
      alert("まず「並び替え」ボタンを押してください。");
      return;
    }
    const k = parseInt(queryKInput.value);
    const index = shuffledArray.indexOf(k);

    if (index === -1) {
      resultNextK.textContent = "数列内にkが見つかりません。";
    } else if (index === shuffledArray.length - 1) {
      resultNextK.textContent = "kは数列の最後の要素です。";
    } else {
      resultNextK.textContent = shuffledArray[index + 1];
    }

    // 「次へ」グループを更新
    if (index !== -1) {
      updateNextGroup(index);
    }
  });

  // 条件4: i番目の数値を検索
  findIndexButton.addEventListener("click", () => {
    if (shuffledArray.length === 0) {
      alert("まず「並び替え」ボタンを押してください。");
      return;
    }
    const i = parseInt(queryIInput.value);
    if (isNaN(i) || i < 0 || i >= shuffledArray.length) {
      resultIndexI.textContent = "有効なインデックスを入力してください。";
    } else {
      resultIndexI.textContent = shuffledArray[i];
    }

    // 「次へ」グループを更新
    if (!isNaN(i) && i >= 0 && i < shuffledArray.length) {
      updateNextGroup(i);
    }
  });

  // 条件5: 「次へ」ボタンの処理
  nextButton.addEventListener("click", () => {
    if (shuffledArray.length === 0) {
      alert("まず「並び替え」ボタンを押してください。");
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < shuffledArray.length) {
      updateNextGroup(nextIndex);
    } else {
      currentValueSpan.textContent = shuffledArray[currentIndex];
      nextValueSpan.textContent = "最後の要素です。";
    }
  });
});
