export default function LedgerPage() {
  const handleClick = () => {
    alert("Ledger button clicked!");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Ledger</h1>
      <p>This is the Ledger page.</p>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}