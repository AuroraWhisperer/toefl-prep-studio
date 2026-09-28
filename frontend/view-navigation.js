(() => {
  'use strict';

  const views = [...document.querySelectorAll('.app-shell > section')];
  const paths = { 'landing-view': '/', 'history-view': '/history', 'test-setup': '/tests' };
  const routes = [];
  const checks = [];
  const shell = document.querySelector('.app-shell');
  let current = { path: location.pathname, index: history.state?.toeflIndex ?? 0 };
  let browserIndex = current.index;
  let navigationId = 0;
  let started = false;
  let restoring = false;
  let restoredPath;
  let undoPop;
  let chain = Promise.resolve();
  let focusTarget;

  function focus(node) {
    if (shell.inert) focusTarget = node;
    else node?.focus({ preventScroll: true });
  }

  function setPath(path, { replace = false } = {}) {
    if (restoring) {
      restoredPath = path;
      return;
    }
    if (!started || current.path === path) return;
    current = { path, index: current.index + (replace ? 0 : 1) };
    history[replace ? 'replaceState' : 'pushState']({ toeflIndex: current.index }, '', path);
    browserIndex = current.index;
  }

  async function open(path) {
    const route = routes.find(({ pattern }) => pattern.test(path));
    if (!route) throw new Error('这个页面不存在，请从首页重新进入。');
    await route.open(path.match(route.pattern));
  }

  async function transition(target, { pop = false, initial = false, id = navigationId } = {}) {
    if (id !== navigationId) return;
    shell.inert = true;
    try {
      if (!initial) {
        for (const check of checks) {
          const allowed = await check(target.path);
          if (id !== navigationId) return;
          if (allowed !== false) continue;
          // Restore the actual previous history entry, preserving Forward and retry.
          if (pop && browserIndex !== current.index) {
            await new Promise((resolve) => {
              undoPop = resolve;
              history.go(current.index - browserIndex);
            });
          }
          return;
        }
      }
      restoring = true;
      restoredPath = target.path;
      try {
        await open(target.path);
      } catch (error) {
        await open('/');
        window.dispatchEvent(new CustomEvent('navigation-error', { detail: error.message }));
      } finally {
        restoring = false;
      }
      if (id !== navigationId) return;
      current = { path: restoredPath, index: target.index };
      history[pop || initial ? 'replaceState' : 'pushState'](
        { toeflIndex: current.index },
        '',
        current.path,
      );
      browserIndex = current.index;
    } finally {
      shell.inert = false;
      if (id === navigationId) focusTarget?.focus({ preventScroll: true });
      focusTarget = null;
    }
  }

  function enqueue(action) {
    chain = chain.then(action);
    return chain;
  }

  window.addEventListener('popstate', (event) => {
    browserIndex = event.state?.toeflIndex ?? 0;
    if (undoPop) {
      const done = undoPop;
      undoPop = null;
      done();
      return;
    }
    const target = { path: location.pathname, index: browserIndex };
    const id = ++navigationId;
    enqueue(() => transition(target, { pop: true, id }));
  });

  // Feature owners restore content and save/stop their own resources before navigation.
  window.appViews = {
    show(view, { leave, enter, path = paths[view.id], replace = false } = {}) {
      leave?.();
      views.forEach((section) => {
        section.hidden = section !== view;
      });
      if (path) setPath(path, { replace });
      enter?.();
      window.dispatchEvent(new CustomEvent('view-shown', { detail: { view, path } }));
    },
    setPath,
    focus,
    register(pattern, open) {
      routes.push({ pattern, open });
    },
    beforeNavigate(check) {
      checks.push(check);
    },
    navigate(path) {
      const id = ++navigationId;
      return enqueue(() =>
        current.path === path ? undefined : transition({ path, index: current.index + 1 }, { id }),
      );
    },
    start() {
      started = true;
      return enqueue(() => transition(current, { initial: true }));
    },
  };
})();
