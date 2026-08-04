import { CONFIG } from './config.js';

function getKakaoLink() {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
  return isMobile ? CONFIG.contact.kakaoLinkMobile : CONFIG.contact.kakaoLinkPc;
}

const SELECTORS = {
  menuToggle: '[data-js="menu-toggle"]',
  menu: '[data-js="site-nav"]',
  faqButton: '[data-js="faq-button"]',
  reveal: '[data-js="reveal"]',
  servicePager: '[data-service-pager]',
  serviceCopy: '[data-service-copy]',
  year: '[data-js="year"]'
};

function setupMobileMenu() {
  const toggle = document.querySelector(SELECTORS.menuToggle);
  const menu = document.querySelector(SELECTORS.menu);

  if (!toggle || !menu) return;

  const dim = document.createElement('button');
  dim.className = 'c-menu-dim';
  dim.type = 'button';
  dim.setAttribute('aria-label', '메뉴 닫기');
  document.body.append(dim);

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    menu.classList.remove('is-open');
    dim.classList.remove('is-open');
    document.body.classList.remove('is-menu-open');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
    menu.classList.toggle('is-open', !isOpen);
    dim.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('is-menu-open', !isOpen);
  });

  dim.addEventListener('click', () => {
    closeMenu();
    toggle.focus();
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  });
}

function setupFaqAccordions() {
  document.querySelectorAll(SELECTORS.faqButton).forEach((button) => {
    const panelId = button.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;

    if (!panel) return;

    const isInitiallyExpanded = button.getAttribute('aria-expanded') === 'true';
    panel.hidden = false;
    panel.classList.toggle('is-open', isInitiallyExpanded);
    panel.setAttribute('aria-hidden', String(!isInitiallyExpanded));

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isExpanded));
      panel.classList.toggle('is-open', !isExpanded);
      panel.setAttribute('aria-hidden', String(isExpanded));
    });
  });
}

function setupReveal() {
  const elements = [...document.querySelectorAll(SELECTORS.reveal)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!elements.length) return;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  elements.forEach((element) => observer.observe(element));
}

