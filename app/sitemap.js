export default function sitemap() {
  const baseUrl = "https://tonaura.com";
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/compare", priority: 0.7, changeFrequency: "monthly" },
    { path: "/support", priority: 0.8, changeFrequency: "monthly" },
    { path: "/status", priority: 0.6, changeFrequency: "daily" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/billing", priority: 0.4, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
    { path: "/acceptable-use", priority: 0.3, changeFrequency: "yearly" },
    { path: "/wellness-disclaimer", priority: 0.3, changeFrequency: "yearly" },
    { path: "/dpa", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}