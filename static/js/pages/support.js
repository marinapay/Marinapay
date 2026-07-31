const filters = [...document.querySelectorAll('[data-js="faq-filter"]')];
const items = [...document.querySelectorAll('[data-js="faq-item"]')];
const emptyMessage = document.querySelector('[data-js="faq-empty"]');

if (filters.length && items.length) {
  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.category || 'all';
      let visibleCount = 0;

      filters.forEach((button) => {
        button.setAttribute('aria-pressed', String(button === filter));
      });

      items.forEach((item) => {
        const matches = category === 'all' || item.dataset.category === category;
        item.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      if (emptyMessage) {
        emptyMessage.hidden = visibleCount > 0;
      }
    });
  });
}
