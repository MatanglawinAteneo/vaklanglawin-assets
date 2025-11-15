pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Background image constant
const SPARKBG_IMAGE = 'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/sparkbg.jpg ';

// ===== ASSET PRELOADER AND LOADING SCREEN =====
const ASSETS_TO_PRELOAD = {
  images: [
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/lawin.gif',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/kween-mermaid.png',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/pageant-name.png',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/congrats.png',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/makeup.png',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/sparkbg.jpg'
  ],
  audio: [
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.mp3',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/crowd.mp3',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/pwede-ba.mp3',
    'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/qna.mp3'
  ]
};

class AssetPreloader {
  constructor(assets) {
    this.assets = assets;
    this.loadedCount = 0;
    this.totalCount = assets.images.length + assets.audio.length;
    this.loadingBar = document.getElementById('loadingBar');
    this.loadingText = document.getElementById('loadingText');
    this.loadingScreen = document.getElementById('loadingScreen');
  }

  updateProgress() {
    const percentage = Math.round((this.loadedCount / this.totalCount) * 100);
    this.loadingBar.style.width = percentage + '%';
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedCount++;
        this.updateProgress();
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        this.loadedCount++;
        this.updateProgress();
        resolve(null);
      };
      img.src = src;
    });
  }

  loadAudio(src) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => {
        this.loadedCount++;
        this.updateProgress();
        resolve(audio);
      }, { once: true });
      audio.addEventListener('error', () => {
        console.warn(`Failed to load audio: ${src}`);
        this.loadedCount++;
        this.updateProgress();
        resolve(null);
      }, { once: true });
      audio.src = src;
    });
  }

  async preloadAll() {
    const startTime = Date.now();

    const imagePromises = this.assets.images.map(src => this.loadImage(src));
    const audioPromises = this.assets.audio.map(src => this.loadAudio(src));

    await Promise.all([...imagePromises, ...audioPromises]);

    // Ensure loading screen shows for at least 2 seconds
    const elapsedTime = Date.now() - startTime;
    const minLoadTime = 2000;
    if (elapsedTime < minLoadTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
    }

    // Hide characters and page-container BEFORE any transitions
    const pageContainer = document.querySelector('.page-container');
    const characterContainer = document.querySelector('.character-container');
    const host = document.querySelector('.host');
    const kween = document.querySelector('.kween');

    if (pageContainer) pageContainer.style.display = 'none';
    if (characterContainer) characterContainer.style.opacity = '0';
    if (host) host.style.display = 'none';
    if (kween) kween.style.display = 'none';

    // Remove shimmer before blink transition
    document.body.classList.add('story-mode');

    // Fade out loading screen and start blink immediately
    this.loadingScreen.classList.add('fade-out');

    // Start the blink transition immediately
    const blinkTransition = document.getElementById('blinkTransition');
    blinkTransition.classList.add('blink-active');

    // After loading screen fades out
    setTimeout(() => {
      this.loadingScreen.remove();

      // Remove blink after transition completes
      setTimeout(() => {
        blinkTransition.classList.remove('blink-active');

        // Show pageant name flash overlay
        const pageantFlash = document.getElementById('pageantFlashOverlay');
        pageantFlash.classList.add('active');

        // Remove shimmer during flash overlay
        document.body.classList.add('story-mode');

        // Play sound effects
        cameraSound.play().catch(e => console.log('Camera sound play failed:', e));
        clapSound.play().catch(e => console.log('Clap sound play failed:', e));

        // Flash in
        setTimeout(() => {
          pageantFlash.classList.add('show');
        }, 50);

        // Flash out after 2 seconds
        setTimeout(() => {
          pageantFlash.classList.remove('show');

          // Remove active class after fade out completes
          setTimeout(() => {
            pageantFlash.classList.remove('active');

            // Restore shimmer after flash
            document.body.classList.remove('story-mode');

            // Restore characters and page-container visibility
            if (pageContainer) {
              pageContainer.style.display = 'flex';
              pageContainer.style.opacity = '1';
            }
            if (characterContainer) characterContainer.style.opacity = '1';
            if (host) host.style.display = 'block';

            // Start background music
            bgMusic.play().catch(e => console.log('Background music play failed:', e));

            // Now start with the first scene
            loadScene(0);
          }, 500);
        }, 2000);
      }, 1000); // Wait for blink to complete
    }, 1000);
  }
}

// Start preloading immediately
const preloader = new AssetPreloader(ASSETS_TO_PRELOAD);
preloader.preloadAll();

