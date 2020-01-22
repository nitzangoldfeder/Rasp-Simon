// simon game
const idMap = {
  '0': { name: 'red-circle', normal: 'rgba(255, 0, 0, 1)', highlight: 'rgba(255, 0, 0, .5)' },
  '1': { name: 'yellow-circle', normal: 'rgba(255, 174, 0, 1)', highlight: 'rgba(255, 174, 0, .5)' },
  '2': { name: 'green-circle', normal: 'rgba(0, 255, 0, 1)', highlight: 'rgba(0, 255, 0, .5)' },
  '3': { name: 'blue-circle', normal: 'rgba(0, 0, 255, 1)', highlight: 'rgba(0, 0, 255, .5)' }
};

const iconsMap = {
  banana: '🍌',
  greenApple: '🍏',
  redApple: '🍎',
  orange: '🍊',
  tomato: '🍅',
  cucumber: '🥒',
  kiwi: '🥝'
};

const urlString = window.location;
const url = new URL(urlString);
const host = url.searchParams.get('host');
console.log('host', host);

const socket = io(`http://${host}:5000`);
const scoreDiv = document.getElementById('score-count');
const controllerDiv = document.getElementById('controller');

const redInputDiv = document.getElementById('red-icon');
const yellowInputDiv = document.getElementById('yellow-icon');
const greenInputDiv = document.getElementById('green-icon');
const blueInputDiv = document.getElementById('blue-icon');

let pressStrokes = [];
let receivedPressStrokes = [];

controllerDiv.addEventListener('click', startGame);

socket.on('interaction', data => {
  console.log('recieved interaction', data);
  const idName = idMap[data.press];
  playAnimation(idName);
  receivePressEvent(data.press);
});

redInputDiv.addEventListener('change', iconEventListener);
blueInputDiv.addEventListener('change', iconEventListener);
yellowInputDiv.addEventListener('change', iconEventListener);
greenInputDiv.addEventListener('change', iconEventListener);

function iconEventListener(e) {
  const icons = Object.keys(iconsMap);
  const value = e.target.value;
  if (icons.indexOf(value) < 0) {
    return;
  }

  const divId = e.target.attributes['data-color-div-id'].nodeValue;
  const colorDiv = document.getElementById(divId);
  colorDiv.innerHTML = iconsMap[value];
}

function playAnimation(idName) {
  console.log('playing animation', idName);
  const colorDiv = document.getElementById(idName.name);
  colorDiv.style.backgroundColor = idName.highlight;
  setTimeout(() => {
    colorDiv.style.backgroundColor = idName.normal;
  }, 1000);
}

function rollNumber() {
  return Math.floor(Math.random() * Math.floor(4));
}

function startGame() {
  controllerDiv.innerHTML = 'משחק חדש';
  resetGame();
  nextLevel();
}

function resetGame() {
  console.log('reset game');
  controllerDiv.classList.remove('game-over');
  pressStrokes = [];
  receivedPressStrokes = [];
  scoreDiv.innerHTML = 0;
}

function nextLevel() {
  receivedPressStrokes = [];
  const id = rollNumber();
  console.log('nextLevel id', id);
  pressStrokes.push(id);
  wait().then(playPressStrokes);
}

function wait() {
  return new Promise(res => {
    setTimeout(() => {
      res();
    }, 1050);
  });
}

function playPressStrokes() {
  for (const id of pressStrokes) {
    const idName = idMap[`${id}`];
    socket.emit('play', { key: id });
    wait().then(() => playAnimation(idName));
  }
}

function receivePressEvent(id) {
  console.log('receivePressEvent', id);
  receivedPressStrokes.push(id);
  const ind = receivedPressStrokes.length - 1;
  // Case no match
  if (receivedPressStrokes[ind] !== pressStrokes[ind]) {
    console.log('Input didnt match', receivedPressStrokes[ind], pressStrokes[ind]);
    controllerDiv.innerHTML = 'נפסלת';
    controllerDiv.classList.add('game-over');
    return;
  }

  wait().then(() => {
    // case didnt complete the key strokes
    if (receivedPressStrokes.length !== pressStrokes.length) {
      return;
    }
    // Increase Score
    scoreDiv.innerHTML = Number(scoreDiv.innerHTML) + 1;
    nextLevel();
  });
}
