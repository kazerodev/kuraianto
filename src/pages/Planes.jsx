import StripeCheckout from "react-stripe-checkout";

const PLANES = {
  gratis: { precio: 0 },
  avanzado: { precio: 10 },
  premium: { precio: 25 },
};

function Planes() {
  const manejarPago = (token, plan) => {
    alert(`Pago de ${PLANES[plan].precio}€ exitoso.`);
  };

  return (
    <div className="container">
      <h1>Planes de Suscripción</h1>
      {Object.keys(PLANES).map((key) => (
        <div key={key} className="plan">
          <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
          <p>Precio: {PLANES[key].precio}€</p>
          <StripeCheckout stripeKey="TU_CLAVE_PUBLICA_STRIPE" token={(token) => manejarPago(token, key)} amount={PLANES[key].precio * 100} currency="EUR">
            <button>Elegir</button>
          </StripeCheckout>
        </div>
      ))}
    </div>
  );
}

export default Planes;
