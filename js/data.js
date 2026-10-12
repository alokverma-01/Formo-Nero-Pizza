/* =============================================================
   FORNO NERO — MENU, OFFERS, GALLERY, REVIEWS, MEDIA
   Edit dishes and prices here. Images use Unsplash photo IDs
   (the part after "photo-" in an images.unsplash.com link).
   To use your own photo instead, put a full URL or a local path
   like "assets/img/margherita.jpg" in `img`.
   ============================================================= */
(function () {
  /* Photo library (Unsplash IDs) */
  var P = {
    margherita: "1667207394004-acb6aaf4790e",
    garden: "1788090486394-e6a08a9ee1d1",
    verde: "1587085416963-22efba033dd5",
    funghi: "1590947132387-155cc02f3212",
    pepperoni: "1534308983496-4fabb1a015ee",
    fourCheese: "1620374645310-f9d97e733268",
    paneer: "1679007317554-f2087b47a365",
    truffle: "1717883235373-ef10b2a745a3",
    diavola: "1628840042765-356cda07504e",
    bbq: "1579751626657-72bc17010498",
    sausage: "1604382354936-07c5d9983bd3",
    prosciutto: "1762922425226-9411194abb68",
    garlicBread: "1573140401552-3fab0b24306f",
    garlicToast: "1619535860434-ba1d8fa12536",
    wedges: "1589311671025-647c03293eaa",
    fries: "1623238913973-21e45cced554",
    wings: "1567620832903-9fc6debc209f",
    arrabbiata: "1676300184847-4ee4030409c0",
    alfredo: "1673971372358-769a28fa4c81",
    ragu: "1621996346565-e3dbc646d9a9",
    tiramisu: "1571877227200-a0d98ea607e9",
    lava: "1673551490812-eaee2e9bf0ef",
    cheesecake: "1639744211487-b27e3551b07c",
    coldCoffee: "1517701550927-30cf4ba1dba5",
    cooler: "1762922425290-2ae8c063baa1",
    latte: "1461023058943-07fcbe16d735",
    /* story + pages */
    doughTexture: "1697247079184-efb23487a172",
    sauceTexture: "1752627559682-9b7f0f0ded4e",
    cheeseMacro: "1782112415996-f6d5926f399f",
    crust: "1685188445490-3fe8a28e7db1",
    cheeseStage: "1777333033402-f53f5eb3e5c6",
    onStone: "1550401728-539ebf40d9e9",
    oven: "1622880833523-7cf1c0bd4296",
    ovenFire: "1606152196365-d1ce5ea838b5",
    delivery: "1617347454431-f49d7ff5c3b1",
    kraft: "1629968417841-d87296c4205b",
    topView: "1589187151053-5ec8818e661b",
    sixPizzas: "1670819917475-d42114832433",
    pizzaTable: "1739792600083-1699433c5ec7",
    twoPizzas: "1754047166273-a3cc44c1cf50",
    pizzaWine: "1762922425256-621f056e1ebb",
    ingredients: "1690983322070-22861e13ce47",
    holdingDough: "1537734796389-e1fc293cf856",
    rollingDough: "1517686469429-8bdb88b9f907",
    kneadDark: "1532460734809-e7f8475ca917",
    kneadWarm: "1716237388463-14fdbfc0ca5e",
    kneadWide: "1716237388087-4e47595a6615",
    sliceLift: "1790355126680-31fafd786f74",
    party: "1606066889831-35faf6fa6ff6",
    spinach: "1762631178753-ce2adae403f9"
  };

  /* Video clips from Mixkit (free licence, no attribution required).
     For best reliability download them and point these at local files,
     e.g. sd: "assets/video/hero.mp4". */
  function mix(id, q) { return "https://assets.mixkit.co/videos/" + id + "/" + id + "-" + q + ".mp4"; }
  var media = {
    hero:  { hd: mix(42481, 720), sd: mix(42481, 360), poster: P.oven, label: "Pizza going into a wood-fired oven", page: "https://mixkit.co/free-stock-video/hot-oven-baking-pizzas-42481/" },
    dough: { sd: mix(42469, 360), poster: P.kneadDark, label: "Shaping the dough", page: "https://mixkit.co/free-stock-video/chef-shaping-a-pizza-42469/" },
    sauce: { sd: mix(42473, 360), poster: P.sauceTexture, label: "Spreading the sauce", page: "https://mixkit.co/free-stock-video/putting-sauce-on-pizza-dough-42473/" },
    box:   { sd: mix(42483, 360), poster: P.twoPizzas, label: "Slicing in the box", page: "https://mixkit.co/free-stock-video/pizza-chef-cutting-a-pizza-42483/" },
    door:  { sd: mix(14929, 360), poster: P.delivery, label: "Out for delivery", page: "https://mixkit.co/free-stock-video/man-delivering-two-pizzas-14929/" },
    slice: { hd: mix(42487, 720), sd: mix(42487, 360), poster: P.sliceLift, label: "Taking a slice", page: "https://mixkit.co/free-stock-video/pizza-while-someone-takes-a-slice-42487/" }
  };

  var PIZZA_SIZES = function (r, m, l) {
    return [
      { key: "R", label: "Regular", note: '7"', price: r },
      { key: "M", label: "Medium", note: '10"', price: m },
      { key: "L", label: "Large", note: '12"', price: l }
    ];
  };

  var menu = [
    {
      id: "classic", name: "Classic pizzas",
      blurb: "The ones that built the oven's reputation. Every base is 48-hour dough.",
      items: [
        { id: "margherita", name: "Margherita", veg: true, img: P.margherita, tags: ["Bestseller"],
          desc: "Crushed tomato, fresh mozzarella, basil and a ribbon of olive oil.", sizes: PIZZA_SIZES(249, 399, 549) },
        { id: "garden", name: "Garden Veggie", veg: true, img: P.garden,
          desc: "Bell peppers, black olives, red onion, sweet corn and mozzarella.", sizes: PIZZA_SIZES(279, 449, 599) },
        { id: "verde", name: "Spinach & Ricotta", veg: true, img: P.verde,
          desc: "Baby spinach, ricotta, cherry tomatoes and roasted garlic.", sizes: PIZZA_SIZES(299, 479, 629) },
        { id: "funghi", name: "Funghi", veg: true, img: P.funghi,
          desc: "Roasted mushrooms, thyme, mozzarella and garlic oil.", sizes: PIZZA_SIZES(299, 479, 629) },
        { id: "pepperoni", name: "Pepperoni", veg: false, img: P.pepperoni, tags: ["Bestseller"],
          desc: "Spicy pepperoni that crisps at the edges, mozzarella, oregano.", sizes: PIZZA_SIZES(349, 549, 699) },
        { id: "four-cheese", name: "Four Cheese", veg: true, img: P.fourCheese,
          desc: "Mozzarella, cheddar, parmesan and blue cheese with a honey drizzle.", sizes: PIZZA_SIZES(349, 549, 729) }
      ]
    },
    {
      id: "signature", name: "Signature pizzas",
      blurb: "Our own recipes, built for the wood fire.",
      items: [
        { id: "tandoori-paneer", name: "Tandoori Paneer", veg: true, img: P.paneer, tags: ["Spicy", "House favourite"],
          desc: "Tandoori-marinated paneer, red onion, capsicum and mint drizzle.", sizes: PIZZA_SIZES(349, 569, 749) },
        { id: "truffle-mushroom", name: "Truffle Mushroom", veg: true, img: P.truffle,
          desc: "Wild mushrooms, truffle oil, parmesan and fresh rocket.", sizes: PIZZA_SIZES(399, 629, 829) },
        { id: "diavola", name: "Diavola", veg: false, img: P.diavola, tags: ["Spicy"],
          desc: "Spicy salami, chilli honey, mozzarella and fresh chilli.", sizes: PIZZA_SIZES(399, 629, 829) },
        { id: "bbq-chicken", name: "Smoky BBQ Chicken", veg: false, img: P.bbq,
          desc: "Barbecue chicken, red onion, smoked cheese and coriander.", sizes: PIZZA_SIZES(379, 599, 799) },
        { id: "chicken-sausage", name: "Chicken Sausage & Olive", veg: false, img: P.sausage,
          desc: "Chicken sausage, black olives, mushrooms and oregano.", sizes: PIZZA_SIZES(369, 589, 779) },
        { id: "prosciutto", name: "Prosciutto & Rocket", veg: false, img: P.prosciutto,
          desc: "Cured ham added after the bake, rocket and parmesan shavings.", sizes: PIZZA_SIZES(449, 699, 899) }
      ]
    },
    {
      id: "sides", name: "Sides",
      blurb: "Made for sharing, or not.",
      items: [
        { id: "garlic-bread", name: "Garlic Bread", veg: true, img: P.garlicBread, price: 149,
          desc: "Wood-fired bread, garlic butter and parsley." },
        { id: "cheesy-garlic-toast", name: "Cheesy Garlic Toast", veg: true, img: P.garlicToast, price: 189, tags: ["Bestseller"],
          desc: "Garlic butter, mozzarella and chilli flakes, baked till it bubbles." },
        { id: "peri-wedges", name: "Peri-Peri Wedges", veg: true, img: P.wedges, price: 169,
          desc: "Skin-on potato wedges with peri-peri salt and garlic dip." },
        { id: "fries", name: "Salted Fries", veg: true, img: P.fries, price: 129,
          desc: "Crisp fries with sea salt and ketchup." },
        { id: "chilli-wings", name: "Chilli Chicken Wings", veg: false, img: P.wings, price: 299, tags: ["Spicy"],
          desc: "Six wings, sweet chilli glaze, spring onion and ranch." }
      ]
    },
    {
      id: "pasta", name: "Pasta",
      blurb: "Tossed to order.",
      items: [
        { id: "arrabbiata", name: "Penne Arrabbiata", veg: true, img: P.arrabbiata, price: 279, tags: ["Spicy"],
          desc: "Penne in a garlicky tomato and chilli sauce, parmesan on top." },
        { id: "alfredo", name: "Creamy Alfredo", veg: true, img: P.alfredo, price: 299,
          desc: "Penne in a parmesan cream sauce with black pepper." },
        { id: "chicken-ragu", name: "Chicken Ragù Penne", veg: false, img: P.ragu, price: 329,
          desc: "Slow-cooked chicken ragù, penne and grated parmesan." }
      ]
    },
    {
      id: "desserts", name: "Desserts",
      blurb: "All eggless.",
      items: [
        { id: "tiramisu", name: "Eggless Tiramisu", veg: true, img: P.tiramisu, price: 199,
          desc: "Coffee-soaked sponge, mascarpone cream and cocoa." },
        { id: "lava-cake", name: "Choco Lava Cake", veg: true, img: P.lava, price: 149, tags: ["Bestseller"],
          desc: "Warm chocolate cake with a molten centre." },
        { id: "coffee-cheesecake", name: "Coffee Cheesecake", veg: true, img: P.cheesecake, price: 219,
          desc: "Baked eggless cheesecake with an espresso swirl." }
      ]
    },
    {
      id: "drinks", name: "Drinks",
      blurb: "Cold, every time.",
      items: [
        { id: "cold-coffee", name: "Cold Coffee", veg: true, img: P.coldCoffee, price: 149,
          desc: "Blended coffee with milk and ice." },
        { id: "mint-cooler", name: "Mint Lime Cooler", veg: true, img: P.cooler, price: 119,
          desc: "Fresh mint, lime and soda over crushed ice." },
        { id: "iced-latte", name: "Iced Latte", veg: true, img: P.latte, price: 169,
          desc: "Double shot of espresso over cold milk." }
      ]
    }
  ];

  var deals = [
    { id: "deal-duo", name: "Weekday Duo", price: 699, was: 898, img: P.twoPizzas, when: "Mon to Thu",
      desc: "Any two medium classic pizzas. Tell us your two picks in the order notes.", veg: true },
    { id: "deal-family", name: "Family Box", price: 1499, was: 1846, img: P.party, when: "Every day",
      desc: "Two large pizzas, cheesy garlic toast and two cold drinks.", veg: true },
    { id: "deal-solo", name: "Solo Lunch", price: 349, was: 497, img: P.sliceLift, when: "12 to 4 pm",
      desc: "A regular Margherita or Garden Veggie, salted fries and a mint cooler.", veg: true },
    { id: "deal-party", name: "Party Pack", price: 3999, was: 4870, img: P.pizzaTable, when: "Order a day ahead",
      desc: "Five large pizzas, two sides and six lava cakes. Feeds about ten.", veg: true }
  ];

  var gallery = [
    { img: P.oven, cat: "kitchen", alt: "A pizza baking inside a wood-fired oven", w: 3, h: 2 },
    { img: P.sixPizzas, cat: "food", alt: "Six pizzas on a table seen from above", w: 4, h: 5 },
    { img: P.kneadDark, cat: "kitchen", alt: "Hands kneading pizza dough", w: 3, h: 2 },
    { img: P.sliceLift, cat: "people", alt: "A hand lifting a slice of margherita pizza", w: 2, h: 3 },
    { img: P.topView, cat: "food", alt: "Margherita pizza on a wooden table, top view", w: 2, h: 3 },
    { img: P.ovenFire, cat: "kitchen", alt: "Fire burning inside a pizza oven", w: 2, h: 3 },
    { img: P.pizzaTable, cat: "food", alt: "A table filled with different pizzas", w: 3, h: 2 },
    { img: P.party, cat: "people", alt: "Friends sharing pizza and snacks", w: 2, h: 3 },
    { img: P.kneadWide, cat: "kitchen", alt: "Dough being worked on a floured table", w: 3, h: 2 },
    { img: P.twoPizzas, cat: "food", alt: "Two pizzas on a steel counter", w: 2, h: 3 },
    { img: P.onStone, cat: "kitchen", alt: "A pizza being topped on a pizza stone", w: 2, h: 3 },
    { img: P.ingredients, cat: "kitchen", alt: "Fresh ingredients around a cutting board", w: 3, h: 2 },
    { img: P.pizzaWine, cat: "food", alt: "Two pizzas served at a table", w: 3, h: 2 },
    { img: P.holdingDough, cat: "kitchen", alt: "A cook holding a ball of dough", w: 2, h: 3 },
    { img: P.truffle, cat: "food", alt: "Pizza with a cutter on a wooden board", w: 3, h: 2 },
    { img: P.bbq, cat: "food", alt: "Pizza on a dark wooden table", w: 3, h: 2 }
  ];

  /* SAMPLE reviews — replace with real ones before launch. */
  var reviews = [
    { quote: "The crust is the best I've had in the city. Light, charred in spots, and it was still hot when it reached our door.", name: "Aditi", where: "ordered for delivery" },
    { quote: "Ordering on WhatsApp took a minute. They confirmed the time straight away and the Tandoori Paneer is now our Friday thing.", name: "Rohan", where: "regular since last year" },
    { quote: "We got the Party Pack for my son's birthday. Fifteen kids, zero leftovers, and someone called to check the timing.", name: "Meera", where: "party order" }
  ];

  var credits = [
    ["Yosuke Ota", "yosuke_ota"], ["Zayed Ahmed Zadu", "zayed_ahmed_zadu"], ["Anastasiia Chepinska", "anastasiiachepinska"],
    ["Vit Ch", "v_uk_europe"], ["Alan Hardman", "alanaktion"], ["engin akyurt", "enginakyurt"], ["Bruno van der Kraan", "brunovdkraan"],
    ["Amadeus Moga", "amadeusmoga"], ["Fernando Andrade", "thisisnando"], ["Nik Owens", "nik_owens"], ["Shourav Sheikh", "shouravsheikh"],
    ["Jessie Maxwell", "jessiemaxwellphotography"], ["sandevil sandh", "sandevil"], ["Jay Gajjar", "jaygajjar"], ["Abby kale", "k15april_abhi"],
    ["Chad Montano", "briewilly"], ["Orkun Orcan", "orkunorcan"], ["Fatemeh Rz", "dino_trexx"], ["Ben Lei", "bleiplays33"],
    ["Marianna OLE", "marianna_ole"], ["American Heritage Chocolate", "americanheritagechocolate"], ["Nathan Dumlao", "nate_dumlao"],
    ["Demi DeHerrera", "demidearest"], ["MeSSrro", "messrro"], ["stephan de MARANTHI", "maranthi"], ["Monaz Nazary", "monazme"],
    ["Anna Bratiychuk", "skysay"], ["Brelyn Bashrum", "brelynkk"], ["Vaishnav Chogale", "vshnv_c"], ["Fabrizio Pullara", "fabrizio_photopf"],
    ["Klara Kulikova", "kkalerry"], ["Rowan Freeman", "rowanfreeman"], ["Kiwihug", "kiwihug"], ["Nadya Filatova", "dabyki"],
    ["Caramel", "caramel_works"], ["Andrius Budrikas", "andriusbudrikas"], ["Raamin ka", "raaminka"], ["Sergey Kotenev", "sergeykotenev"],
    ["Arturrro", "artek123"], ["Nadya Spetnitskaya", "kiboka"], ["Juan Manuel Núñez Méndez", "juanmanunez"], ["Aldward Castillo", "aldwardcv31"],
    ["Hameen Reynolds", "hameen"], ["No Revisions", "norevisions"], ["joe boshra", "joestudios"]
  ];

  window.DATA = { photos: P, media: media, menu: menu, deals: deals, gallery: gallery, reviews: reviews, credits: credits };
})();
