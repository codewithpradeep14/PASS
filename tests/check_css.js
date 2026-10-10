async function check() {
  const res = await fetch("http://localhost:3000");
  const text = await res.text();
  const cssMatches = text.match(/<link[^>]+>/g) || [];
  console.log("Found link tags:", cssMatches);
  const styleMatches = text.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
  console.log("Found style tags count:", styleMatches.length);
  // Check if any css link exists
  for (const link of cssMatches) {
    const hrefMatch = link.match(/href="([^"]+)"/);
    if (hrefMatch && hrefMatch[1].includes(".css")) {
      console.log("Fetching CSS:", hrefMatch[1]);
      const cssRes = await fetch("http://localhost:3000" + hrefMatch[1]);
      const cssText = await cssRes.text();
      console.log("CSS length:", cssText.length, "Sample:", cssText.slice(0, 150));
    }
  }
}
check();
