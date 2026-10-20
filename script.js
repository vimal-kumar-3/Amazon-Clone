const products = [
  {id:1,name:"Wireless Bluetooth Headphones",category:"Electronics",price:1499,oldPrice:2499,rating:4.4,reviews:1248,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30d?auto=format&fit=crop&w=700&q=85",description:"Comfortable over-ear headphones with wireless audio for work, travel and everyday listening."},
  {id:2,name:"Smart Watch with Fitness Tracking",category:"Electronics",price:2199,oldPrice:3999,rating:4.2,reviews:834,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",description:"A versatile smartwatch-style accessory for everyday activity and notifications."},
  {id:3,name:"Everyday Running Shoes",category:"Fashion",price:1799,oldPrice:2999,rating:4.3,reviews:561,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",description:"Lightweight everyday sneakers with a cushioned sole and a sporty design."},
  {id:4,name:"Minimal Ceramic Table Lamp",category:"Home",price:999,oldPrice:1499,rating:4.1,reviews:312,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85",description:"A simple modern table lamp for a desk, bedside table or reading corner."},
  {id:5,name:"Daily Hydration Water Bottle",category:"Sports",price:499,oldPrice:799,rating:4.5,reviews:2203,image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85",description:"Reusable bottle for school, work, travel and outdoor activities."},
  {id:6,name:"Skincare Essentials Set",category:"Beauty",price:849,oldPrice:1299,rating:4.0,reviews:428,image:"https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=700&q=85",description:"A curated skincare set for a simple daily self-care routine. Check labels for ingredients."},
  {id:7,name:"Stainless Steel Cookware Pan",category:"Kitchen",price:1299,oldPrice:1899,rating:4.2,reviews:675,image:"https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=85",description:"A practical cookware piece for everyday home cooking."},
  {id:8,name:"Compact Mechanical Keyboard",category:"Electronics",price:2499,oldPrice:3499,rating:4.6,reviews:987,image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=85",description:"A compact keyboard for a tidy desk setup and everyday typing."},
  {id:9,name:"Cotton Everyday Backpack",category:"Fashion",price:1199,oldPrice:1799,rating:4.1,reviews:394,image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",description:"A versatile backpack for daily essentials, commuting and short trips."},
  {id:10,name:"Soft Throw Cushion",category:"Home",price:699,oldPrice:999,rating:4.3,reviews:182,image:"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=85",description:"A soft decorative cushion to add comfort to a sofa or reading nook."},
  {id:11,name:"Portable Bluetooth Speaker",category:"Electronics",price:1599,oldPrice:2299,rating:4.4,reviews:1104,image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85",description:"A compact speaker for music and podcasts at home or on the go."},
  {id:12,name:"Yoga and Stretching Mat",category:"Sports",price:899,oldPrice:1399,rating:4.2,reviews:738,image:"https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=700&q=85",description:"A supportive exercise mat for stretching, yoga and home workouts."}
];

const $ = (selector) => document.querySelector(selector);
const productGrid = $("#productGrid");
const searchInput = $("#searchInput");
const categoryFilter = $("#categoryFilter");
const sortSelect = $("#sortSelect");
const cartDrawer = $("#cartDrawer");
const overlay = $("#overlay");
const toast = $("#toast");
const money = (value) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);
const readStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
let cart = readStorage("shopzone-cart", []);
let wishlist = readStorage("shopzone-wishlist", []);
let activeCategory = "All";
let toastTimer;

function saveState() {
  try { localStorage.setItem("shopzone-cart", JSON.stringify(cart)); localStorage.setItem("shopzone-wishlist", JSON.stringify(wishlist)); } catch {}
}
function notify(message) {
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function safeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function filteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let list = products.filter(p => (activeCategory === "All" || p.category === activeCategory) &&
    (!query || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query)));
  switch(sortSelect.value) {
    case "price-low": list.sort((a,b)=>a.price-b.price); break;
    case "price-high": list.sort((a,b)=>b.price-a.price); break;
    case "rating": list.sort((a,b)=>b.rating-a.rating); break;
  }
  return list;
}
function renderProducts() {
  const list = filteredProducts();
  $("#productsTitle").textContent = activeCategory === "All" ? "Popular products" : `${activeCategory} products`;
  $("#resultsCount").textContent = `${list.length} product${list.length===1?"":"s"} found`;
  $("#activeFilters").innerHTML = [
    activeCategory !== "All" ? `<span class="filter-chip">${safeText(activeCategory)} <button data-clear-category aria-label="Clear category">×</button></span>` : "",
    searchInput.value.trim() ? `<span class="filter-chip">Search: ${safeText(searchInput.value.trim())} <button data-clear-search aria-label="Clear search">×</button></span>` : ""
  ].filter(Boolean).join("");
  productGrid.innerHTML = list.map(p => {
    const liked = wishlist.includes(p.id);
    const discount = Math.round((1-p.price/p.oldPrice)*100);
    return `<article class="product-card">
      <div class="product-image-wrap"><img src="${p.image}" alt="${safeText(p.name)}" loading="lazy"><button class="wishlist-btn ${liked?"active":""}" data-wishlist="${p.id}" aria-label="${liked?"Remove from":"Add to"} wishlist"><i class="fa-${liked?"solid":"regular"} fa-heart"></i></button></div>
      <p class="product-category">${safeText(p.category)}</p><h3>${safeText(p.name)}</h3>
      <p class="rating" aria-label="${p.rating} out of 5 stars">★★★★★ <span>${p.rating} (${p.reviews.toLocaleString("en-IN")})</span></p>
      <div class="price-row"><span class="price">${money(p.price)}</span><span class="old-price">${money(p.oldPrice)}</span><span class="discount">${discount}% off</span></div>
      <p class="prime-note"><i class="fa-solid fa-check"></i> In stock · Demo listing</p>
      <button class="add-cart-btn" data-add="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add to cart</button>
    </article>`;
  }).join("");
  $("#emptyState").hidden = list.length !== 0;
  productGrid.hidden = list.length === 0;
}
function cartQuantity() { return cart.reduce((sum,item)=>sum+item.quantity,0); }
function cartSubtotal() { return cart.reduce((sum,item)=>{const p=products.find(p=>p.id===item.id);return sum+(p?p.price*item.quantity:0);},0); }
function addToCart(id) {
  const found = cart.find(item=>item.id===id);
  if(found) found.quantity++; else cart.push({id,quantity:1});
  saveState(); renderCart(); renderHeaderCart(); notify(`${products.find(p=>p.id===id).name} added to cart`);
}
function updateQuantity(id, delta) {
  const item = cart.find(item=>item.id===id); if(!item) return;
  item.quantity += delta; if(item.quantity <= 0) cart = cart.filter(item=>item.id!==id);
  saveState(); renderCart(); renderHeaderCart();
}
function removeFromCart(id) { cart=cart.filter(item=>item.id!==id); saveState();renderCart();renderHeaderCart();notify("Item removed from cart"); }
function renderHeaderCart() {
  $("#cartCount").textContent=cartQuantity();
  $("#drawerCount").textContent=`(${cartQuantity()})`;
  $("#cartSubtotal").textContent=money(cartSubtotal());
}
function renderCart() {
  const empty=cart.length===0;
  $("#cartEmpty").hidden=!empty; $("#cartSummary").hidden=empty;
  $("#cartItems").hidden=empty;
  $("#cartItems").innerHTML=cart.map(item=>{
    const p=products.find(p=>p.id===item.id); if(!p)return "";
    return `<article class="cart-line"><img src="${p.image}" alt="${safeText(p.name)}"><div><h3>${safeText(p.name)}</h3><p class="line-category">${safeText(p.category)}</p><div class="qty-control"><button data-qty="-1" data-id="${p.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-qty="1" data-id="${p.id}" aria-label="Increase quantity">+</button></div><button class="remove-btn" data-remove="${p.id}">Remove</button></div><span class="line-price">${money(p.price*item.quantity)}</span></article>`;
  }).join("");
  renderHeaderCart();
}
function openCart() { cartDrawer.hidden=false;overlay.hidden=false;document.body.style.overflow="hidden";$("#closeCartBtn").focus(); }
function closeCart() { cartDrawer.hidden=true;overlay.hidden=true;document.body.style.overflow="";$("#openCartBtn").focus(); }
function setCategory(category) {
  activeCategory=category;categoryFilter.value=category;renderProducts();$("#products").scrollIntoView({behavior:"smooth"});
}
function showDialog(title, body, icon="fa-circle-info") {
  $("#dialogContent").innerHTML=`<div class="dialog-icon"><i class="fa-solid ${icon}"></i></div><h2>${safeText(title)}</h2>${body}`;
  const dialog=$("#messageDialog"); if(!dialog.open) dialog.showModal();
}
function toggleWishlist(id) {
  if(wishlist.includes(id)){wishlist=wishlist.filter(item=>item!==id);notify("Removed from wishlist");}
  else {wishlist.push(id);notify("Saved to your wishlist");}
  saveState();renderProducts();
}
$("#searchForm").addEventListener("submit", e=>{e.preventDefault();renderProducts();$("#products").scrollIntoView({behavior:"smooth"});});
searchInput.addEventListener("input",renderProducts);
categoryFilter.addEventListener("change",()=>{activeCategory=categoryFilter.value;renderProducts();});
sortSelect.addEventListener("change",renderProducts);
productGrid.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]"); if(add){addToCart(Number(add.dataset.add));return;}
  const wish=e.target.closest("[data-wishlist]");if(wish)toggleWishlist(Number(wish.dataset.wishlist));
});
$("#activeFilters").addEventListener("click",e=>{
  if(e.target.closest("[data-clear-category]")){activeCategory="All";categoryFilter.value="All";renderProducts();}
  if(e.target.closest("[data-clear-search]")){searchInput.value="";renderProducts();}
});
$("#clearFiltersBtn").addEventListener("click",()=>{searchInput.value="";activeCategory="All";categoryFilter.value="All";sortSelect.value="featured";renderProducts();});
$("#openCartBtn").addEventListener("click",openCart);
$("#closeCartBtn").addEventListener("click",closeCart);
$("#continueShoppingBtn").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
$("#cartItems").addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]");if(qty){updateQuantity(Number(qty.dataset.id),Number(qty.dataset.qty));return;}
  const remove=e.target.closest("[data-remove]");if(remove)removeFromCart(Number(remove.dataset.remove));
});
$("#checkoutBtn").addEventListener("click",()=>{
  if(!cart.length)return;
  showDialog("Checkout preview",`<p>Your demo order subtotal is <strong>${money(cartSubtotal())}</strong>.</p><p>This learning project does not collect payment or submit a real order. A production checkout needs a backend, secure payment provider and order database.</p><div class="dialog-actions"><button class="primary-button" id="checkoutDoneBtn">Got it</button></div>`,"fa-bag-shopping");
  $("#checkoutDoneBtn").addEventListener("click",()=>$("#messageDialog").close());
});
$("#closeMessageBtn").addEventListener("click",()=>$("#messageDialog").close());
$("#backTopBtn").addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
$("#dealPrev").addEventListener("click",()=>$("#dealContainer").scrollBy({left:-280,behavior:"smooth"}));
$("#dealNext").addEventListener("click",()=>$("#dealContainer").scrollBy({left:280,behavior:"smooth"}));
$("#mobileMenuBtn").addEventListener("click",()=>$("#navPanel").classList.toggle("open"));
$("#navPanel").addEventListener("click",e=>{
  const link=e.target.closest("[data-category]");if(link){e.preventDefault();setCategory(link.dataset.category);$("#navPanel").classList.remove("open");}
});
$("#allCategoriesBtn").addEventListener("click",()=>{activeCategory="All";categoryFilter.value="All";searchInput.value="";renderProducts();$("#products").scrollIntoView({behavior:"smooth"});$("#navPanel").classList.remove("open");});
$("#deliveryBtn").addEventListener("click",()=>{
  showDialog("Delivery location",`<p>This demo is set to deliver to India. In a real store, delivery availability would be checked against your saved address or postal code.</p><div class="dialog-actions"><button class="primary-button" id="locationOkBtn">Continue</button></div>`,"fa-location-dot");
  $("#locationOkBtn").addEventListener("click",()=>$("#messageDialog").close());
});
$("#accountBtn").addEventListener("click",()=>showDialog("Account sign-in",`<p>Sign-in is a demo placeholder. Real accounts require a backend and secure authentication; do not store passwords in browser JavaScript.</p>`,"fa-user"));
$("#ordersBtn").addEventListener("click",()=>showDialog("Your orders",`<p>There are no real orders in this demo. Orders appear here only after a backend saves a completed checkout.</p>`,"fa-box"));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!cartDrawer.hidden)closeCart();});
renderProducts();renderCart();