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

buildSeatData();