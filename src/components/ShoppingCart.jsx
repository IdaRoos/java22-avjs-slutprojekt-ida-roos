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
    const url =
      "https://webshop-84703-default-rtdb.europe-west1.firebasedatabase.app/Store.json";

    // Loop through each item in the cart and update its inventory in the database
    for (let i = 0; i < cartItems.length; i++) {
      const productId = cartItems[i].id;
      const productURL = `https://webshop-84703-default-rtdb.europe-west1.firebasedatabase.app/Store/${productId}.json`;

      // Fetch the current data for the product from the database

      const response = await fetch(productURL);
      const data = await response.json();
      const currentInventory = data.lagersaldo;

      // Decrement the inventory by 1, but not lower than 0

      let updatedInventory = currentInventory - 1;
      if (updatedInventory < 0) {
        updatedInventory = 0;
      }

      // Update the inventory for the product in the database

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

  // Call the updateInventory function to update the database with the new inventory levels
  async function handlePurchase() {
    await updateInventory(cartItems);

    // Clear the cart and set purchaseComplete to true to display the thank you message
    clearCart();
    setPurchaseComplete(true);
  }

  function removeAllItems() {
    // Clear the cart and reset purchaseComplete to false to show the cart again
    clearCart();
    setPurchaseComplete(false);

    // Call the clearCartAndShowProducts function to display the products again
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
