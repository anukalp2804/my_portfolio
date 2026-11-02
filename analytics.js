/* =========================================================
   VISITOR STATISTICS  (private - only you can see the numbers)

   Uses GoatCounter: free for personal websites, no cookies, no personal data,
   so no cookie banner is needed. The numbers live in YOUR dashboard
   (login required) - nothing is shown on the website itself.

   SET UP (3 minutes):
   1) Create a free account at https://www.goatcounter.com and choose a code,
      for example "anukalp"  (your dashboard becomes https://anukalp.goatcounter.com)
   2) Put that code between the quotes below.
   3) Publish the site. Leave the code EMPTY to switch counting off.

   Do not count yourself: once on each of your own devices/browsers, open your
   live site with  #toggle-goatcounter  at the end, e.g.
       https://your-site.com/#toggle-goatcounter
   Pages opened from your computer (file://) and localhost are never counted.
========================================================= */
(function () {
  'use strict';

  var GOATCOUNTER_CODE = 'anukalp';   // <-- your GoatCounter code goes here, e.g. 'anukalp'

  // Not set up (or an invalid value): do nothing and send nothing anywhere.
  if (!/^[a-z0-9-]{2,}$/i.test(GOATCOUNTER_CODE)) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + GOATCOUNTER_CODE + '.goatcounter.com/count');
  document.head.appendChild(s);
})();