function setupTitleLetterAnimations() {
  const titles = [...document.querySelectorAll(
    'main section h2:not(.u-visually-hidden)'
  )];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rotateSet = ['2.5deg', '-2deg', '1.6deg', '-1.4deg', '2deg'];

  if (!titles.length) return;

  titles.forEach((title) => {
    if (title.dataset.letterAnimated === 'true') return;

    let charIndex = 0;

    const splitTextNode = (node) => {
      const fragment = document.createDocumentFragment();

      Array.from(node.nodeValue).forEach((char) => {
        const span = document.createElement('span');
        span.className = 'c-letter-title__char';
        span.textContent = char;
        span.style.setProperty('--char-index', charIndex);
        span.style.setProperty('--char-rotate', rotateSet[charIndex % rotateSet.length]);
        fragment.append(span);
        charIndex += 1;
      });

      node.parentNode.replaceChild(fragment, node);
    };

    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.nodeValue.trim() || child.nodeValue.includes(' ')) splitTextNode(child);
          return;
        }

        if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SCRIPT') walk(child);
      });
    };

    title.dataset.letterAnimated = 'true';
    walk(title);
    title.classList.add('c-letter-title', 'is-letter-animated');
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    titles.forEach((title) => title.classList.add('is-letter-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-letter-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold:0.14, rootMargin:'0px 0px -4% 0px' });

  titles.forEach((title) => observer.observe(title));
}

function setupServiceCopySlider() {
  const pager = document.querySelector(SELECTORS.servicePager);
  const copy = document.querySelector(SELECTORS.serviceCopy);

  if (!pager || !copy) return;

  const eyebrow = copy.querySelector('[data-service-eyebrow]');
  const heading = copy.querySelector('h2');
  const description = copy.querySelector('[data-service-description]');
  const buttons = [...pager.querySelectorAll('[data-service-slide]')];
  const section = copy.closest('.p-home__services');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slides = [
    {
      eyebrow:'Payment services',
      title:'내 사업 환경에 맞춰<br><strong>결제 방식도 달라져야 합니다.</strong>',
      description:'사업주님의 환경에 맞는 결제시스템을 구축해 드립니다.'
    },
    {
      eyebrow:'Store payment',
      title:'단말기 하나만 바꿔도<br><strong>매장 운영이 수월해지도록.</strong>',
      description:'업종과 매장 환경에 맞는 단말기 형태와 설치 과정을 차근차근 안내합니다.'
    },
    {
      eyebrow:'Online & remote',
      title:'화면 너머의 고객에게도<br><strong>내 상품이 닿을 수 있도록.</strong>',
      description:'온라인 주문과 비대면 상황에 필요한 연결 방식과 확인 절차를 함께 정리합니다.'
    }
  ];
  let activeIndex = 0;
  let timerId;

  const render = (index) => {
    if (index === activeIndex && copy.classList.contains('has-slid')) return;

    activeIndex = index;
    copy.classList.remove('is-switching');
    void copy.offsetWidth;

    eyebrow.textContent = slides[index].eyebrow;
    heading.innerHTML = slides[index].title;
    description.textContent = slides[index].description;
    copy.classList.add('is-switching', 'has-slid');

    buttons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const stop = () => {
    window.clearInterval(timerId);
  };

  const start = () => {
    stop();
    if (reducedMotion || document.hidden) return;
    timerId = window.setInterval(() => {
      render((activeIndex + 1) % slides.length);
    }, 4800);
  };

  pager.addEventListener('click', (event) => {
    const button = event.target.closest('[data-service-slide]');
    if (!button) return;
    render(Number(button.dataset.serviceSlide));
    start();
  });

  section?.addEventListener('mouseenter', stop);
  section?.addEventListener('mouseleave', start);
  section?.addEventListener('focusin', stop);
  section?.addEventListener('focusout', (event) => {
    if (!section.contains(event.relatedTarget)) start();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}

function setupBlueFlowCursorBubbles() {
  const section = document.querySelector('.p-home__blue-flow');
  const layer = section?.querySelector('[data-js="blue-cursor-bubbles"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!section || !layer || reducedMotion || section.dataset.blueBubblesReady === 'true') return;

  let bubbleIndex = 0;
  let lastMoveAt = 0;
  let idleTimeoutId;
  let idleIntervalId;
  let pointerX = 0;
  let pointerY = 0;

  const clearIdleBubbles = () => {
    window.clearTimeout(idleTimeoutId);
    window.clearInterval(idleIntervalId);
  };

  const createBubble = (clientX, clientY, isIdle = false) => {
    const rect = section.getBoundingClientRect();
    const bubble = document.createElement('span');
    const size = (isIdle ? 8 : 7) + ((bubbleIndex * 5) % (isIdle ? 8 : 10));
    const drift = ((bubbleIndex % 5) - 2) * (isIdle ? 3 : 4);

    bubble.style.setProperty('--cursor-x', `${clientX - rect.left}px`);
    bubble.style.setProperty('--cursor-y', `${clientY - rect.top}px`);
    bubble.style.setProperty('--cursor-size', `${size}px`);
    bubble.style.setProperty('--cursor-drift', `${drift}px`);
    layer.append(bubble);
    bubbleIndex += 1;

    window.setTimeout(() => bubble.remove(), 820);
  };

  const queueIdleBubbles = () => {
    clearIdleBubbles();
    idleTimeoutId = window.setTimeout(() => {
      createBubble(pointerX, pointerY, true);
      idleIntervalId = window.setInterval(() => {
        createBubble(pointerX, pointerY, true);
      }, 260);
    }, 190);
  };

  section.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;

    pointerX = event.clientX;
    pointerY = event.clientY;

    const now = performance.now();
    if (now - lastMoveAt >= 24) {
      createBubble(pointerX, pointerY);
      lastMoveAt = now;
    }

    queueIdleBubbles();
  }, { passive:true });

  section.addEventListener('pointerleave', clearIdleBubbles);
  section.dataset.blueBubblesReady = 'true';
}

function setupFloatingActions() {
  const actions = document.createElement('aside');
  const contactHref = getKakaoLink();

  actions.className = 'c-floating-actions';
  actions.setAttribute('aria-label', '빠른 메뉴');
  actions.innerHTML = `
    <div class="c-floating-scroll">
      <button class="c-floating-scroll__button" type="button" aria-label="맨 아래로 이동" data-js="scroll-toggle">
        <img src="/static/images/common/arrow-right.svg" alt="">
      </button>
    </div>
    <a class="c-floating-action c-floating-action--support" href="${contactHref}" target="_blank" rel="noopener noreferrer" aria-label="카톡상담 문의">
      <img src="/static/images/common/kakaotalk.png" alt="">
    </a>
  `;
  document.body.append(actions);

  const scrollButton = actions.querySelector('[data-js="scroll-toggle"]');
  const updateScrollButton = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const isAtTop = scrollTop <= 2;

    scrollButton.classList.toggle('is-scroll-down', isAtTop);
    scrollButton.setAttribute('aria-label', isAtTop ? '맨 아래로 이동' : '맨 위로 이동');
    scrollButton.disabled = maxScroll <= 2;
  };

  scrollButton.addEventListener('click', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const isAtTop = scrollTop <= 2;

    window.scrollTo({
      top:isAtTop ? document.documentElement.scrollHeight : 0,
      behavior:reducedMotion ? 'auto' : 'smooth'
    });
  });

  window.addEventListener('scroll', updateScrollButton, { passive:true });
  window.addEventListener('resize', updateScrollButton, { passive:true });
  updateScrollButton();
}

function setupProductFilter() {
  const toggle = document.querySelector('[data-js="product-filter-toggle"]');
  const label = document.querySelector('[data-js="product-filter-label"]');
  const grid = document.querySelector('[data-js="product-grid"]');

  if (!toggle || !label || !grid) return;

  toggle.addEventListener('click', () => {
    const isSaleOnly = !toggle.classList.contains('is-sale-only');
    const unavailableCards = grid.querySelectorAll('.p-home__product-card--soon');

    toggle.classList.toggle('is-sale-only', isSaleOnly);
    toggle.setAttribute('aria-pressed', String(!isSaleOnly));
    label.textContent = isSaleOnly ? '판매 상품만 표시됨' : '전체 상품 표시됨';
    grid.classList.toggle('is-sale-only', isSaleOnly);
    unavailableCards.forEach((card) => {
      if (isSaleOnly) card.setAttribute('aria-disabled', 'true');
      else card.removeAttribute('aria-disabled');
    });
  });
}

function setCurrentYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll(SELECTORS.year).forEach((element) => {
    element.textContent = year;
  });
}

