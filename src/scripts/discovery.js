// Why Leon is a genuine tab set: click/touch, arrow keys, Home/End, and
// visible focus all reach the same selected detail. The finder is handled by home.js.
const reasonTabs = document.querySelector('#why .rec-grid[role="tablist"]');

if (reasonTabs) {
  const tabs = [...reasonTabs.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function selectReason(index, moveFocus = false) {
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (panels[tabIndex]) panels[tabIndex].hidden = !selected;
    });

    if (moveFocus) tabs[index].focus();
    const panel = panels[index];
    if (panel && !reducedMotion && panel.animate) {
      panel.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectReason(index));
    tab.addEventListener('keydown', event => {
      const key = event.key;
      let next;
      if (key === 'ArrowRight' || key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (key === 'ArrowLeft' || key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (key === 'Home') next = 0;
      else if (key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectReason(next, true);
    });
  });
}
