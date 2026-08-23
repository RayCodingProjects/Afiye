/* The packing list. Each item is [name, note] — the note is optional.
   Anything added or removed in the browser is kept separately, in storage,
   so editing this file never wipes what someone has already ticked. */
window.Camp = window.Camp || {};

Camp.data = {
  groups: [
    { id: "grill", name: "Barbecue and fire", items: [
      ["Meat for the grill", "Marinate it at home"],
      ["Charcoal", ""],
      ["Lighter", ""],
      ["Saw", "For cutting firewood"],
      ["Skewers", ""],
      ["Tongs", ""],
      ["Potatoes", "Wrap them in foil"],
      ["Corn", ""],
      ["Aluminium foil", ""],
      ["Disposable gloves", ""],
      ["Msaba3", "Check what this one is"]
    ]},
    { id: "food", name: "Food", items: [
      ["Bread", ""],
      ["Eggs", ""],
      ["Butter", ""],
      ["Picon cheese", ""],
      ["Nutella", ""],
      ["Chips", "Agree the flavours first"],
      ["Chewing gum", ""],
      ["Salt", ""],
      ["Ketchup", ""],
      ["Garlic sauce", ""],
      ["Snacks for the drive", ""]
    ]},
    { id: "drink", name: "Drink", items: [
      ["Water", "Beyond what we carry on the hike"],
      ["Ice", ""],
      ["Drinks", "Agree what and how much first"],
      ["Instant coffee", ""],
      ["Kettle for hot water", ""],
      ["Teapot", ""],
      ["Cups", ""]
    ]},
    { id: "kitchen", name: "Kitchen kit", items: [
      ["Plates", ""],
      ["Knives, forks and spoons", ""],
      ["Frying pan", "For the eggs"],
      ["Tissues", ""],
      ["Bin bags", "We take our rubbish home"]
    ]},
    { id: "hike", name: "For the hike", items: [
      ["Shoes with proper grip", "Forest paths and a 400 m climb — not sandals"],
      ["Two litres of water each", "Nowhere to buy any on the trail"],
      ["Cash for the entrance", "$4 each, and it's cash only"],
      ["Small backpack", ""],
      ["Sun hat", "UV reaches 8 here in August"],
      ["Snacks", "Something salty"]
    ]},
    { id: "sleep", name: "Sleeping", items: [
      ["Sleeping bag or blanket", "Mattress is provided, bedding may not be"],
      ["Pillow", ""],
      ["A layer for the evening", "670 m up, so cooler than the coast"],
      ["Something dry to sleep in", ""],
      ["Earplugs", "If you're a light sleeper"]
    ]},
    { id: "clothes", name: "Clothes", items: [
      ["Swimsuit", "There's a pool at the camp"],
      ["Second outfit", ""],
      ["Underwear", ""],
      ["Towel", ""],
      ["Sandals", "For around camp and the showers"],
      ["Light jacket or hoodie", "Evenings get cooler"]
    ]},
    { id: "wash", name: "Washing and personal", items: [
      ["Toothbrush", ""],
      ["Toothpaste", ""],
      ["Soap", ""],
      ["Deodorant", ""],
      ["Cotton buds", ""],
      ["Sunscreen", "High factor"],
      ["Insect repellent", ""],
      ["Any medication you take", ""],
      ["Small first aid kit", "Plasters, painkillers, blister patches"],
      ["Toilet roll", "Bring some, just in case"]
    ]},
    { id: "fun", name: "Things to do", items: [
      ["Two seasons of Better Call Saul", "Downloaded, not streamed"],
      ["Speaker", ""],
      ["Backgammon", ""],
      ["Guess What card game", ""],
      ["Earphones", ""]
    ]},
    { id: "kit", name: "Documents and power", items: [
      ["ID card", ""],
      ["Phone charger", "The tents have electricity"],
      ["Power bank", "In case the socket is taken"],
      ["Head torch or a good flashlight", "One each"],
      ["Swiss army knife", ""],
      ["Cash", "For activities, the guide and extras"]
    ]}
  ]
};
