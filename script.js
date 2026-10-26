"use strict";

const STORAGE_KEY = "grandHallCart_v1";

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

let cart = [];
let inspectedId = null;

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(raw)) {
      cart = [...new Set(raw)].filter(id => seats.has(id) && !seats.get(id).unavailable);
    }
  } catch (e) { cart = []; }
}

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { }
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

function refreshSeat(id) {
  const el = seatEls.get(id);
  const s = seats.get(id);
  if (!el) return;
  const inCart = cart.includes(id);
  el.classList.toggle("unavailable", s.unavailable);
  el.classList.toggle("incart", inCart);
  el.classList.toggle("inspected", inspectedId === id);
}

function refreshAllSeats() { seats.forEach((_, id) => refreshSeat(id)); }

const $ = id => document.getElementById(id);
const addBtn = $("add-btn");

function inspect(id) {
  const prev = inspectedId;
  inspectedId = id;
  if (prev) refreshSeat(prev);
  refreshSeat(id);
  renderInspection();
}

function renderInspection() {
  $("inspect-msg").textContent = "";
  if (!inspectedId) {
    $("inspect-empty").hidden = false;
    $("inspect-details").hidden = true;
    return;
  }
  const s = seats.get(inspectedId);
  const inCart = cart.includes(s.id);
  $("inspect-empty").hidden = true;
  $("inspect-details").hidden = false;
  $("d-seat").textContent = s.id;
  $("d-category").textContent = CATEGORIES[s.category].name;
  $("d-row").textContent = s.row;
  $("d-number").textContent = s.number;
  $("d-status").textContent = s.unavailable ? "Unavailable" : inCart ? "In cart" : "Available";
  $("d-price").textContent = "$" + s.price;
  addBtn.disabled = s.unavailable || inCart;
  addBtn.textContent = s.unavailable ? "UNAVAILABLE" : inCart ? "ALREADY IN CART" : "ADD TO CART";
}

function addToCart(id) {
  const s = seats.get(id);
  if (!s || s.unavailable || cart.includes(id)) return false;
  cart.push(id);
  saveCart();
  refreshSeat(id);
  renderCart();
  renderInspection();
  $("inspect-msg").textContent = `Seat ${id} added to cart.`;
  return true;
}

function removeFromCart(id) {
  const i = cart.indexOf(id);
  if (i === -1) return;
  cart.splice(i, 1);
  saveCart();
  refreshSeat(id);
  renderCart();
  if (inspectedId === id) renderInspection();
}

function renderCart() {
  const list = $("cart-list");
  list.innerHTML = "";
  let total = 0;
  cart.forEach(id => {
    const s = seats.get(id);
    total += s.price;
    const li = document.createElement("li");
    li.innerHTML = `<div class="info"><strong>Seat ${s.id}</strong><small>${CATEGORIES[s.category].name} · Row ${s.row}</small></div>
      <div class="right"><span>$${s.price}</span><button type="button" class="btn" data-remove="${s.id}" aria-label="Remove seat ${s.id}">Remove</button></div>`;
    list.appendChild(li);
  });
  $("cart-empty").hidden = cart.length > 0;
  $("cart-count").textContent = cart.length;
  $("cart-total").textContent = "$" + total;
  $("clear-btn").disabled = cart.length === 0;
}

world.addEventListener("click", e => {
  const btn = e.target.closest(".seat");
  if (btn) inspect(btn.dataset.id);
});

addBtn.addEventListener("click", () => { if (inspectedId) addToCart(inspectedId); });

$("cart-list").addEventListener("click", e => {
  const b = e.target.closest("[data-remove]");
  if (b) removeFromCart(b.dataset.remove);
});

$("clear-btn").addEventListener("click", () => {
  const ids = [...cart];
  cart = [];
  saveCart();
  ids.forEach(refreshSeat);
  renderCart();
  renderInspection();
});

buildSeatData();
loadCart();
renderVenue();
renderLegend();
refreshAllSeats();
renderCart();
renderInspection();