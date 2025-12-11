export default {
  async fetch(request) {
    try {
      const { sni, ports } = await request.json();

      // Base return structure
      let result = {
        target: sni,
        country: "Unknown",
        ip: null,
        https: null,
        http: null,
        ssl: null,
        headers: null,
        ports: {}
      };

      // 🌍 DNS resolve to IP
      const dns = await fetch(`https://cloudflare-dns.com/dns-query?name=${sni}&type=A`, {
        headers: { "Accept": "application/dns-json" }
      });
      const dnsData = await dns.json();
      const ip = dnsData.Answer ? dnsData.Answer[0].data : null;
      result.ip = ip;

      // 🌍 Country (Cloudflare edge detection)
      result.country = request.cf?.country || "Unknown";

      // 🔐 HTTPS CHECK
      try {
        const httpsRes = await fetch(`https://${sni}`, { method: "GET" });
        result.https = httpsRes.status;
        result.headers = Object.fromEntries(httpsRes.headers.entries());
      } catch {
        result.https = "Failed";
      }

      // 🌐 HTTP CHECK
      try {
        const httpRes = await fetch(`http://${sni}`, { method: "GET" });
        result.http = httpRes.status;
      } catch {
        result.http = "Failed";
      }

      // 🔎 SSL Certificate info (Cloudflare exposes handshake metadata)
      if (request.cf) {
        result.ssl = {
          tlsVersion: request.cf.tlsVersion,
          cipher: request.cf.cipher || null
        };
      }

      // 🔥 Port scanning (simulated because Workers can't raw TCP)
      for (const p of ports) {
        try {
          const test = await fetch(`http://${ip}:${p}`, { method: "GET", redirect: "manual" });
          result.ports[p] = `Open (HTTP:${test.status})`;
        } catch {
          result.ports[p] = "Closed";
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.toString() }), {
        headers: { "Content-Type": "application/json" }
      });
    }
  }
}