function applyContactConfig() {
  const phoneDigits = CONFIG.contact.phone.replace(/-/g, '');

  document.querySelectorAll('a[href^="tel:"]').forEach((element) => {
    element.href = `tel:${phoneDigits}`;
    if (/\d{2,3}-?\d{3,4}-?\d{4}/.test(element.textContent)) {
      element.textContent = CONFIG.contact.phone;
    }
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach((element) => {
    element.href = `mailto:${CONFIG.contact.email}`;
    if (element.textContent.includes('@')) {
      element.textContent = CONFIG.contact.email;
    }
  });

  document.querySelectorAll('a[href*="open.kakao.com"]').forEach((element) => {
    element.href = getKakaoLink();
  });
}

setupMobileMenu();
setupFaqAccordions();
setupReveal();
setupTitleLetterAnimations();
setupServiceCopySlider();
setupBlueFlowCursorBubbles();
setupFloatingActions();
setupProductFilter();
setCurrentYear();
applyContactConfig();

function setupAppModal() {
  const modal = document.querySelector('[data-js="app-modal"]');
  const triggers = [...document.querySelectorAll('[data-js="app-download"]')];

  if (!modal || !triggers.length) return;

  const closers = [...modal.querySelectorAll('[data-js="app-modal-close"]')];
  const confirmButton = modal.querySelector('.c-modal__confirm');
  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-modal');
    confirmButton?.focus();
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-modal');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  triggers.forEach((trigger) => trigger.addEventListener('click', open));
  closers.forEach((closer) => closer.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}

setupAppModal();
