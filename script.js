const productos = [
  { id: 1, nombre: "Torre De Pizza", precio: 25.00, categoria: "Arquitectura", imagen: "https://p.turbosquid.com/ts-thumb/O6/XZ9Gc3/aL/r6/png/1659601959/600x600/fit_q87/f1f8089367c074d38ffca861a0990ad330e9d6c8/r6.jpg" },
  { id: 2, nombre: "Tren Chu Chu", precio: 15.00, categoria: "Vehículos", imagen: "https://p.turbosquid.com/ts-thumb/ID/YCvLn0/Bl/trem2/png/1679174413/600x600/fit_q87/ea8a3a605a3029e048196391fe9affa965f23b35/trem2.jpg" },
  { id: 3, nombre: "Rostro", precio: 40.00, categoria: "Figuras", imagen: "https://p.turbosquid.com/ts-thumb/fU/gCM1RK/hDd2K321/bpr_render/jpg/1491116805/600x600/fit_q87/f56663c365046b9ca5b9a45ee6d8eab636f13b47/bpr_render.jpg" },
  { id: 4, nombre: "Perro Salchicha", precio: 8.00, categoria: "Animales", imagen: "https://p.turbosquid.com/ts-thumb/fQ/u8amP4/Pc/dutchhound3dprintablemodel/jpg/1609881199/600x600/fit_q87/59df17ab387ced4f11dc2ee30aecca2dbf5639bc/dutchhound3dprintablemodel.jpg" },
  { id: 5, nombre: "GYM", precio: 60.00, categoria: "Arquitectura", imagen: "https://p.turbosquid.com/ts-thumb/FK/jIn23W/s8/1/jpg/1618150449/600x600/fit_q87/cdeafca67ac0e60bb8157d7677238a2fa9e5eaf7/1.jpg" },
  { id: 6, nombre: "Faro", precio: 10.00, categoria: "Arquitectura", imagen: "https://p.turbosquid.com/ts-thumb/Gu/XIVwOs/qN/lighthouse_.124/jpg/1643799052/600x600/fit_q87/3cca1793903546b1121ef39921425505800e2b13/lighthouse_.124.jpg" },
  { id: 7, nombre: "Carro InitialD", precio: 100.00, categoria: "Vehículos", imagen: "https://p.turbosquid.com/ts-thumb/rZ/Jby2Zm/1c7ghSMu/car_01.effectsresult/jpg/1551442632/1000x1000/fit_q99/a50b7d205d52d2b132fa98240a7375e5b4616739/car_01.effectsresult.jpg" },
];

let carrito = new Map();
const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const contenedorPayPal = document.getElementById("paypal-button-container");

function filtrarPorCategoria() {
  const seleccion = document.getElementById("categoria").value;
  const filtrados = seleccion === "todos"
    ? productos
    : productos.filter(p => p.categoria === seleccion);

  contenedorProductos.innerHTML = "";

  filtrados.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  contenedorPayPal.style.display = "none";
}

function eliminarDelCarrito(id) {
  const item = carrito.get(id);
  if (!item) return;

  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (carrito.size === 0) return;
  if (confirm("¿Vaciar todo el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(Array.from(carrito.entries())));
}

function cargarCarrito() {
  const data = localStorage.getItem("carrito");
  if (data) {
    carrito = new Map(JSON.parse(data));
    actualizarCarrito();
  }
}

function mostrarPayPal() {
  const total = Array.from(carrito.values()).reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  if (total <= 0) {
    alert("Tu carrito está vacío");
    return;
  }

  contenedorPayPal.innerHTML = "";
  contenedorPayPal.style.display = "block";

  paypal.Buttons({
    createOrder: (data, actions) => actions.order.create({
      purchase_units: [{ amount: { value: total.toFixed(2) } }]
    }),
    onApprove: (data, actions) => actions.order.capture().then(details => {
      alert(`¡Gracias ${details.payer.name.given_name}, tu compra fue exitosa!`);
      vaciarCarrito();
    }),
    onError: err => {
      console.error("Error con PayPal:", err);
      alert("Hubo un problema con el pago.");
    }
  }).render("#paypal-button-container");
}

filtrarPorCategoria();
cargarCarrito();

