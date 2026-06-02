/* ================================================================
   SCRIPT.JS — Rishi Adepu Portfolio
   ================================================================
   FEATURES:
     1. Dynamic year in footer
     2. Sticky navbar (background appears on scroll)
     3. Mobile hamburger menu (open / close)
     4. Smooth scroll with navbar offset
     5. Active nav link highlight (based on scroll position)
     6. Scroll-reveal animations (IntersectionObserver)
     7. Typewriter effect in the hero section
     8. Contact form validation + Web3Forms email integration
     9. Subtle parallax on hero background grid
   ================================================================ */


document.addEventListener('DOMContentLoaded', () => {


  /* ==============================================================
     1. DYNAMIC YEAR
  ============================================================== */
  const currentYear = document.getElementById('currentYear');
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  /* ==============================================================
     2. STICKY NAVBAR
  ============================================================== */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });


  /* ==============================================================
     3. MOBILE HAMBURGER MENU
  ============================================================== */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ==============================================================
     4. SMOOTH SCROLL WITH NAVBAR OFFSET
  ============================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const target   = document.querySelector(targetId);

      if (target) {
        e.preventDefault();

        const navbarHeight = navbar.offsetHeight;
        const targetTop    = target.getBoundingClientRect().top
                             + window.scrollY
                             - navbarHeight
                             - 20;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });


  /* ==============================================================
     5. ACTIVE NAV LINK HIGHLIGHT
  ============================================================== */
  const sections    = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let current = '';

    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });

    allNavLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--accent)';
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();


  /* ==============================================================
     6. SCROLL REVEAL ANIMATIONS
  ============================================================== */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold:  0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealEls.forEach(el => revealObserver.observe(el));


  /* ==============================================================
     7. TYPEWRITER EFFECT
  ============================================================== */
  const heroRoleEl = document.getElementById('heroRole');

  const titles = [
    'BTech CSE Student',
    'AI & Web Developer',
    'Building Impactful Solutions',
    'Problem Solver & Creator'
  ];

  let titleIdx   = 0;
  let charIdx    = 0;
  let isDeleting = false;

  function typeWriter() {
    const currentTitle = titles[titleIdx];

    if (isDeleting) {
      heroRoleEl.textContent = currentTitle.substring(0, charIdx - 1);
      charIdx--;
    } else {
      heroRoleEl.textContent = currentTitle.substring(0, charIdx + 1);
      charIdx++;
    }

    let speed = isDeleting ? 45 : 90;

    if (!isDeleting && charIdx === currentTitle.length) {
      speed = 2200;
      isDeleting = true;

    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      titleIdx   = (titleIdx + 1) % titles.length;
      speed = 300;
    }

    setTimeout(typeWriter, speed);
  }

  setTimeout(typeWriter, 1800);


  /* ==============================================================
     8. CONTACT FORM — Web3Forms API Submission
  ============================================================== */
  const contactForm = document.getElementById('contactForm');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showFormError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormError('Please enter a valid email address.');
      return;
    }

    const accessKey = '18c8b651-bf8c-42b4-b0ef-6813e032d6e7';

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    const formData = new FormData();
    formData.append('access_key', accessKey);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(async (response) => {
      let json = await response.json();
      if (response.status === 200) {
        showToast('Message sent successfully!');
        contactForm.reset();
      } else {
        showFormError(json.message || 'Something went wrong. Please try again.');
      }
    })
    .catch(error => {
      showFormError('Network error. Please try again.');
    })
    .then(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
  });

  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';

    if (isError) {
      toast.classList.add('toast-error');
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  function showFormError(msg) {
    showToast(msg, true);
  }


  /* ==============================================================
     9. SUBTLE PARALLAX ON HERO BACKGROUND
  ============================================================== */
  const heroBgGrid = document.querySelector('.hero-bg-grid');

  if (window.innerWidth > 768 && heroBgGrid) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroBgGrid.style.transform = `translateY(${scrollY * 0.2}px)`;
    }, { passive: true });
  }


}); // End of DOMContentLoaded