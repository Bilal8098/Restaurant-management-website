from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

# Connect to your database here
conn = psycopg2.connect(
    host="interchange.proxy.rlwy.net",
    database="railway",
    user="postgres",
    password="mGLMhpgyrouhikikiHhstQDovnCdCted",
    port=43470
)

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    print("Received login:", email, password)  # This should show

    cur = conn.cursor()
    cur.execute("SELECT * FROM Users WHERE Email = %s AND Password = %s", (email, password))
    user = cur.fetchone()
    cur.close()

    if user:
        return jsonify({"status": "success", "message": "Login successful"})
    else:
        return jsonify({"status": "fail", "message": "Invalid email or password"}), 401

if __name__ == '__main__':
    app.run(debug=True)
