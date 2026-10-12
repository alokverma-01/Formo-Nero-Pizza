/* =============================================================
   FORNO NERO — SITE SETTINGS
   This is the one file to edit before going live. No build step:
   save the file, refresh the page, done.
   ============================================================= */
window.SITE = {
  name: "Forno Nero",

  /* WhatsApp number that RECEIVES orders.
     Country code + number, digits only, no "+" or spaces.
     Example (India): "919876543210".
     While this still contains X's the site runs in demo mode: the order
     message opens WhatsApp's contact picker instead of your chat. */
  whatsapp: "91XXXXXXXXXX",

  phone: "+91 XXXXX XXXXX",          // shown on the site
  phoneLink: "",                     // optional, for tap-to-call, e.g. "+919876543210"
  email: "hello@fornonero.in",

  address: {
    line1: "Shop 4, Example Market Road",
    line2: "Your Area, Your City 000000"
  },
  /* What Google Maps should look up for the footer map and "Get directions".
     Your exact business name + area works best once you're listed on Maps. */
  mapQuery: "Connaught Place, New Delhi",

  timezone: "Asia/Kolkata",
  /* Opening hours, 24-hour clock. 0 = Sunday … 6 = Saturday.
     Use { closed: true } for a day off. A closing time after midnight
     (e.g. "01:00") is understood as the next morning. */
  hours: {
    0: { open: "12:00", close: "23:30" },
    1: { open: "12:00", close: "23:00" },
    2: { open: "12:00", close: "23:00" },
    3: { open: "12:00", close: "23:00" },
    4: { open: "12:00", close: "23:00" },
    5: { open: "12:00", close: "23:59" },
    6: { open: "12:00", close: "23:59" }
  },

  currency: "₹",
  delivery: {
    fee: 40,              // delivery charge below the free-delivery amount
    freeAbove: 599,       // free delivery at or above this subtotal
    minOrder: 199,        // minimum subtotal for delivery orders
    eta: "35–45 minutes",
    radiusKm: 6,
    areas: ["Area One", "Area Two", "Area Three", "Area Four", "Area Five", "Area Six"]
  },
  payment: ["UPI on delivery", "Cash on delivery", "Card on delivery"],

  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
    x: ""                 // leave empty to hide an icon
  },

  /* Show small "sample" notes next to placeholder reviews.
     Set to false once you've replaced them with real ones in js/data.js. */
  showSampleNotes: true
};
