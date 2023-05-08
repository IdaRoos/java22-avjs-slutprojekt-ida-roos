import "../css/ProductPage.css";
import { useState, useEffect } from "react";
import FilterProducts from "./FilterProducts";

export default function ProductPage({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [priceFilter, setPriceFilter] = useState("Alla"); // Lägg till state för prisfiltret

  // Fetches product data from Firebase, maps the data to a new array of products, and sets the products state with the new array.
  async function getProducts() {
    const url =
      "https://webshop-84703-default-rtdb.europe-west1.firebasedatabase.app/Store.json";
    const response = await fetch(url);
    const data = await response.json();

    if (data) {
      const newProducts = Object.keys(data).map((key) => {
        return {
          id: key,
          namn: data[key].namn,
          bild: data[key].bild,
          pris: data[key].pris,
          lagersaldo: data[key].lagersaldo,
        };
      });

      // Set the products state with the newProducts array
      setProducts(newProducts);
    }
  }

  // Call the getProducts function when the component mounts
  useEffect(() => {
    getProducts();
  }, []);

  // Handle adding a product to the cart
  function handleAddToCartClick(product) {
    // Destructuring the "product" object to get the values of the properties
    const { id, namn, pris, lagersaldo } = product;

    const count = productCounts[id] || 0;
    if (count >= lagersaldo) {
      return alert(
        `Det finns inte tillräckligt med lagersaldo för boken ${namn}`
      );
    }
    const item = { id, namn, pris }; // Create a new object 'item' with the properties 'id', 'namn', and 'pris' taken from the 'product' object that was passed as an argument to the function.
    addToCart(item); // Add the new 'item' to the cart.
    setProductCounts({
      ...productCounts,
      [id]: count + 1,
    });
  }

  // Filters the products based on the selected price range filter
  function handleFilterPrice(product, filter) {
    switch (filter) {
      case "0-100":
        return product.pris >= 0 && product.pris <= 100;
      case "100-200":
        return product.pris >= 100 && product.pris <= 200;
      case "200-500":
        return product.pris >= 200 && product.pris <= 500;
      default:
        return true;
    }
  }

  return (
    <>
      <FilterProducts
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
      />
      {products.length > 0 ? (
        <div className="product-container">
          {products
            .filter((product) => handleFilterPrice(product, priceFilter))
            .map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.bild} />
                <h2>{product.namn}</h2>
                <h4>{product.pris} :-</h4>
                {product.lagersaldo > 0 ? (
                  <div>
                    <p>I lager: {product.lagersaldo}</p>
                    <button
                      className="addtocart-btn"
                      onClick={() => handleAddToCartClick(product)}
                    >
                      Lägg i varukorg
                    </button>
                  </div>
                ) : (
                  <p className="outofstock-p">Slut i lager</p>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
