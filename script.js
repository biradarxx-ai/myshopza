const BOT_TOKEN = "8595596858:AAFlfcgi_np5e2MxVzYvIH7vGXBX9LM_ugM";
const CHAT_ID = "8088335060";
const DEFAULT_PASS = "1234";

let isShopOpen = false;
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

// Login
function login() {
  const pass = document.getElementById('password').value;
  if (pass === DEFAULT_PASS) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    loadDashboard();
    loadProducts();
    loadSalesDropdown();
    loadHistory();
  } else {
    document.getElementById('login-msg').textContent = "❌ Wrong Password!";
  }
}

function logout() {
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('password').value = '';
}

// Tab Switching
function showTab(n) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${n}`).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach((el,i) => {
    el.classList.toggle('active', i===n);
  });
}

// Shop Toggle
async function toggleShop() {
  const statusDiv = document.getElementById('status');
  const btn = document.getElementById('shop-btn');
  const now = new Date();
  const timeStr = now.toLocaleString('hi-IN');

  isShopOpen = !isShopOpen;

  const action = isShopOpen ? "khol diya" : "band kar diya";
  const message = `🛒 MyShop\n🚪 Shop ${action}!\n⏰ ${timeStr}`;

  // Telegram
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({chat_id: CHAT_ID, text: message})
    });
  } catch(e) {}

  // Local Save
  const entry = { type: isShopOpen ? "Open" : "Close", time: timeStr };
  history.unshift(entry);
  localStorage.setItem('history', JSON.stringify(history));

  statusDiv.innerHTML = `<p style="color:#4CAF50;font-size:1.6em;">✅ Shop \( {action.toUpperCase()}<br> \){timeStr}</p>`;
  btn.textContent = isShopOpen ? "🚪 SHOP CLOSE" : "🚪 SHOP OPEN";
  btn.style.background = isShopOpen ? "#f44336" : "#4CAF50";

  loadDashboard();
  loadHistory();
}

// Products
function addProduct() {
  const name = document.getElementById('prod-name').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);

  if (name && price) {
    products.push({id: Date.now(), name, price});
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
    loadSalesDropdown();
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-price').value = '';
  }
}

function loadProducts() {
  const list = document.getElementById('product-list');
  list.innerHTML = products.map(p => `
    <div class="product-item">
      <span>\( {p.name} - ₹ \){p.price}</span>
      <button onclick="deleteProduct(${p.id})" style="background:red;color:white;padding:5px 10px;border-radius:8px;">Delete</button>
    </div>
  `).join('');
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(products));
  loadProducts();
  loadSalesDropdown();
}

// Sales
function loadSalesDropdown() {
  const select = document.getElementById('sale-product');
  select.innerHTML = products.map(p => `<option value="\( {p.id}"> \){p.name} (₹${p.price})</option>`).join('');
}

function recordSale() {
  const prodId = parseInt(document.getElementById('sale-product').value);
  const qty = parseInt(document.getElementById('sale-qty').value) || 1;
  const product = products.find(p => p.id === prodId);

  if (product) {
    const total = product.price * qty;
    sales.push({product: product.name, qty, total, time: new Date().toLocaleString('hi-IN')});
    localStorage.setItem('sales', JSON.stringify(sales));

    document.getElementById('sale-status').innerHTML = `<p style="color:#4CAF50;">✅ Sale Recorded: ₹${total}</p>`;
    loadDashboard();
  }
}

function loadDashboard() {
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  document.getElementById('total-sales').textContent = `₹${totalSales}`;
  document.getElementById('today-sales').textContent = `₹${totalSales}`; // simple logic, can be improved
  document.getElementById('shop-status').textContent = isShopOpen ? "OPEN" : "CLOSED";
  document.getElementById('shop-status').style.color = isShopOpen ? "#4CAF50" : "#f44336";
}

// History
function loadHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = history.map(h => `
    <div style="background:rgba(255,255,255,0.1);padding:12px;margin:8px 0;border-radius:10px;">
      ${h.type} - ${h.time}
    </div>
  `).join('');
}