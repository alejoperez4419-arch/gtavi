(() => {
  'use strict';

  const init = () => {
    const form = document.getElementById('generatorForm');
    const playerIdInput = document.getElementById('playerId');
    const errorMessage = document.getElementById('errorMessage');
    const formSection = document.getElementById('formSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection = document.getElementById('resultSection');
    const restartButton = document.getElementById('restartButton');
    const installButton = document.getElementById('installButton');
    const nextButton = form.querySelector('button[type="submit"]');
    const platformButtons = Array.from(document.querySelectorAll('.platform-option'));

    if (!form || !playerIdInput || !formSection || !loadingSection || !resultSection) {
      console.error('GTA VI Generator: required HTML elements were not found.');
      return;
    }

    let selectedPlatform = '';
    let installPromptEvent = null;
    let isGenerating = false;
    let generationTimer = null;

    const showSection = (name) => {
      formSection.hidden = name !== 'form';
      loadingSection.hidden = name !== 'loading';
      resultSection.hidden = name !== 'result';
      const active = name === 'form' ? formSection : name === 'loading' ? loadingSection : resultSection;
      active.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const setError = (message) => {
      errorMessage.textContent = message;
    };

    platformButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedPlatform = button.dataset.platform || '';
        platformButtons.forEach((option) => {
          const isSelected = option === button;
          option.classList.toggle('selected', isSelected);
          option.setAttribute('aria-pressed', String(isSelected));
        });
        setError('');
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (isGenerating) return;

      const playerId = playerIdInput.value.trim();
      if (!playerId) {
        setError('Please enter your player ID.');
        playerIdInput.focus();
        return;
      }
      if (!selectedPlatform) {
        setError('Please choose a platform to continue.');
        document.querySelector('.platform-heading').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setError('');
      document.getElementById('resultPlayerId').textContent = playerId;
      document.getElementById('resultPlatform').textContent = selectedPlatform;
      isGenerating = true;
      if (nextButton) nextButton.disabled = true;
      showSection('loading');

      // Display the loading screen for exactly 1,500 milliseconds.
      window.clearTimeout(generationTimer);
      generationTimer = window.setTimeout(() => {
        isGenerating = false;
        if (nextButton) nextButton.disabled = false;
        showSection('result');
      }, 1500);
    });

    restartButton.addEventListener('click', () => {
      window.clearTimeout(generationTimer);
      isGenerating = false;
      if (nextButton) nextButton.disabled = false;
      form.reset();
      selectedPlatform = '';
      platformButtons.forEach((button) => {
        button.classList.remove('selected');
        button.setAttribute('aria-pressed', 'false');
      });
      setError('');
      showSection('form');
      window.setTimeout(() => playerIdInput.focus({ preventScroll: true }), 250);
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPromptEvent = event;
      installButton.classList.add('install-ready');
    });

    installButton.addEventListener('click', async () => {
      if (installPromptEvent) {
        installPromptEvent.prompt();
        try { await installPromptEvent.userChoice; } catch (error) { console.info('Install prompt dismissed.'); }
        installPromptEvent = null;
        installButton.classList.remove('install-ready');
        return;
      }

      const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
      if (isStandalone) {
        window.alert('The app is already installed on this device.');
      } else if (isAppleMobile) {
        window.alert('To install this app, tap Share in Safari and choose “Add to Home Screen”.');
      } else {
        window.alert('To install, open your browser menu and choose “Install app” or “Add to Home screen”.');
      }
    });

    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
          console.warn('Service worker registration failed:', error);
        });
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
