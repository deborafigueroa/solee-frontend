function Estrellas({ valor = 0, tamano = 16 }) {
  const llenas = Math.round(valor);
  return (
    <span aria-label={`${valor} de 5`} style={{ color: "#F5A623", fontSize: `${tamano}px`, letterSpacing: "1px" }}>
      {"★".repeat(llenas)}
      {"☆".repeat(5 - llenas)}
    </span>
  );
}

export default Estrellas;