import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const CRM = () => {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const obtenerClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClientes(clientesData);
    };
    obtenerClientes();
  }, []);

  const agregarCliente = async () => {
    if (!nombre || !email) return;
    const nuevoCliente = { nombre, email, etiquetas: etiquetas.split(",") };
    await addDoc(collection(db, "clientes"), nuevoCliente);
    setClientes([...clientes, nuevoCliente]);
    setNombre("");
    setEmail("");
    setEtiquetas("");
  };

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.etiquetas.some((etiqueta) => etiqueta.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="p-4">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>CRM | Kuraianto</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">CRM - Gestión de Clientes</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o etiqueta"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Etiquetas (separadas por coma)"
          value={etiquetas}
          onChange={(e) => setEtiquetas(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={agregarCliente} className="bg-blue-500 text-white p-2 rounded">Añadir</button>
      </div>
      <ul>
        {clientesFiltrados.map((cliente) => (
          <li key={cliente.id} className="border p-2 mb-2 rounded">
            <p><strong>Nombre:</strong> {cliente.nombre}</p>
            <p><strong>Email:</strong> {cliente.email}</p>
            <p><strong>Etiquetas:</strong> {cliente.etiquetas.join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CRM;
