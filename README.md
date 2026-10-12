# Forno Nero: wood-fired pizza website

Static site (HTML, CSS, vanilla JS). No build step and no dependencies. Open `index.html`, or deploy the folder as it is.

## Before you go live (10 minutes)
1. **`js/config.js`**: set your WhatsApp number (digits only, with country code, e.g. `919876543210`), phone, email, address, the Google Maps search text, opening hours, delivery fee and areas, and social links. Until the WhatsApp number is set the cart runs in demo mode.
2. **Brand name**: find and replace "Forno Nero" across the `.html` files and `js/config.js`.
3. **Menu and prices**: edit `js/data.js` (dishes, sizes, prices, veg flag, tags, offers).
4. **Reviews**: the three reviews in `js/data.js` are samples. Replace them with real ones, then set `showSampleNotes: false` in `js/config.js`.
5. **Photos**: dish photos are free Unsplash stock. Swap in photos of your own food by putting a URL or a local path (e.g. `assets/img/margherita.jpg`) in each dish's `img`.
6. **Videos**: clips stream from Mixkit (free licence). For speed and reliability, download them into `assets/video/` (see `assets/video/README.txt`).
7. **Legal pages**: `privacy.html` and `terms.html` are plain-language starting points. Have them checked for your business.
8. **Domain**: replace `https://your-domain.com` in `sitemap.xml` and `robots.txt`.

## Deploy
- **Vercel**: push this folder to a GitHub repo and import it in Vercel. Framework preset: "Other". No build command and no output directory. `vercel.json` turns on clean URLs (`/menu`) and caching.
- **Netlify**: drag the folder onto app.netlify.com/drop.
- Any static host works. `404.html` is picked up automatically on Vercel and Netlify.

## How ordering works
Customers add dishes, choose delivery or pickup, and fill in their details. "Send order on WhatsApp" opens WhatsApp with the full order written out, including line items, totals, address, payment choice, coupon and notes. Nothing is charged online. The cart and the customer's details are saved in their browser, so they don't retype them next time. The party-order and contact forms send WhatsApp messages the same way.

## Pages
`index` (home with the 3D scroll story), `menu`, `offers`, `catering` (party orders), `gallery`, `about`, `contact`, `faq`, `privacy`, `terms`, `404`.

## The 3D scroll story (home page)
`js/story.js` drives one sticky scene. Dough, sauce, cheese and toppings drop on as real photo layers. Then the pizza bakes, a kraft box folds up around it, and the box leaves for delivery. It uses native scrolling with transform and opacity animation only, and it respects "reduce motion". Each layer's crop can be tuned with `--zoom` on its `<img>` in `index.html`.

## Files
```
css/styles.css     all styles
js/config.js       your business settings  ← edit
js/data.js         menu, offers, gallery, reviews, video sources  ← edit
js/main.js         cart, WhatsApp, menu, gallery, maps, video
js/story.js        home-page 3D scroll story
assets/            favicon, video folder
```
