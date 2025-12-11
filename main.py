from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/scan")
def scan():
    host = request.args.get("sni")
    net = request.args.get("net")  # Network information
    
    # Example mock data (replace with real logic)
    open_ports = [80, 443]  # Mock open ports
    blocked_ports = [8080]  # Mock blocked ports

    # Returning mock data
    return jsonify({
        "host": host,
        "ssl": "Yes",
        "country": "ZA",  # Mock country (South Africa)
        "server": "Nginx",  # Mock server type
        "networkMatch": net,
        "openPorts": open_ports,
        "blocked": blocked_ports,
        "methods": ["SSL", "Payload", "V2Ray"]  # Example methods
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