// Background music
const bgMusic = new Audio('https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.mp3');
bgMusic.loop = true;

// Crowd sound effect (using HTML audio element)
const crowdSound = document.getElementById('crowdSound');

// Pageant flash sound effects
const cameraSound = new Audio('https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/camera.mp3');
const clapSound = new Audio('https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/clap.mp3');

// ---- Crossfade overlay layer ----
const bgFadeLayer = document.createElement("div");
bgFadeLayer.className = "bg-fade-layer";
document.body.appendChild(bgFadeLayer);

// ===== SPARKLES FUNCTIONS =====
let sparkleInterval = null;

function createSparkle() {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = Math.random() * 100 + '%';
  sparkle.style.animationDelay = Math.random() * 2 + 's';
  sparkle.style.animationDuration = (Math.random() * 3 + 2) + 's';

  const sparklesContainer = document.getElementById('sparklesContainer');
  if (sparklesContainer) {
    sparklesContainer.appendChild(sparkle);

    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 5000);
  }
}

function startSparkles() {
  sparkleInterval = setInterval(createSparkle, 200);
}

function stopSparkles() {
  if (sparkleInterval) {
    clearInterval(sparkleInterval);
    sparkleInterval = null;
  }
  const sparklesContainer = document.getElementById('sparklesContainer');
  if (sparklesContainer) {
    sparklesContainer.innerHTML = '';
  }
}

// ---------- Congrats Scene Transition ----------
function transitionToCongratsScene() {
  const congratsScreen = document.querySelector('.congrats-screen');
  const pageContainer = document.querySelector('.page-container');
  const navButton = document.querySelector('.nav-button');
  const padlockOverlay = document.getElementById('padlockOverlay');
  const padlockCheckbox = document.getElementById('padlockCheckbox');
  const congratsTitleImg = document.getElementById('congratsTitleImg');
  const heelsPrize = document.getElementById('heelsPrize');
  const congratsContainer = document.getElementById('congratsContainer');
  const congratsTextEl = document.getElementById('congratsText');
  const crowdSound = document.getElementById('crowdSound');

  // Fade out page container and nav button
  if (pageContainer) {
    pageContainer.style.transition = 'opacity 1s ease';
    pageContainer.style.opacity = '0';
  }
  if (navButton) {
    navButton.style.transition = 'opacity 1s ease';
    navButton.style.opacity = '0';
  }

  setTimeout(() => {
    // Hide page container and nav button
    if (pageContainer) pageContainer.style.display = 'none';
    if (navButton) navButton.style.display = 'none';

    // Change background music to pwede-ba
    bgMusic.src = 'https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/pwede-ba.mp3';
    bgMusic.volume = 1;
    bgMusic.load();
    bgMusic.play().catch(e => console.error('Congrats music play failed:', e));

    // Change background to sparkbg
    bgFadeLayer.style.backgroundImage = `url("${SPARKBG_IMAGE}")`;
    bgFadeLayer.style.opacity = "0";
    bgFadeLayer.style.transition = "opacity 1.5s ease";
    bgFadeLayer.offsetHeight;
    bgFadeLayer.style.opacity = "1";

    setTimeout(() => {
      document.body.style.backgroundImage = `url("${SPARKBG_IMAGE}")`;
      bgFadeLayer.style.opacity = "0";
    }, 1500);

    // Show shimmer effect
    document.body.classList.add('show-shimmer');

    // Show congrats screen (blurred) and padlock
    congratsScreen.classList.add('active');
    congratsScreen.classList.add('show');
    congratsContainer.style.filter = 'blur(10px)';

    // Show padlock overlay
    padlockOverlay.classList.add('active');

    // Trigger padlock animation after 500ms
    setTimeout(() => {
      padlockCheckbox.checked = true;
    }, 500);

    // Fade out padlock and unblur scene after animation
    setTimeout(() => {
      padlockOverlay.classList.add('fade-out');
      congratsTitleImg.classList.add('unblur');
      heelsPrize.classList.add('unblur');
      congratsContainer.style.filter = 'blur(0px)';

      // Add click event listener to heelsPrize for redirection
      heelsPrize.addEventListener('click', () => {
        window.location.href = 'www.matanglawin-ateneo.com/vaklanglawin/qna-prize';
      });

      // Play crowd sound when padlock animation is done
      crowdSound.currentTime = 0;
      crowdSound.play().catch(e => console.log('Crowd sound play failed:', e));

      // Type the congrats text after unblur
      setTimeout(() => {
        const originalText = congratsTextEl.textContent.trim();
        typeText(originalText, congratsTextEl);
      }, 500);
    }, 2500);
  }, 1000);
}

