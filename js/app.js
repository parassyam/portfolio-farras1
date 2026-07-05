document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Typing Effect for Header ---
  const typedTextSpan = document.getElementById('typed-text');
  const textArray = [
    'an IT QA Engineer. ',
    'a QA Automation Engineer. ',
    'a Digital Banking Tester. ',
    'a System Architecture Enthusiast. '
  ];
  const typingSpeed = 100;
  const erasingSpeed = 50;
  const newTextDelay = 2000; // Delay between word cycles
  let textArrayIndex = 0;
  let charIndex = 0;

  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      if (!typedTextSpan.classList.contains('typing')) {
        typedTextSpan.classList.add('typing');
      }
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingSpeed);
    } else {
      typedTextSpan.classList.remove('typing');
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (charIndex > 0) {
      if (!typedTextSpan.classList.contains('typing')) {
        typedTextSpan.classList.add('typing');
      }
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingSpeed);
    } else {
      typedTextSpan.classList.remove('typing');
      textArrayIndex++;
      if (textArrayIndex >= textArray.length) textArrayIndex = 0;
      setTimeout(type, typingSpeed + 1100);
    }
  }

  // Start typing effect on load
  if (typedTextSpan) {
    setTimeout(type, newTextDelay);
  }

  // --- 2. Scroll Reveal Animation using IntersectionObserver ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- 3. Active Nav Menu Link Highlight on Scroll ---
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('#nav li a');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.parentElement.classList.remove('current');
          if (link.getAttribute('href') === `#${id}`) {
            link.parentElement.classList.add('current');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-20% 0px -50% 0px'
  });

  sections.forEach(sec => {
    navObserver.observe(sec);
  });

  // --- 4. Dialog Modal Handler ---
  const modalButtons = document.querySelectorAll('.project-btn');
  const dialogs = document.querySelectorAll('dialog.popup-modal');

  modalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const dialog = document.getElementById(modalId);
      if (dialog) {
        dialog.showModal();
        document.body.style.overflowY = 'hidden'; // Disable page scrolling
      }
    });
  });

  dialogs.forEach(dialog => {
    // Close modal when close button is clicked
    const closeBtn = dialog.querySelector('.popup-modal-dismiss');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dialog.close();
      });
    }

    // Close modal when backdrop (outside area) is clicked
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        dialog.close();
      }
    });

    // Reset page scrolling when modal is closed
    dialog.addEventListener('close', () => {
      document.body.style.overflowY = 'auto';
    });
  });

  // --- 5. Back to Top Button ---
  const goTopButton = document.getElementById('go-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      goTopButton.classList.add('show');
    } else {
      goTopButton.classList.remove('show');
    }
  });

  // --- 6. Contact Form Submission (Fetch API) ---
  const contactForm = document.getElementById('contactForm');
  const loader = document.getElementById('image-loader');
  const warnMessage = document.getElementById('message-warning');
  const succMessage = document.getElementById('message-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show loader, clear warnings
      loader.style.display = 'inline-block';
      warnMessage.style.display = 'none';
      succMessage.style.display = 'none';

      const contactName = document.getElementById('contactName').value.trim();
      const contactEmail = document.getElementById('contactEmail').value.trim();
      const contactSubject = document.getElementById('contactSubject').value.trim();
      const contactMessage = document.getElementById('contactMessage').value.trim();

      // Local Validation
      if (contactName.length < 2) {
        showError('Name must be at least 2 characters.');
        return;
      }
      if (!validateEmail(contactEmail)) {
        showError('Please enter a valid email address.');
        return;
      }
      if (contactMessage.length < 15) {
        showError('Message must be at least 15 characters.');
        return;
      }

      // Prepare request body
      const formData = new URLSearchParams();
      formData.append('contactName', contactName);
      formData.append('contactEmail', contactEmail);
      formData.append('contactSubject', contactSubject);
      formData.append('contactMessage', contactMessage);

      // Perform Fetch Request to sendEmail.php
      fetch('inc/sendEmail.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        loader.style.display = 'none';
        if (data.trim() === 'OK') {
          contactForm.style.display = 'none';
          succMessage.style.display = 'block';
        } else {
          showError(data || 'Failed to send message. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showError('There was a connection error. Please try again later.');
      });
    });
  }

  function showError(msg) {
    loader.style.display = 'none';
    warnMessage.textContent = msg;
    warnMessage.style.display = 'block';
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
