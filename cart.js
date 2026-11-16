/* MAROWNIE SHOPPING CART */

(() => {
  "use strict";

  const STORAGE_KEY = "marownie_cart";

  function getItems() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateCartCount();
    window.dispatchEvent(new Event("marownie:cart-updated"));
  }

  function updateCartCount() {
    const items = getItems();
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelectorAll("[data-cart-count]").forEach(element => {
      element.textContent = count;
      element.hidden = count === 0;
    });
  }

  function addItem(product) {
    if (
      !product.id ||
      !product.name ||
      !Number.isFinite(product.price) ||
      product.price <= 0
    ) {
      console.error("Invalid Marownie product:", product);
      return;
    }

    const items = getItems();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        unit: product.unit || "",
        quantity: 1
      });
    }

    saveItems(items);
  }

  function updateQuantity(id, quantity) {
    const items = getItems();
    const item = items.find(product => product.id === id);

    if (!item) return;

    const newQuantity = Math.floor(Number(quantity));

    if (!Number.isFinite(newQuantity) || newQuantity <= 0) {
      removeItem(id);
      return;
    }

    item.quantity = newQuantity;
    saveItems(items);
  }

  function removeItem(id) {
    saveItems(getItems().filter(item => item.id !== id));
  }

  function clearCart() {
    saveItems([]);
  }

  function getSubtotal() {
    return getItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-cart-add]");
    if (!button) return;

    addItem({
      id: button.dataset.productId,
      name: button.dataset.productName,
      price: Number(button.dataset.productPrice),
      image: button.dataset.productImage,
      unit: button.dataset.productUnit
    });

    const originalText = button.textContent;
    button.textContent = "ADDED TO CART";

    setTimeout(() => {
      button.textContent = originalText;
    }, 1400);
  });

  window.MarownieCart = {
    getItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    formatPrice,
    updateCartCount
  };

  document.addEventListener("DOMContentLoaded", updateCartCount);
  updateCartCount();
})();