// ===== CONGRATS SCENE LOGIC =====
const congratsWrapper = document.querySelector(".congrats-wrapper");
const hileraWrapper = document.querySelector(".hilera-wrapper");

const scenes = [
  { 
    speaker: "Host Lawin", 
    text: "You look stunning tonight, Candidate No.3! Baklang twoah!", 
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    noShimmer: true  // This scene will have NO shimmer
  },
  { 
    speaker: "Kween", 
    text: "Thank you! You too! You look dashing tonight! Your head, it's so big!", 
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    noShimmer: true  // This scene will have NO shimmer
  },
  { 
    speaker: "Host Lawin", 
    text: "Alright! So you won two of the major awards: Best in Talent and Best in National Costume. Do you feel any pressure right now?", 
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    noShimmer: true  // This scene will have NO shimmer
  },
  { 
    speaker: "Kween", 
    text: "No, I don't feel any fressure right now.", 
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    noShimmer: true  // This scene will have NO shimmer
  },
  { 
    speaker: "Host Lawin", 
    text: "Confident! Alright! We shall proceed then. Kindly get the remaining envelope for your question.", 
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    triggerEnvelope: true 
  },
  {
    speaker: "Host Lawin",
    text: "Your question goes a little something like this, \"What role did your family play to you as candidate to the 50th Bb. Vaklanglawin Grand Pangkalawakan?\"",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    letterScene: true,
    noShimmer: true  // This scene will have NO shimmer
  },
  {
    speaker: "Kween",
    text: "Well, my family's role for me is so important because ________ the reason why I am standing here right now.",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    grammarGame: true,
    choices: ["there was", "they are"],
    correct: 1,
    fadeIn: true,
    changeMusic: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/qna.mp3"
  },
  {
    speaker: "Kween",
    text: "My pamily... My family... Oh my god... This was really my pirst pageant ever b'coz I'm only 20 years old. I did not expect that I ________ one of the taf 10. Nonetheless, my family has been so supportive of me in every way!",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    grammarGame: true,
    choices: ["came from", "come from"],
    correct: 0
  },
  {
    speaker: "Host Lawin",
    text: "It's okay, Candidate No. 3! Your pamily would be even prouder if you speak from your heart! Go speak the language your heart desires.",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    hostMiddle: true,
    noShimmer: true  // This scene will have NO shimmer
  },
  {
    speaker: "Kween",
    text: "Kamsamnida! Kung hindi dahil sa di matatawarang pagmamahal at suporta ng aking pamilya, wala ako ngayon sa inyong harapan.",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    kweenMiddle: true,
    noShimmer: true  // This scene will have NO shimmer
  },
  {
    speaker: "Kween",
    text: "Ang _______, _______, at _______ na gamit ko ngayon ay ilan lamang sa mga bagay na ibinigay nila sa akin upang makasali ako sa patimpalak na ito.",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    multiChoice: true
  },
  {
    speaker: "Kween",
    text: "Sa madaling sabi, kung ano at sino man ako ngayon sa loob at labas ng pageant na ito ay produkto iyon ng paghubog ng pamilya kong walang sawang naniniwala sa akin. Buo ang loob kong ipagmalaki ang sarili ko ngayon dahil alam kong ganoon din ang pamilya ko sa akin.",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    kweenMiddle: true,
    noShimmer: true  // This scene will have NO shimmer
  },
  {
    speaker: "Kween",
    text: "Magsilbing panawagan sana ito sa lahat na buksan ang puso at isip sa kulay ng pagkatao ng kanilang anak, kapatid, pamangkin, apo, kaibigan, at iba pa. Dahil sa lipunang may puwang para sa lahat, tunay na sumisigla ang pag-ibig at pagkakapantay-pantay. And I, thank you!",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/stage.jpg",
    kweenMiddle: true,
    noShimmer: true  // This scene will have NO shimmer
  },
  {
    speaker: "Congratulations",
    bg: "https://raw.githubusercontent.com/MatanglawinAteneo/vaklanglawin-assets/main/sparkbg.jpg",
    congratulations: true
  }
];

let currentScene = 0;
let selectedWords = [];
let isTyping = false;
let skipTyping = false;
let currentFullText = "";

