const convert = require('./convert');

const bungeeInput = document.getElementById('bungee');
const convertForm = document.getElementById('convert-form');
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('convert');
const errorAlert = document.getElementById('errorAlert');
const convertedBlock = document.getElementById('converted');
const convertedConfig = document.getElementById('convertedConfig');
const copyButton = document.getElementById('copyButton');

let converting = false;

const removeHoverClasses = elem => {
  const classes = elem.className.split(' ');

  elem.className = classes
    .filter(className => !className.startsWith('hover:'))
    .join(' ');
};

function setConverting() {
  // Disable button
  submitButton.setAttribute('disabled', '');
  submitButton.classList.add('opacity-50', 'cursor-not-allowed');
  removeHoverClasses(submitButton);

  submitButton.innerText = 'Converting...';

  converting = true;
}

function setConverted() {
  submitButton.innerText = 'Converted';
}

function displayVelocity(velocityConfig) {
  convertedConfig.innerText = velocityConfig;
  convertedBlock.removeAttribute('hidden');
}

function displayError(err) {
  errorAlert.innerText = err;
  errorAlert.removeAttribute('hidden');
}

convertForm.addEventListener('submit', e => {
  // Prevent form submit
  e.preventDefault();

  if (converting) {
    return;
  }

  setConverting();

  const bungeeConfig = bungeeInput.value;

  try {
    const velocityConfig = convert(bungeeConfig);

    displayVelocity(velocityConfig);
    setConverted();
  } catch (err) {
    displayError(err);
  }
});

clearButton.addEventListener('click', e => {
  // Prevent form submit
  e.preventDefault();

  bungeeInput.value = '';
});

copyButton.addEventListener('click', e => {
  e.preventDefault();

  convertedConfig.focus();
  convertedConfig.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    displayError('Your browser does not support copying to clipboard');
  }
});
