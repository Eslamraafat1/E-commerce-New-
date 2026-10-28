/** Reference-counted body scroll lock that also pauses Lenis smooth scrolling. */
let count = 0;
let prev = "";

declare global {
  interface Window { __lenis?: { stop: () => void; start: () => void } }
}

export function lockScroll() {
  if (count++ === 0) {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    prev = document.body.style.paddingInlineEnd;
    document.body.style.overflow = "hidden";
    if (sbw > 0) document.body.style.paddingInlineEnd = `${sbw}px`;
    window.__lenis?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--count === 0) {
      document.body.style.overflow = "";
      document.body.style.paddingInlineEnd = prev;
      window.__lenis?.start();
    }
  };
}