const header = document.querySelector(".content-header");
const body = document.getElementById("mainContentBody");
const host = document.querySelector(".host");
const kween = document.querySelector(".kween");
const navButton = document.querySelector(".nav-button");
const envelope = document.querySelector(".envelope");
const letterScene = document.querySelector(".letter-scene");
const grammarScene = document.querySelector(".grammar-scene");
const multiChoiceScene = document.querySelector(".multi-choice-scene");
const leftBtn = document.querySelector(".choice-btn.left");
const rightBtn = document.querySelector(".choice-btn.right");
const hostMiddle = document.querySelector(".host-middle");
const kweenMiddle = document.querySelector(".kween-standing-middle");
const multiChoiceBtns = document.querySelectorAll(".choice-btn.multi");
const feedbackOverlay = document.querySelector(".feedback-overlay");
const congratsTitle = document.querySelector(".congratulations-title");
const heelsImage = document.querySelector(".heels-image");
const magicDust = document.querySelector(".magic-dust");
const padlockOverlay = document.querySelector(".padlock-overlay");
const padlockCheckbox = document.getElementById("lock");

function triggerPadlock() {
  padlockOverlay.classList.add("active");
  setTimeout(() => padlockCheckbox.checked = true, 500);
  setTimeout(() => padlockOverlay.classList.add("fade-out"), 2500);
  setTimeout(() => {
    padlockOverlay.classList.remove("active", "fade-out");
    padlockCheckbox.checked = false;
  }, 3000);
}

function createMagicDust() {
  magicDust.classList.add("active");
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.className = "dust-particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = (Math.random() * 3 + 4) + "s";
    particle.style.animationDelay = Math.random() * 2 + "s";
    magicDust.appendChild(particle);
  }
}

function clearMagicDust() {
  magicDust.classList.remove("active");
  magicDust.innerHTML = "";
}

function typeText(text, element, speed = 25) {
  return new Promise((resolve) => {
    isTyping = true;
    skipTyping = false;
    currentFullText = text;
    element.textContent = "";
    let index = 0;
    
    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    element.appendChild(cursor);
    
    function type() {
      if (skipTyping) {
        element.textContent = currentFullText;
        cursor.remove();
        isTyping = false;
        skipTyping = false;
        resolve();
        return;
      }
      
      if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        element.appendChild(cursor);
        index++;
        setTimeout(type, speed);
      } else {
        cursor.remove();
        isTyping = false;
        resolve();
      }
    }
    
    type();
  });
}

function loadScene(index) {
  const scene = scenes[index];

  // Remove shimmer for specific scenes
  if (scene.noShimmer) {
    document.body.classList.add('story-mode');
  } else {
    document.body.classList.remove('story-mode');
  }

  header.textContent = scene.speaker;
  document.body.style.backgroundImage = `url(${scene.bg})`;

  // Handle music change if specified
  if (scene.changeMusic) {
    bgMusic.src = scene.changeMusic;
    bgMusic.loop = true;
    bgMusic.load();
    bgMusic.play().catch(e => console.log('Music change failed:', e));
  }

  // Handle fade-in if specified
  if (scene.fadeIn) {
    const pageContainer = document.querySelector('.page-container');
    const grammarSceneEl = document.querySelector('.grammar-scene');

    if (pageContainer) {
      pageContainer.style.opacity = '0';
      pageContainer.style.transition = 'opacity 1s ease';
    }
    if (grammarSceneEl) {
      grammarSceneEl.style.opacity = '0';
      grammarSceneEl.style.transition = 'opacity 1s ease';
    }

    setTimeout(() => {
      if (pageContainer) pageContainer.style.opacity = '1';
      if (grammarSceneEl) grammarSceneEl.style.opacity = '1';
    }, 50);
  }

  host.style.display = "none";
  kween.style.display = "none";
  hostMiddle.style.display = "none";
  kweenMiddle.style.display = "none";
  envelope.classList.remove("show");
  letterScene.style.display = "none";
  grammarScene.style.display = "none";
  multiChoiceScene.style.display = "none";
  navButton.style.display = "none";
  congratsTitle.style.display = "none";
  heelsImage.classList.remove("show");
  clearMagicDust();

  leftBtn.classList.remove("correct-clicked");
  rightBtn.classList.remove("correct-clicked");

  typeText(scene.text, body);

  if (scene.congratulations) {
    transitionToCongratsScene();
    return;
  }

  if (!scene.triggerEnvelope && !scene.letterScene && !scene.grammarGame && !scene.hostMiddle && !scene.kweenMiddle && !scene.multiChoice) {
    host.style.display = "block";
    kween.style.display = "block";
    navButton.style.display = "flex";
    navButton.style.pointerEvents = "auto";
    navButton.style.cursor = "pointer";
  }

  if (scene.triggerEnvelope) {
    host.style.display = "none";
    kween.style.display = "none";
    envelope.classList.add("show");
  }

  if (scene.letterScene) {
    letterScene.style.display = "flex";
    navButton.style.display = "flex";
  }

  if (scene.grammarGame) {
    grammarScene.style.display = "flex";
    if (scene.choices) {
      leftBtn.textContent = scene.choices[0];
      rightBtn.textContent = scene.choices[1];
    }
  }

  if (scene.hostMiddle) {
    hostMiddle.style.display = "block";
    navButton.style.display = "flex";
  }

  if (scene.kweenMiddle) {
    kweenMiddle.style.display = "block";
    navButton.style.display = "flex";
  }

  if (scene.multiChoice) {
    multiChoiceScene.style.display = "flex";
    selectedWords = [];
    multiChoiceBtns.forEach(btn => {
      btn.classList.remove("selected");
      btn.style.pointerEvents = "auto";
    });
  }
}

