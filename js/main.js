document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Video Sound Toggle
    const video = document.getElementById('hero-video');
    // Sound Toggle Logic (New Rectangular)
    const soundToggleRect = document.getElementById('sound-toggle-rect');
    const btnOn = document.getElementById('btn-sound-on');
    const btnOff = document.getElementById('btn-sound-off');

    // We already have 'video' const from line 14

    if (soundToggleRect && video) {
        soundToggleRect.addEventListener('click', () => {
            if (video.muted) {
                // Unmute (BGM ON)
                video.muted = false;
                video.play().catch(e => console.log('Playback failed:', e));
                btnOn.classList.add('active');
                btnOff.classList.remove('active');
            } else {
                // Mute
                video.muted = true;
                btnOn.classList.remove('active');
                btnOff.classList.add('active');
            }
        });

        // Init - default muted is true in HTML
        video.muted = true;
        btnOn.classList.remove('active');
        btnOff.classList.add('active');
    }

    // Mobile Menu Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Intersection Observer for Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.1
    });

    const animateElements = document.querySelectorAll('.animate-up, .animate-fade, .animate-scale, .slide-in-left, .slide-in-right');
    animateElements.forEach(el => observer.observe(el));

    // Scroll Scrubbing Logic for Catch Copy
    const catchContainer = document.querySelector('.catch-copy-scroll-container');
    const slide1 = document.querySelector('.catch-slide.slide-1');
    const slidePhotos = document.querySelector('.catch-slide.slide-photos');
    const slide2 = document.querySelector('.catch-slide.slide-2');

    // Generate Photos dynamically
    const photoCount = 15; // Decreased from 50
    const photoImages = ['img/on-sample01.jpg', 'img/on-sample02.jpg', 'img/on-sample03.jpg'];
    let photos = [];

    if (slidePhotos) {
        // Clear existing just in case (though normally empty)
        slidePhotos.innerHTML = '';

        for (let i = 0; i < photoCount; i++) {
            const div = document.createElement('div');
            div.classList.add('photo-piece');
            const img = document.createElement('img');
            img.src = photoImages[i % photoImages.length];
            div.appendChild(img);
            slidePhotos.appendChild(div);

            // Randomize Start Properties
            const angle = Math.random() * 360;
            const distance = 100 + Math.random() * 50; // 100vw-150vw away
            const startX = Math.cos(angle * Math.PI / 180) * distance;
            const startY = Math.sin(angle * Math.PI / 180) * distance;
            const rotate = (Math.random() - 0.5) * 60; // -30 to 30 deg

            // Randomize Size and Target Position
            const sizeScale = 0.5 + Math.random() * 1.0;
            const targetX = (Math.random() - 0.5) * 10; // Tight cluster
            const targetY = (Math.random() - 0.5) * 10;

            div.dataset.startX = startX;
            div.dataset.startY = startY;
            div.dataset.targetX = targetX;
            div.dataset.targetY = targetY;
            div.dataset.rotate = rotate;
            div.dataset.sizeScale = sizeScale;

            photos.push(div);
        }
    }

    if (catchContainer && slide1 && slide2 && slidePhotos) {
        window.addEventListener('scroll', () => {
            const rect = catchContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const containerHeight = rect.height;

            let progress = 0;
            if (rect.top <= 0) {
                const scrolled = Math.abs(rect.top);
                const totalScrollable = containerHeight - viewportHeight;
                if (totalScrollable > 0) {
                    progress = scrolled / totalScrollable;
                }
            }
            progress = Math.max(0, Math.min(1, progress));

            // Phases:
            // 0.0 - 0.2: Slide 1 HOLD (Visible for ~2 scrolls)
            // 0.2 - 0.3: Slide 1 Fades Out
            // 0.25 - 0.75: Photos Gather SEQUENTIALLY
            // 0.75 - 0.8: Explosion
            // 0.8 - 0.85: Text 2 Fades In
            // 0.85 - 1.0: HOLD (Text 2 Visible)

            // --- Phase 1: Text 1 HOLD & FADE (0 -> 0.3) ---
            if (progress < 0.2) {
                // Hold Phase
                slide1.style.opacity = 1;
                slide1.style.transform = `scale(1)`;
            } else if (progress < 0.3) {
                // Fade Out Phase (0.2 -> 0.3)
                const p1 = (progress - 0.2) / 0.1;
                slide1.style.opacity = 1 - p1;
                slide1.style.transform = `scale(${1 - (p1 * 0.2)})`;
            } else {
                slide1.style.opacity = 0;
            }

            // --- Phase 2: Photos Gather Sequentially (0.25 -> 0.75) ---
            const gatherStart = 0.25;
            const gatherEnd = 0.75;
            const gatherRange = gatherEnd - gatherStart;

            if (progress >= 0.2 && progress < 0.85) {
                slidePhotos.style.opacity = 1;

                const step = gatherRange / photoCount;

                photos.forEach((photo, i) => {
                    const myStart = gatherStart + (i * step);

                    let photoProgress = (progress - myStart) / (step * 2);
                    photoProgress = Math.max(0, Math.min(1, photoProgress));

                    const p = photoProgress;
                    const invP = 1 - p;

                    const startX = parseFloat(photo.dataset.startX);
                    const startY = parseFloat(photo.dataset.startY);
                    const targetX = parseFloat(photo.dataset.targetX);
                    const targetY = parseFloat(photo.dataset.targetY);
                    const rotate = parseFloat(photo.dataset.rotate);
                    const sizeScale = parseFloat(photo.dataset.sizeScale);

                    const currentX = startX * invP + targetX * p;
                    const currentY = startY * invP + targetY * p;

                    const zoomFactor = 1 + (invP * 2);
                    const finalScale = sizeScale * zoomFactor;

                    photo.style.transform = `translate(${currentX}vw, ${currentY}vh) rotate(${rotate}deg) scale(${finalScale})`;
                    photo.style.opacity = p;
                });
            }

            // --- Phase 3: Explosion (0.75 -> 0.8) ---
            if (progress >= 0.75 && progress < 0.9) {
                const explP = (progress - 0.75) / 0.05; // Fast explosion

                if (explP < 1.0) {
                    photos.forEach((photo) => {
                        const startX = parseFloat(photo.dataset.startX);
                        const startY = parseFloat(photo.dataset.startY);
                        const rotate = parseFloat(photo.dataset.rotate) + (explP * 360);

                        const endX = startX * 1.5;
                        const endY = startY * 1.5;

                        photo.style.transform = `translate(${endX * explP}vw, ${endY * explP}vh) rotate(${rotate}deg) scale(${1 + explP})`;
                        photo.style.opacity = 1 - (explP * 2); // Fade out
                    });
                } else {
                    slidePhotos.style.opacity = 0;
                }
            } else if (progress >= 0.9) {
                slidePhotos.style.opacity = 0;
            }

            // --- Phase 4: Text 2 Enters and HOLDS (0.8 -> 1.0) ---
            if (progress > 0.8) {
                // Fade in quickly: 0.8 -> 0.85
                let p4 = (progress - 0.8) / 0.05;
                p4 = Math.min(1, p4); // Clamp at 1 (Held state)

                slide2.style.opacity = p4;
                slide2.style.transform = `scale(${1.2 - (p4 * 0.2)})`;
            } else {
                slide2.style.opacity = 0;
            }
        });
    }
});
