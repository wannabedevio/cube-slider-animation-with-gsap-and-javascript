/**
 * demo.js
 *
 * Licensed under the MIT license.
 * https://opensource.org/license/mit/
 * 
 * Copyright 2024, WANNABEDEV
 * https://wannabedev.io
 */

console.clear();

const select = e => document.querySelector(e);
const selectAll = e => document.querySelectorAll(e);

const container = select('.container');
const hiElements = selectAll('.hi');
const hiWords = selectAll('.hi__word');
const baseLat = select('.hi__location--lat');
const baseLang = select('.hi__location--long');
const prevButton = select('.slider-prev');
const nextButton = select('.slider-next');
let winW = 0;
let winH = 0;
let pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};
let currentIndex = 0;
let isAnimating = false;

let rotationTimeline;

function init() {
  setWinDimensions();
  gsap.set(container, {
    autoAlpha: 1
  });

  const initialHi = hiElements[currentIndex];
  const initialCuboids = initialHi.querySelectorAll('.hi__cuboid');

  gsap.set(initialCuboids, {
    display: 'block',
    autoAlpha: 0
  });

  gsap.timeline({
      delay: 0.5
    })
    .from('.hi__location--lat', {
      x: 100,
      autoAlpha: 0,
      ease: 'power4',
      duration: 1
    })
    .from('.hi__location--long', {
      x: -100,
      autoAlpha: 0,
      ease: 'power4',
      duration: 1
    }, 0)
    .from(initialCuboids, {
      y: winH,
      duration: 3,
      stagger: 0.14,
      ease: 'elastic(0.4,0.3)'
    }, 0)
    .to(initialCuboids, {
      autoAlpha: 1,
      duration: 0,
      stagger: 0
    }, 0);

  startRotation();
}

function startRotation() {
  if (rotationTimeline) {
    rotationTimeline.kill(); // Kill existing timeline if it exists
  }

  rotationTimeline = gsap.timeline({
    repeat: -1
  });

  rotationTimeline.to('.hi__cuboid', {
    rotateX: '+=360',
    duration: 8,
    ease: 'none',
    yoyo: true,
    repeat: -1,
  });

  rotationTimeline.fromTo('.hi__cuboid', {
    rotateY: 8,
    rotate: -10
  }, {
    rotateY: -8,
    rotate: 10,
    duration: 2.2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut'
  }, 0);
}

function setWinDimensions() {
  winW = window.innerWidth;
  winH = window.innerHeight;
}

function calcOffset(xPos, yPos) {
  let dX = 2 * (xPos - winW / 2) / winW;
  let dY = -2 * (yPos - winH / 2) / winH;
  return [dX, dY];
}

function followPointer(pX, pY) {
  let nPos = calcOffset(pX, pY); // get cursor position from center
	let nY = nPos[1];
	let positiveY = Math.sqrt(nY*nY);
  let deltaW = 600*positiveY;

	gsap.to(hiWords, {
    fontWeight: 900-deltaW,
		duration: 0.75
	});
}

function shuffleText(element, newText) {
  const originalText = element.textContent;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shuffledText = '';
  let iterations = 0;
  const shuffleInterval = setInterval(() => {
    // Generate shuffled text with original characters in random order
    shuffledText = originalText.split('').sort(() => Math.random() - 0.5).join('');
    element.textContent = shuffledText;
    if (iterations > originalText.length * 2) {
      clearInterval(shuffleInterval);
      element.textContent = newText;
    }
    iterations++;
  }, 25);
}

function changeSlide(next = true) {
  if (isAnimating) return;
  isAnimating = true;

  const oldIndex = currentIndex;
  currentIndex = next ? (currentIndex + 1) % hiElements.length : (currentIndex - 1 + hiElements.length) % hiElements.length;

  const oldHi = hiElements[oldIndex];
  const newHi = hiElements[currentIndex];

  const oldCuboids = oldHi.querySelectorAll('.hi__cuboid');
  const newCuboids = newHi.querySelectorAll('.hi__cuboid');

  const newLat = newHi.getAttribute('data-lat');
  const newLang = newHi.getAttribute('data-lang');

  // Kill previous rotation animation to avoid resetting the state
  rotationTimeline.kill();

  gsap.set(oldCuboids, {
    display: 'none',
    autoAlpha: 0
  });

  gsap.set(newCuboids, {
    display: 'block',
    autoAlpha: 0
  });

  gsap.timeline().to(newCuboids, {
    autoAlpha: 1,
    duration: 0,
    stagger: 0,
  });

  gsap.timeline().to(newCuboids, {
    rotateX: '+=360 * 4',
    rotateY: 8,
    rotate: -10,
    duration: 1.75,
    ease: 'elastic(0.4,0.3)',
    stagger: 0,
    onComplete: () => {
      shuffleText(baseLat, newLat);
      shuffleText(baseLang, newLang);
      isAnimating = false;
      // Restart the rotation animation after slide change
      startRotation();
    }
  });
}

window.addEventListener("mousemove", function(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  followPointer(pointer.x, pointer.y);
});

window.addEventListener('touchmove', function(event) {
  pointer.x = event.touches[0].clientX;
  pointer.y = event.touches[0].clientY;
  followPointer(pointer.x, pointer.y);
});

window.addEventListener('touchstart', function(event) {
  pointer.x = event.touches[0].clientX;
  pointer.y = event.touches[0].clientY;
  followPointer(pointer.x, pointer.y);
});

prevButton.addEventListener('click', () => changeSlide(false));
nextButton.addEventListener('click', () => changeSlide(true));

window.onload = () => {
  init();
};

window.onresize = setWinDimensions;