navButton.addEventListener("click", () => {
  if (isTyping) {
    skipTyping = true;
    return;
  }
  currentScene++;
  if (currentScene >= scenes.length) currentScene = 0;
  loadScene(currentScene);
});

document.addEventListener("click", (e) => {
  if (isTyping && !e.target.closest('.choice-btn') && !e.target.closest('.nav-button') && !e.target.closest('.envelope') && !e.target.closest('.heels-image')) {
    skipTyping = true;
  }
});

envelope.addEventListener("click", () => {
  envelope.classList.remove("show");
  envelope.style.display = "none";
  currentScene++;
  loadScene(currentScene);
});

heelsImage.addEventListener("click", () => {
  // Transition to Hilera scene
  congratsWrapper.classList.add("hidden");
  hileraWrapper.classList.add("active");
  document.body.style.backgroundImage = "url('stage.jpg')";
});

function createConfetti() {
  const RAINBOW = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  const duration = 600;
  const endTime = Date.now() + duration;
  
  function rainFrame() {
    if (Date.now() >= endTime) return;
    
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0 },
      colors: RAINBOW,
      startVelocity: 50,
      gravity: 2.5,
      scalar: 1.1,
      drift: 0,
      ticks: 80
    });
    
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0 },
      colors: RAINBOW,
      startVelocity: 50,
      gravity: 2.5,
      scalar: 1.1,
      drift: 0,
      ticks: 80
    });
    
    requestAnimationFrame(rainFrame);
  }
  
  rainFrame();
}

leftBtn.addEventListener("click", () => {
  const scene = scenes[currentScene];
  if (scene.grammarGame && scene.correct === 0) {
    leftBtn.classList.add("correct-clicked");
    handleCorrectAnswer(leftBtn);
  } else {
    document.body.classList.add("shake");
    feedbackOverlay.classList.add("show-wrong");
    setTimeout(() => {
      document.body.classList.remove("shake");
      feedbackOverlay.classList.remove("show-wrong");
    }, 500);
  }
});

rightBtn.addEventListener("click", () => {
  const scene = scenes[currentScene];
  if (scene.grammarGame && scene.correct === 1) {
    rightBtn.classList.add("correct-clicked");
    handleCorrectAnswer(rightBtn);
  } else {
    document.body.classList.add("shake");
    feedbackOverlay.classList.add("show-wrong");
    setTimeout(() => {
      document.body.classList.remove("shake");
      feedbackOverlay.classList.remove("show-wrong");
    }, 500);
  }
});

function handleCorrectAnswer(btn) {
  feedbackOverlay.classList.add("show-correct");
  createConfetti();

  setTimeout(() => {
    feedbackOverlay.classList.remove("show-correct");
  }, 700);

  setTimeout(() => {
    currentScene++;
    if (currentScene < scenes.length) {
      loadScene(currentScene);
    }
  }, 1700);
}

multiChoiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const isCorrect = btn.dataset.correct === "true";
    
    if (isCorrect) {
      if (btn.classList.contains("selected")) {
        return;
      }
      
      btn.classList.add("selected");
      feedbackOverlay.classList.add("show-correct");
      createConfetti();
      selectedWords.push(btn.dataset.word);
      
      setTimeout(() => {
        feedbackOverlay.classList.remove("show-correct");
      }, 700);

      if (selectedWords.length === 3) {
        setTimeout(() => {
          currentScene++;
          if (currentScene < scenes.length) {
            loadScene(currentScene);
          }
        }, 1700);
      }
    } else {
      document.body.classList.add("shake");
      feedbackOverlay.classList.add("show-wrong");
      setTimeout(() => {
        document.body.classList.remove("shake");
        feedbackOverlay.classList.remove("show-wrong");
      }, 500);
    }
  });
});

