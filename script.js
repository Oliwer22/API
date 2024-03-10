const morseCode = {
  'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..',
  'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
  'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
  'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
  'q': '--.-', 'r': '.-.', 's': '...', 't': '-',
  'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
  'y': '-.--', 'z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.'
};

let audioContext;
let oscillator;
let gainNode;
let recognition;
let morse = '';

function textToMorse(text) {
  return text.split('').map(char => morseCode[char.toLowerCase()] || char).join(' ');
}

function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(0);

  gainNode.gain.value = 0;
}

function beep(duration) {
  gainNode.gain.value = 1;
  setTimeout(() => gainNode.gain.value = 0, duration);
}

function morseToBeeps(morse) {
  let time = 0;

  for (const char of morse) {
    if (char === '.') {
      setTimeout(() => beep(100), time);
      time += 200;
    } else if (char === '-') {
      setTimeout(() => beep(300), time);
      time += 400;
    } else {
      time += 200;
    }
  }
}

function startSpeechRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    const text = event.results[0][0].transcript;
    document.getElementById('input').value = text;
    morse = textToMorse(text);
    document.getElementById('morseOutput').innerText = morse;
  };
}

function stopSpeechRecognition() {
  if (recognition) {
    recognition.stop();
  }
}

function updateMorseOutput() {
  const text = document.getElementById('input').value;
  morse = textToMorse(text);
  document.getElementById('morseOutput').innerText = morse;
}

function demorseInput() {
  const morseInput = document.getElementById('morseInput').value;
  const text = morseToText(morseInput);
  document.getElementById('morseOutput').innerText = text;
}

function morseToText(morse) {
  const morseArray = morse.split(' ');
  return morseArray.map(code => Object.keys(morseCode).find(key => morseCode[key] === code) || ' ').join('');
}

document.getElementById('translateButton').addEventListener('click', updateMorseOutput);
document.getElementById('speakButton').addEventListener('click', () => {
  if (!audioContext) {
    initAudio();
  }
  morseToBeeps(morse);
});
document.getElementById('demorseButton').addEventListener('click', demorseInput);
document.getElementById('copyMorseButton').addEventListener('click', function() {
  const morseOutput = document.getElementById('morseOutput');
  
  // Create a temporary input element
  const tempInput = document.createElement('textarea');
  tempInput.value = morseOutput.innerText;
  document.body.appendChild(tempInput);
  
  // Select and copy the text
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
});
