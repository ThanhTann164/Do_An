// Initialize external scripts after React renders

export const initializeScripts = () => {
  // Initialize AOS (Animate On Scroll)
  if (window.AOS) {
    window.AOS.init({
      duration: 800,
      easing: 'slide',
      once: true
    });
  }

  // Initialize Tiny Slider
  if (window.tns) {
    // Check if property slider exists
    const propertySlider = document.querySelector('.property-slider');
    if (propertySlider && !propertySlider.classList.contains('tns-slider')) {
      try {
        window.tns({
          container: '.property-slider',
          items: 1,
          slideBy: 1,
          autoplay: false,
          nav: false,
          controls: true,
          controlsContainer: '#property-nav',
          responsive: {
            640: { items: 2 },
            900: { items: 3 }
          }
        });
      } catch (e) {
        console.log('Property slider not found or already initialized');
      }
    }

    // Check if testimonial slider exists
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider && !testimonialSlider.classList.contains('tns-slider')) {
      try {
        window.tns({
          container: '.testimonial-slider',
          items: 1,
          slideBy: 1,
          autoplay: false,
          nav: false,
          controls: true,
          controlsContainer: '#testimonial-nav'
        });
      } catch (e) {
        console.log('Testimonial slider not found or already initialized');
      }
    }

    // Hero slider
    const heroSlide = document.querySelector('.hero-slide');
    if (heroSlide && !heroSlide.classList.contains('tns-slider')) {
      try {
        window.tns({
          mode: 'carousel',
          container: '.hero-slide',
          items: 1,
          slideBy: 'page',
          autoplay: true,
          autoplayTimeout: 5000,
          autoplayButtonOutput: false,
          mouseDrag: true,
          gutter: 0,
          nav: false,
          controls: false,
          speed: 700
        });
      } catch (e) {
        console.log('Hero slider not found or already initialized');
      }
    }
  }

  // Initialize counter animation
  if (document.querySelectorAll('.countup').length > 0) {
    const counters = document.querySelectorAll('.countup');
    counters.forEach(counter => {
      const target = parseInt(counter.textContent);
      let current = 0;
      const increment = target / 100;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, 20);
    });
  }
};

// Load external scripts
export const loadExternalScripts = () => {
  const scripts = [
    // Load from CDN to replace removed legacy assets
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/tiny-slider@2.9.4/dist/min/tiny-slider.js',
    'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js'
  ];

  let loadedCount = 0;

  scripts.forEach(src => {
    // Check if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      loadedCount++;
      if (loadedCount === scripts.length) {
        setTimeout(initializeScripts, 100);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => {
      loadedCount++;
      if (loadedCount === scripts.length) {
        setTimeout(initializeScripts, 100);
      }
    };
    script.onerror = () => {
      console.warn(`Failed to load script: ${src}`);
      loadedCount++;
      if (loadedCount === scripts.length) {
        setTimeout(initializeScripts, 100);
      }
    };
    document.body.appendChild(script);
  });
};

