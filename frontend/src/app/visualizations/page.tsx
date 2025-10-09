export default function Visualizations() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#000000] via-[#080645] to-[#260c2c]">
      <h2 className="text-3xl font-bold mb-8 text-[#a259e6]">Visualizations</h2>
      <div
        className="rounded-2xl shadow-lg border-4 border-[#a259e6] bg-[#23283a]/80 p-6"
        style={{ boxShadow: "0 8px 32px 0 rgba(162, 89, 230, 0.25)" }}
      >
        <iframe
          width="900"
          height="600"
          src="https://lookerstudio.google.com/embed/reporting/94a32404-94cf-4ad7-9323-60baa3e9b8e7/page/GAcaF"
          frameBorder="0"
          style={{ border: 0, borderRadius: "1rem", background: "#23283a" }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
    </div>
  );
}