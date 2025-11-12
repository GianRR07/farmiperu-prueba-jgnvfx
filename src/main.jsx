import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <PayPalScriptProvider
        options={{
          "client-id":
            "AWY1ed6AefoMaXemY0ZXPLRYwJUQI8Uns0d8XKQ3mzBvrT4J2na-LvBnSke2rXAf9NWmLeaj5YnPys3q",
          currency: "USD",
        }}
      >
        <App />
      </PayPalScriptProvider>
    </CartProvider>
  </React.StrictMode>
);
