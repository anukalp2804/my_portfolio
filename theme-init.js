/* Applies the saved theme (or the visitor's system setting) BEFORE the page paints, so there is no light/dark flash.
   It is an external file instead of an inline <script> so the Content-Security-Policy can forbid ALL inline scripts. */
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'light' ? '#fffbf2' : '#0c0b14');
  } catch (e) {}
})();