// loadScene(currentScene); // Now called from preloader after loading screen

// ===== HILERA SCENE LOGIC =====
const articlesModalOverlay = document.querySelector(".articles-modal-overlay");
const modalClose = document.querySelector(".modal-close");
const modalPdfContent = document.getElementById("modal-pdf-content");

const itemStates = {
  bistida: false,
  makeup: false,
  peluka: false,
  heels: false
};

const itemPdfs = {
  bistida: [
    { url: '1.pdf', title: 'Article 1: Maiba, Taya!' },
    { url: '2.pdf', title: 'Article 2: Homophob-yarn?!' }
  ],
  makeup: [
    { url: '3.pdf', title: 'Article 3: Hands Up, GABRIELA' },
    { url: '4.pdf', title: 'Article 4: Kabog Royale: Ang Pagdadalaga ni Arturo Bahaghari' }
  ],
  peluka: [
    { url: '5.pdf', title: 'Article 5: Ano? Babad na Babad na Kami Rito' },
    { url: '6.pdf', title: 'Article 6: TVB: Teh, Voohay ng Bakla, hook-up nga lang ba?' }
  ],
  heels: [
    { url: '7.pdf', title: 'Article 7: Isa Pa, Rampa!' }
  ]
};

let currentPdfViewers = [];

class PDFViewer {
  constructor(pdfUrl, canvasId, pageInfoId, prevBtnId, nextBtnId, fullscreenBtnId, pdfTitle) {
    this.pdfUrl = pdfUrl;
    this.pdfTitle = pdfTitle;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.pageInfo = document.getElementById(pageInfoId);
    this.prevBtn = document.getElementById(prevBtnId);
    this.nextBtn = document.getElementById(nextBtnId);
    this.fullscreenBtn = document.getElementById(fullscreenBtnId);
    
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    
    this.init();
  }
  
