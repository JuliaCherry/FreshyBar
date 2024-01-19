export const scrollService = {
  scrollPosition: 0,
  disabledScroll() {
    this.scrollPosition = window.scrollY;
    document.style.scrollBehavior = 'auto';

    document.body.style.cssText = `
      overflow: hidden;
      position: fixed;
      top: -${this.scrollPosition}px;
      left: 0;
      height: 100vh;
      width: 100vw;
      padding-right: ${window.innerWidth - document.body.offsetWidth}px;
      `;
  },
  enabledScroll() {
    document.body.style.cssText = '';
    window.scroll({ top: this.scrollPosition });
    document.documentElement.style.scrollBehavior = '';
  },
};
