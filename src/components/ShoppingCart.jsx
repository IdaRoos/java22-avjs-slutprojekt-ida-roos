import "../css/ShoppingCart.css";
import { useState } from "react";

export default function ShoppingCart({
  cartItems,
  clearCart,
  clearCartAndShowProducts,
}) {
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  // Function that loops through each item in the cart and add its price to the sum
  function getTotal() {
    let sum = 0;
    for (let i = 0; i < cartItems.length; i++) {
      sum += cartItems[i].pris;
    }
    return sum;
  }

  async function updateInventory(cartItems) {
    // Create a dictionary to group cart items by product ID
    const groupedItems = {};
    for (const item of cartItems) {
      const productId = item.id;
      if (!groupedItems[productId]) {
        groupedItems[productId] = [];
      }
      groupedItems[productId].push(item);
    }

    // Update inventory for each product in the dictionary
    for (const productId in groupedItems) {
      const productURL = `https://webshop-84703-default-rtdb.europe-west1.firebasedatabase.app/Store/${productId}.json`;

      // Fetch the current data for the product from the database
      const response = await fetch(productURL);
      const data = await response.json();
      console.log(data);
      const currentInventory = data.lagersaldo;

      // Calculate the total inventory decrease for the product
      const numItems = groupedItems[productId].length;
      const inventoryDecrease = Math.min(currentInventory, numItems);

      // Update the inventory for the product in the database
      const updatedInventory = currentInventory - inventoryDecrease;
      const options = {
        method: "PATCH",
        body: JSON.stringify({ lagersaldo: updatedInventory }),
        headers: {
          "Content-type": "application/json",
        },
      };
      const response2 = await fetch(productURL, options);
      await response2.json();
    }
  }

  //  Function that updates the database with the new inventory levels
  async function handlePurchase() {
    await updateInventory(cartItems);

    clearCart();
    setPurchaseComplete(true);
  }

  // Function that clears the cart and resets purchaseComplete to false to show the cart again
  function removeAllItems() {
    clearCart();
    setPurchaseComplete(false);
    clearCartAndShowProducts();
  }

  // Render the shopping cart component
  return (
    <div className="cart-container">
      {purchaseComplete ? (
        <h2>Tack för ditt köp!</h2>
      ) : (
        <>
          <h2>Varukorg: {cartItems.length} produkter</h2>
          {cartItems.length > 0 ? (
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={index}>
                  <p>{item.namn}</p>
                  <p>{item.pris} :-</p>
                </div>
              ))}
              <h4>Totalt: {getTotal()} :-</h4>
            </div>
          ) : (
            <p>Varukorgen är tom</p>
          )}
          <div className="cartbutton-container">
            <button onClick={removeAllItems}>Töm varukorg</button>
            <button disabled={cartItems.length === 0} onClick={handlePurchase}>
              {" "}
              Genomför köp
            </button>
          </div>
        </>
      )}
    </div>
  );
}