  async init() {
    try {
      this.pdfDoc = await pdfjsLib.getDocument(this.pdfUrl).promise;
      this.renderPage(this.pageNum);
      this.updateControls();
      
      this.prevBtn.addEventListener('click', () => this.onPrevPage());
      this.nextBtn.addEventListener('click', () => this.onNextPage());
      this.fullscreenBtn.addEventListener('click', () => this.openFullscreen());
      
      this.canvas.addEventListener('click', () => this.onNextPage());
      this.canvas.style.cursor = 'pointer';
      
    } catch (error) {
      console.error(`Error loading ${this.pdfUrl}:`, error);
      this.canvas.parentElement.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #666;">
          <p style="font-size: 18px; margin-bottom: 10px;">Error loading PDF</p>
          <p style="font-size: 14px;">Make sure ${this.pdfUrl} exists in the same folder</p>
        </div>
      `;
    }
  }
  
  openFullscreen() {
    if (this.pdfDoc) {
      openFullscreenViewer(this.pdfDoc, this.pageNum, this.pdfTitle);
    }
  }
  
  renderPage(num) {
    this.pageRendering = true;
    
    this.pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale: 1.0 });
      
      const container = this.canvas.parentElement;
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;
      
      const scaleX = containerWidth / viewport.width;
      const scaleY = containerHeight / viewport.height;
      const scale = Math.min(scaleX, scaleY);
      
      const scaledViewport = page.getViewport({ scale: scale });
      
      this.canvas.height = scaledViewport.height;
      this.canvas.width = scaledViewport.width;
      
      const renderContext = {
        canvasContext: this.ctx,
        viewport: scaledViewport
      };
      
      const renderTask = page.render(renderContext);
      
      renderTask.promise.then(() => {
        this.pageRendering = false;
        if (this.pageNumPending !== null) {
          this.renderPage(this.pageNumPending);
          this.pageNumPending = null;
        }
      });
    });
    
    this.pageInfo.textContent = `Page ${num} of ${this.pdfDoc.numPages}`;
  }
  
  queueRenderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }
  
  onPrevPage() {
    if (this.pageNum <= 1) return;
    this.pageNum--;
    this.queueRenderPage(this.pageNum);
    this.updateControls();
  }
  
  onNextPage() {
    if (this.pageNum >= this.pdfDoc.numPages) return;
    this.pageNum++;
    this.queueRenderPage(this.pageNum);
    this.updateControls();
  }
  
  updateControls() {
    this.prevBtn.disabled = this.pageNum <= 1;
    this.nextBtn.disabled = this.pageNum >= this.pdfDoc.numPages;
  }
}

let fullscreenViewer = null;
const fullscreenContainer = document.getElementById('fullscreen-container');
const fullscreenCanvas = document.getElementById('fullscreen-canvas');
const fullscreenCtx = fullscreenCanvas.getContext('2d');
const fullscreenPageInfo = document.getElementById('fullscreen-page-info');
const fullscreenPrevBtn = document.getElementById('fullscreen-prev');
const fullscreenNextBtn = document.getElementById('fullscreen-next');
const fullscreenCloseBtn = document.getElementById('fullscreen-close-btn');
const fullscreenTitle = document.getElementById('fullscreen-pdf-title');

function openFullscreenViewer(pdfDoc, startPage, pdfTitle) {
  fullscreenViewer = {
    pdfDoc: pdfDoc,
    pageNum: startPage,
    pageRendering: false,
    pageNumPending: null
  };

  fullscreenTitle.textContent = pdfTitle;

  fullscreenContainer.classList.add('active');
  renderFullscreenPage(fullscreenViewer.pageNum);
  updateFullscreenControls();

  if (fullscreenContainer.requestFullscreen) {
    fullscreenContainer.requestFullscreen();
  } else if (fullscreenContainer.webkitRequestFullscreen) {
    fullscreenContainer.webkitRequestFullscreen();
  } else if (fullscreenContainer.mozRequestFullScreen) {
    fullscreenContainer.mozRequestFullScreen();
  } else if (fullscreenContainer.msRequestFullscreen) {
    fullscreenContainer.msRequestFullscreen();
  }

  fullscreenCanvas.style.cursor = 'pointer';
}

function renderFullscreenPage(num) {
  fullscreenViewer.pageRendering = true;
  
  fullscreenViewer.pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.0 });
    
    const container = fullscreenCanvas.parentElement;
    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;
    
    const scaleX = containerWidth / viewport.width;
    const scaleY = containerHeight / viewport.height;
    const scale = Math.min(scaleX, scaleY) * 1.5;
    
    const scaledViewport = page.getViewport({ scale: scale });
    
    fullscreenCanvas.height = scaledViewport.height;
    fullscreenCanvas.width = scaledViewport.width;
    
    const renderContext = {
      canvasContext: fullscreenCtx,
      viewport: scaledViewport
    };
    
    const renderTask = page.render(renderContext);
    
    renderTask.promise.then(() => {
      fullscreenViewer.pageRendering = false;
      if (fullscreenViewer.pageNumPending !== null) {
        renderFullscreenPage(fullscreenViewer.pageNumPending);
        fullscreenViewer.pageNumPending = null;
      }
    });
  });
  
  fullscreenPageInfo.textContent = `Page ${num} of ${fullscreenViewer.pdfDoc.numPages}`;
}

function queueRenderFullscreenPage(num) {
  if (fullscreenViewer.pageRendering) {
    fullscreenViewer.pageNumPending = num;
  } else {
    renderFullscreenPage(num);
  }
}

function updateFullscreenControls() {
  fullscreenPrevBtn.disabled = fullscreenViewer.pageNum <= 1;
  fullscreenNextBtn.disabled = fullscreenViewer.pageNum >= fullscreenViewer.pdfDoc.numPages;
}

function closeFullscreenViewer() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  
  fullscreenContainer.classList.remove('active');
  fullscreenViewer = null;
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
  if (!document.fullscreenElement && 
      !document.webkitFullscreenElement && 
      !document.mozFullScreenElement && 
      !document.msFullscreenElement) {
    fullscreenContainer.classList.remove('active');
    fullscreenViewer = null;
  }
}

fullscreenPrevBtn.addEventListener('click', () => {
  if (fullscreenViewer && fullscreenViewer.pageNum > 1) {
    fullscreenViewer.pageNum--;
    queueRenderFullscreenPage(fullscreenViewer.pageNum);
    updateFullscreenControls();
  }
});

fullscreenNextBtn.addEventListener('click', () => {
  if (fullscreenViewer && fullscreenViewer.pageNum < fullscreenViewer.pdfDoc.numPages) {
    fullscreenViewer.pageNum++;
    queueRenderFullscreenPage(fullscreenViewer.pageNum);
    updateFullscreenControls();
  }
});

fullscreenCanvas.addEventListener('click', () => {
  if (fullscreenViewer && fullscreenViewer.pageNum < fullscreenViewer.pdfDoc.numPages) {
    fullscreenViewer.pageNum++;
    queueRenderFullscreenPage(fullscreenViewer.pageNum);
    updateFullscreenControls();
  }
});

fullscreenCloseBtn.addEventListener('click', closeFullscreenViewer);

function createPdfSections(itemName) {
  const pdfs = itemPdfs[itemName];
  if (!pdfs) return;

  modalPdfContent.innerHTML = '';
  currentPdfViewers = [];

  pdfs.forEach((pdf, index) => {
    const uniqueId = `${itemName}-${index}-${Date.now()}`;
    
    const section = document.createElement('div');
    section.className = 'pdf-section';
    section.innerHTML = `
      <div class="pdf-title">${pdf.title}</div>
      <div class="pdf-viewer">
        <div class="pdf-canvas-container">
          <canvas id="pdf-canvas-${uniqueId}"></canvas>
        </div>
        <div class="pdf-controls">
          <button class="pdf-btn" id="prev-${uniqueId}">← Previous</button>
          <span class="pdf-info" id="page-info-${uniqueId}">Page 1 of 1</span>
          <button class="pdf-btn" id="next-${uniqueId}">Next →</button>
          <button class="fullscreen-btn" id="fullscreen-${uniqueId}">⛶</button>
        </div>
      </div>
    `;
    
    modalPdfContent.appendChild(section);

    setTimeout(() => {
      const viewer = new PDFViewer(
        pdf.url,
        `pdf-canvas-${uniqueId}`,
        `page-info-${uniqueId}`,
        `prev-${uniqueId}`,
        `next-${uniqueId}`,
        `fullscreen-${uniqueId}`,
        pdf.title
      );
      currentPdfViewers.push(viewer);
    }, 100);
  });
}

function initializeItems() {
  Object.keys(itemStates).forEach(itemName => {
    const isLocked = itemStates[itemName];
    const itemBox = document.querySelector(`.item-box[data-item="${itemName}"]`);
    const itemImage = document.querySelector(`.item-image[data-item="${itemName}"]`);
    const lockIcon = document.querySelector(`.lock-icon[data-item="${itemName}"]`);
    const unlockIcon = document.querySelector(`.unlock-icon[data-item="${itemName}"]`);
    const itemNameLabel = document.querySelector(`.item-name[data-item="${itemName}"]`);
    
    if (isLocked) {
      itemBox.classList.add('locked');
      itemImage.classList.add('locked');
      lockIcon.classList.add('show');
      unlockIcon.classList.remove('show');
      itemNameLabel.classList.remove('show');
    } else {
      itemBox.classList.remove('locked');
      itemImage.classList.remove('locked');
      lockIcon.classList.remove('show');
      unlockIcon.classList.add('show');
      itemNameLabel.classList.add('show');
    }
  });
}

function unlockItem(itemName) {
  if (itemStates.hasOwnProperty(itemName)) {
    itemStates[itemName] = false;
    const itemBox = document.querySelector(`.item-box[data-item="${itemName}"]`);
    const itemImage = document.querySelector(`.item-image[data-item="${itemName}"]`);
    const lockIcon = document.querySelector(`.lock-icon[data-item="${itemName}"]`);
    const unlockIcon = document.querySelector(`.unlock-icon[data-item="${itemName}"]`);
    const itemNameLabel = document.querySelector(`.item-name[data-item="${itemName}"]`);
    
    itemBox.classList.remove('locked');
    itemImage.classList.remove('locked');
    lockIcon.classList.remove('show');
    unlockIcon.classList.add('show');
    itemNameLabel.classList.add('show');
  }
}

function isLocked(itemName) {
  return itemStates[itemName] || false;
}

function openArticlesModal(itemName) {
  articlesModalOverlay.classList.add('active');
  articlesModalOverlay.classList.remove('closing');
  createPdfSections(itemName);
}

function closeArticlesModal() {
  articlesModalOverlay.classList.add('closing');
  setTimeout(() => {
    articlesModalOverlay.classList.remove('active', 'closing');
  }, 300);
}

initializeItems();

modalClose.addEventListener('click', closeArticlesModal);

articlesModalOverlay.addEventListener('click', (e) => {
  if (e.target === articlesModalOverlay) {
    closeArticlesModal();
  }
});

document.querySelectorAll('.item-image').forEach(img => {
  img.addEventListener('click', () => {
    const itemName = img.dataset.item;
    if (isLocked(itemName)) {
      const wrapper = img.closest('.item-wrapper');
      wrapper.classList.add('shake');
      setTimeout(() => wrapper.classList.remove('shake'), 300);
    } else {
      openArticlesModal(itemName);
    }
  });
});