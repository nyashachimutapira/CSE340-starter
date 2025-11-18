const classifications = [
  { classification_id: 1, classification_name: "Custom" },
  { classification_id: 2, classification_name: "SUV" },
  { classification_id: 7, classification_name: "Truck" },
  { classification_id: 3, classification_name: "Classic" },
  { classification_id: 4, classification_name: "Sports" },
  { classification_id: 5, classification_name: "Concept" },
  { classification_id: 6, classification_name: "Sedan" },
];

const inventory = [
  {
    inv_id: 1,
    inv_make: "DMC",
    inv_model: "Delorean",
    inv_year: 1982,
    inv_description:
      "The DMC Delorean is an icon of 80s design featuring gull-wing doors and stainless steel body panels. Perfect for turning heads on any street.",
    inv_image: "/images/vehicles/delorean.jpg",
    inv_thumbnail: "/images/vehicles/delorean-tn.jpg",
    inv_price: 72000,
    inv_miles: 24500,
    inv_color: "Stainless Steel",
    classification_id: 1,
  },
  {
    inv_id: 2,
    inv_make: "Chevrolet",
    inv_model: "Camaro",
    inv_year: 1969,
    inv_description:
      "A meticulously restored 1969 Chevy Camaro with modern suspension and brakes, blending classic lines with present-day performance.",
    inv_image: "/images/vehicles/camaro.jpg",
    inv_thumbnail: "/images/vehicles/camaro-tn.jpg",
    inv_price: 89500,
    inv_miles: 12100,
    inv_color: "Inferno Orange",
    classification_id: 4,
  },
  {
    inv_id: 3,
    inv_make: "Cadillac",
    inv_model: "Escalade",
    inv_year: 2022,
    inv_description:
      "Top-of-the-line Escalade with Super Cruise and an immersive AKG sound system for effortless long-distance travel.",
    inv_image: "/images/vehicles/escalade.jpg",
    inv_thumbnail: "/images/vehicles/escalade-tn.jpg",
    inv_price: 112400,
    inv_miles: 4300,
    inv_color: "Black Raven",
    classification_id: 7,
  },
  {
    inv_id: 4,
    inv_make: "Tesla",
    inv_model: "Cybertruck",
    inv_year: 2024,
    inv_description:
      "Futuristic stainless-steel body, adaptive air suspension, and tri-motor AWD make the Cybertruck ready for any adventure.",
    inv_image: "/images/vehicles/monster-truck.jpg",
    inv_thumbnail: "/images/vehicles/monster-truck-tn.jpg",
    inv_price: 98500,
    inv_miles: 50,
    inv_color: "Brushed Steel",
    classification_id: 5,
  },
  {
    inv_id: 5,
    inv_make: "Jeep",
    inv_model: "Wrangler Rubicon",
    inv_year: 2021,
    inv_description:
      "Trail-rated Rubicon with steel bumpers, 35-inch tires, front sway-bar disconnect, and the confidence to crawl over anything.",
    inv_image: "/images/vehicles/wrangler.jpg",
    inv_thumbnail: "/images/vehicles/wrangler-tn.jpg",
    inv_price: 56200,
    inv_miles: 18900,
    inv_color: "Sarge Green",
    classification_id: 2,
  },
  {
    inv_id: 6,
    inv_make: "Ford",
    inv_model: "Model T",
    inv_year: 1924,
    inv_description:
      "A carefully preserved Ford Model T, complete with wooden spoke wheels and brass accents celebrating the dawn of motoring.",
    inv_image: "/images/vehicles/model-t.jpg",
    inv_thumbnail: "/images/vehicles/model-t-tn.jpg",
    inv_price: 38000,
    inv_miles: 8800,
    inv_color: "Heritage Black",
    classification_id: 3,
  },
  {
    inv_id: 7,
    inv_make: "Wayne Industries",
    inv_model: "Batmobile",
    inv_year: 2023,
    inv_description:
      "Stealth armor, jet propulsion, and an adaptive AI cockpit make this custom Batmobile ready for any nighttime pursuit.",
    inv_image: "/images/vehicles/batmobile.jpg",
    inv_thumbnail: "/images/vehicles/batmobile-tn.jpg",
    inv_price: 1500000,
    inv_miles: 120,
    inv_color: "Matte Black",
    classification_id: 1,
  },
  {
    inv_id: 8,
    inv_make: "Mutts Cutts",
    inv_model: "Dog Car",
    inv_year: 1994,
    inv_description:
      "A fully-furred custom van complete with floppy ears, wagging tail, and canine-themed upholstery for unforgettable road trips.",
    inv_image: "/images/vehicles/dog-car.jpg",
    inv_thumbnail: "/images/vehicles/dog-car-tn.jpg",
    inv_price: 45000,
    inv_miles: 82000,
    inv_color: "Sandstone",
    classification_id: 1,
  },
  {
    inv_id: 9,
    inv_make: "Chevrolet",
    inv_model: "Survan",
    inv_year: 1986,
    inv_description:
      "A slammed surf-ready van with wraparound glass, twin roof racks, and a custom interior built for coastal cruising.",
    inv_image: "/images/vehicles/survan.jpg",
    inv_thumbnail: "/images/vehicles/survan-tn.jpg",
    inv_price: 68000,
    inv_miles: 54000,
    inv_color: "Seafoam Green",
    classification_id: 1,
  },
  {
    inv_id: 10,
    inv_make: "Mysterio",
    inv_model: "Mystery Van",
    inv_year: 1972,
    inv_description:
      "Groovy paint, shag carpet, and hidden compartments make this Mystery Van the ultimate retro custom cruiser.",
    inv_image: "/images/vehicles/mystery-van.jpg",
    inv_thumbnail: "/images/vehicles/mystery-van-tn.jpg",
    inv_price: 52000,
    inv_miles: 67200,
    inv_color: "Mystery Green",
    classification_id: 1,
  },
  {
    inv_id: 11,
    inv_make: "Aerocar International",
    inv_model: "Aerocar",
    inv_year: 1964,
    inv_description:
      "One of the original flying cars with detachable wings, folding prop assembly, and certified road manners.",
    inv_image: "/images/vehicles/aerocar.jpg",
    inv_thumbnail: "/images/vehicles/aerocar-tn.jpg",
    inv_price: 325000,
    inv_miles: 19500,
    inv_color: "Sky Silver",
    classification_id: 1,
  },
  {
    inv_id: 12,
    inv_make: "Grave Digger",
    inv_model: "Monster Truck",
    inv_year: 2022,
    inv_description:
      "Massive 66-inch tires, 1,500 horsepower, and a custom tube chassis built to crush cars at every show.",
    inv_image: "/images/vehicles/monster-truck.jpg",
    inv_thumbnail: "/images/vehicles/monster-truck-tn.jpg",
    inv_price: 285000,
    inv_miles: 2500,
    inv_color: "Neon Green & Black",
    classification_id: 1,
  },
  {
    inv_id: 13,
    inv_make: "Ford",
    inv_model: "Crown Victoria",
    inv_year: 2011,
    inv_description:
      "Former fleet Crown Vic turned comfortable daily driver with refreshed suspension, leather seating, and modern infotainment.",
    inv_image: "/images/vehicles/crwn-vic.jpg",
    inv_thumbnail: "/images/vehicles/crwn-vic-tn.jpg",
    inv_price: 18500,
    inv_miles: 76000,
    inv_color: "Oxford White",
    classification_id: 6,
  },
  {
    inv_id: 14,
    inv_make: "Ford",
    inv_model: "Model T Sedan",
    inv_year: 1926,
    inv_description:
      "Four-door Tin Lizzie sedan with updated wiring and hidden AC to keep vintage motoring comfortable for the whole crew.",
    inv_image: "/images/vehicles/model-t.jpg",
    inv_thumbnail: "/images/vehicles/model-t-tn.jpg",
    inv_price: 42000,
    inv_miles: 9100,
    inv_color: "Ebony",
    classification_id: 6,
  },
  {
    inv_id: 15,
    inv_make: "Concept Garage",
    inv_model: "Mechanic Special",
    inv_year: 2020,
    inv_description:
      "Hand-built sedan showcasing exposed mechanical artistry, panoramic glass, and a hybrid drivetrain tuned for smooth city cruising.",
    inv_image: "/images/vehicles/mechanic.jpg",
    inv_thumbnail: "/images/vehicles/mechanic-tn.jpg",
    inv_price: 68500,
    inv_miles: 4500,
    inv_color: "Gunmetal",
    classification_id: 6,
  },
  {
    inv_id: 16,
    inv_make: "AM General",
    inv_model: "Hummer",
    inv_year: 2003,
    inv_description:
      "Wide-track Hummer with factory winch, snorkel intake, and leather-appointed interior for comfortable off-road domination.",
    inv_image: "/images/vehicles/hummer.jpg",
    inv_thumbnail: "/images/vehicles/hummer-tn.jpg",
    inv_price: 137500,
    inv_miles: 33100,
    inv_color: "Matte Desert Tan",
    classification_id: 7,
  },
  {
    inv_id: 17,
    inv_make: "Pierce",
    inv_model: "Enforcer Fire Truck",
    inv_year: 2018,
    inv_description:
      "Fully equipped pumper with 500-gallon tank, LED scene lighting, and custom cabinetry that turns heads at every parade.",
    inv_image: "/images/vehicles/fire-truck.jpg",
    inv_thumbnail: "/images/vehicles/fire-truck-tn.jpg",
    inv_price: 545000,
    inv_miles: 6900,
    inv_color: "Crimson Red",
    classification_id: 7,
  },
];

async function getClassifications() {
  return classifications;
}

async function getClassificationById(classificationId) {
  return classifications.find(
    (classification) => classification.classification_id === Number(classificationId)
  );
}

async function getInventoryByClassificationId(classificationId) {
  return inventory.filter(
    (vehicle) => vehicle.classification_id === Number(classificationId)
  );
}

async function getInventoryById(invId) {
  return inventory.find((vehicle) => vehicle.inv_id === Number(invId));
}

module.exports = {
  getClassifications,
  getClassificationById,
  getInventoryByClassificationId,
  getInventoryById,
};

