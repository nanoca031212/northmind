export function ProductHighlightsCard() {
  const highlights = [
    "Premium Craftsmanship",
    "Timeless British Aesthetic",
    "Exceptional Fit & Comfort",
    "Versatile Styling",
  ];

  return (
    <div className="bg-card/50 border border-white/5 p-6 space-y-4 mb-8 light:bg-black/[0.03] light:border-black/5">
      {highlights.map((item, index) => (
        <div key={index} className="flex items-center gap-4 group">
          <span className="text-[11px] uppercase font-black tracking-widest text-white group-hover:text-white transition-colors duration-300 light:text-black">
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}
