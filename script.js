
// Danh sách sản phẩm mẫu
window.PRODUCTS = [
  {id:101, name:"Áo thun basic", category:"ao", price:149000, colors:["trắng","đen","xanh"], sizes:["S","M","L","XL"], img:"https://picsum.photos/seed/shirt101/640/480", desc:"Cotton 100%, co giãn nhẹ"},
  {id:201, name:"Quần jeans xanh", category:"quan", price:399000, colors:["xanh","đen"], sizes:["28","29","30","31","32"], img:"https://picsum.photos/seed/jeans201/640/480", desc:"Slim fit, co giãn"},
  {id:301, name:"Áo khoác bomber", category:"ao_khoac", price:549000, colors:["đen","xanh rêu"], sizes:["M","L"], img:"https://picsum.photos/seed/bomber301/640/480", desc:"Chống gió, có túi"},
];

const $ = s => document.querySelector(s);
const app = $('#app');
const CART_KEY = 'minh_fashion_cart';

// State lọc
const state = { q:'', category:'all', size:'all', min:0, max:1000000 };

// Cart helpers
function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function setCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartCount(); }
function updateCartCount(){ $('#cartCount').textContent = getCart().reduce((s,i)=>s+i.qty,0); }
const currency = n => n.toLocaleString('vi-VN', {style:'currency', currency:'VND'});

function addToCart(p, size, color){
  if(!size || !color) return alert('Chọn size & màu trước khi thêm vào giỏ.');
  const cart = getCart();
  const key = `${p.id}-${size}-${color}`;
  const found = cart.find(i => i.key === key);
  if(found) found.qty += 1; else cart.push({ key, id:p.id, name:p.name, price:p.price, size, color, qty:1 });
  setCart(cart); alert(`Đã thêm: ${p.name} (${size}, ${color})`);
}

// Views
function Home(){
  return `<section><h1>Minh Fashion</h1>
    <p>Demo shop quần áo: xem sản phẩm, lọc, thêm vào giỏ.</p>
    #/productsBắt đầu mua sắm</a></section>`;
}

function Filters(){
  const cats = [['all','Tất cả'], ['ao','Áo'], ['quan','Quần'], ['ao_khoac','Áo khoác']];
  return `<div class="filters">
    <input class="input" placeholder="Tìm tên..." value="${state.q}" oninput="onFilter('q', this.value)" />
    <select class="select" onchange="onFilter('category', this.value)">
      ${cats.map(([v,l]) => `<option value="${v}" ${state.category===v?'selected':''}>${l}</option>`).join('')}
    </select>
    <input class="input" type="number" min="0" placeholder="Giá từ" value="${state.min}" oninput="onFilter('min', parseInt(this.value||0))" />
    <input class="input" type="number" min="0" placeholder="Giá đến" value="${state.max}" oninput="onFilter('max', parseInt(this.value||1000000))" />
  </div>`;
}
function onFilter(k,v){ state[k]=v; render(); }

function Products(){
  const list = window.PRODUCTS.filter(p=>{
    const okQ = state.q ? p.name.toLowerCase().includes(state.q.toLowerCase()) : true;
    const okCat = state.category==='all' ? true : p.category===state.category;
    const okPrice = p.price>=state.min && p.price<=state.max;
    return okQ && okCat && okPrice;
  });
  const cards = list.map(p=>{
    const sizeOptions = (p.sizes||[]).map(s=>`<option value="${s}">${s}</option>`).join('');
    const colorOptions = (p.colors||[]).map(c=>`<option value="${c}">${c}</option>`).join('');
    return `<article class="card">
      <img src="${   <div class="body">
        <h3>${p.name}</h3><p class="price">${currency(p.price)}</p><p>${p.desc}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0">
          <select class="select" id="size_${p.id}">${sizeOptions}</select>
          <select class="select" id="color_${p.id}">${colorOptions}</select>
        </div>
        <button class="btn"
          onclick="addToCart(window.PRODUCTS.find(x=>x.id===${p.id}), $('#size_${p.id}').value, $('#color_${p.id}').value)">
          Thêm vào giỏ
        </button>
      </div>
    </article>`;
  }).join('');
  return `<section><h2>Sản phẩm</h2>${Filters()}<div class="grid">${cards}</div></section>`;
}

function Cart(){
  const cart = getCart();
  if(cart.length===0) return `<p>Giỏ hàng trống.</p>`;
  const rows = cart.map((i,idx)=>`
    <div class="card" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:8px;padding:12px">
      <div>${i.name} <small>(${i.size}, ${i.color})</small></div>
      <div>${currency(i.price)}</div>
      <div>Số lượng: <input type="number" min="1" value="${i.qty}" onchange="updateQty(${idx}, this.value)" class="input" /></div>
      <div>${currency(i.price*i.qty)}</div>
    </div>`).join('');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  return `<section><h2>Giỏ hàng</h2>${rows}<p>Tổng: <strong>${currency(total)}</strong></p>
    <button class="btn" onclick="checkout()">Thanh toán (demo)</button>
    <button class="btn secondary" onclick="clearCart()" style="margin-left:8px">Xóa giỏ</button></section>`;
}
function updateQty(idx,val){ const cart=getCart(); cart[idx].qty=Math.max(1, parseInt(val||1)); setCart(cart); render(); }
function clearCart(){ setCart([]); render(); }
function checkout(){ alert('Demo: lưu đơn vào localStorage'); const orders=JSON.parse(localStorage.getItem('minh_orders')||'[]'); orders.push({time: new Date().toISOString(), items:getCart()}); localStorage.setItem('minh_orders', JSON.stringify(orders)); clearCart(); }

function About(){ return `<section><h2>Giới thiệu</h2><p>Demo shop quần áo bằng HTML+CSS+JS.</p></section>`; }

// Router
const routes = {'#/': Home, '#/products': Products, '#/cart': Cart, '#/about': About};
function render(){ updateCartCount(); const View = routes[location.hash] || Home; app.innerHTML = View(); }
window.addEventListener('hashchange', render); render();
