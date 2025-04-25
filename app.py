from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import base64

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
@app.route('/add_menu_item', methods=['POST'])
def add_menu_item():
    try:
        # Extract data from the request
        item_name = request.form.get('ItemName')
        price = request.form.get('Price')
        image_data = request.form.get('Image')  # Assuming the image is sent as base64 encoded string
        
        # Convert image data from base64 to bytes
        if image_data:
            image_data = base64.b64decode(image_data)

        # Insert into the Menu table
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO Menu (ItemName, Price, Image) VALUES (%s, %s, %s)",
            (item_name, price, image_data)
        )
        conn.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Menu item added successfully"})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

@app.route('/add_table', methods=['POST'])
def add_table():
    try:
        # Extract data from the request
        location = request.form.get('Location')
        number_of_seats = request.form.get('NumberOfSeats')
        status = request.form.get('Status', 'Available')  # Default to 'Available' if not provided
        image_data = request.form.get('Image')  # Assuming the image is sent as base64 encoded string
        
        # Convert image data from base64 to bytes
        if image_data:
            image_data = base64.b64decode(image_data)

        # Insert into the Tables table
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO Tables (Location, Image, NumberOfSeats, Status) VALUES (%s, %s, %s, %s)",
            (location, image_data, number_of_seats, status)
        )
        conn.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Table added successfully"})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
