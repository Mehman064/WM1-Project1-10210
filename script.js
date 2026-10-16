const CATEGORIES = {
  vip:      { name: "VIP",      price: 120 },
  premium:  { name: "Premium",  price: 80 },
  standard: { name: "Standard", price: 45 }
};

const ZONES = [
  { category: "vip",      rows: ["A", "B"] },
  { category: "premium",  rows: ["C", "D", "E", "F"] },
  { category: "standard", rows: ["G", "H", "I", "J", "K", "L"] }
];

const BLOCKS = [5, 8, 5];

const seats = new Map(); 

function buildSeatData() {
  let rowIndex = 0;
  ZONES.forEach(zone => {
    zone.rows.forEach(row => {
      let number = 1;
      BLOCKS.forEach(count => {
        for (let i = 0; i < count; i++, number++) {
          const id = row + number;
          const sold = (rowIndex * 7 + number * 13 + rowIndex * number) % 6 === 0;
          seats.set(id, {
            id, row, number,
            category: zone.category,
            price: CATEGORIES[zone.category].price,
            unavailable: sold
          });
        }
      });
      rowIndex++;
    });
  });
}

const world = document.getElementById("world");
const viewport = document.getElementById("viewport");
const seatEls = new Map();

function renderVenue() {
  const frag = document.createDocumentFragment();
  const stage = document.createElement("div");
  stage.className = "stage";
  stage.textContent = "STAGE";
  frag.appendChild(stage);

  ZONES.forEach(zone => {
    const cat = CATEGORIES[zone.category];
    const label = document.createElement("div");
    label.className = "category-label";
    label.textContent = `${cat.name} – $${cat.price}`;
    frag.appendChild(label);

    zone.rows.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.className = "row";
      rowEl.appendChild(rowLabel(row));
      let number = 1;
      BLOCKS.forEach((count, b) => {
        if (b > 0) { const a = document.createElement("span"); a.className = "aisle"; rowEl.appendChild(a); }
        for (let i = 0; i < count; i++, number++) {
          const s = seats.get(row + number);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "seat " + s.category;
          btn.dataset.id = s.id;
          btn.textContent = s.number;
          btn.setAttribute("aria-label", `Seat ${s.id}, ${CATEGORIES[s.category].name}, $${s.price}`);
          seatEls.set(s.id, btn);
          rowEl.appendChild(btn);
        }
      });
      rowEl.appendChild(rowLabel(row));
      frag.appendChild(rowEl);
    });
  });
  world.appendChild(frag);
}

function rowLabel(t) {
  const d = document.createElement("span");
  d.className = "row-label";
  d.textContent = t;
  return d;
}

function renderLegend() {
  const items = [
    ["seat vip", "VIP ($120)"], ["seat premium", "Premium ($80)"], ["seat standard", "Standard ($45)"],
    ["seat inspected", "Inspected"], ["seat incart", "In cart"], ["seat unavailable", "Unavailable"]
  ];
  document.getElementById("legend").innerHTML =
    items.map(([c, t]) => `<li><span class="${c}"></span>${t}</li>`).join("");
}

buildSeatData();
renderVenue();
renderLegend();