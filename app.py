from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import base64
from io import BytesIO
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Database connection
conn = psycopg2.connect(
    host="interchange.proxy.rlwy.net",
    database="railway",
    user="postgres",
    password="mGLMhpgyrouhikikiHhstQDovnCdCted",
    port=43470
)

# -------------------- LOGIN --------------------
@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    print("Received login:", email, password)

    cur = conn.cursor()
    cur.execute("SELECT * FROM Users WHERE Email = %s AND Password = %s", (email, password))
    user = cur.fetchone()
    cur.close()

    if user:
        return jsonify({"status": "success", "message": "Login successful"})
    else:
        return jsonify({"status": "fail", "message": "Invalid email or password"}), 401

# -------------------- ADD MENU ITEM --------------------
@app.route('/add_menu_item', methods=['POST'])
def add_menu_item():
    try:
        item_name = request.form.get('ItemName')
        price = request.form.get('Price')
        image_data = request.form.get('Image')

        if image_data:
            image_data = base64.b64decode(image_data)

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

# -------------------- ADD TABLE --------------------
@app.route('/add_table', methods=['POST'])
def add_table():
    try:
        location = request.form.get('Location')
        number_of_seats = request.form.get('NumberOfSeats')
        status = request.form.get('Status', 'Available')
        image_data = request.form.get('Image')

        if image_data:
            image_data = base64.b64decode(image_data)

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

# -------------------- GET TABLES --------------------
@app.route('/get_tables', methods=['GET'])
def get_tables():
    try:
        cur = conn.cursor()
        cur.execute("SELECT TableID, Location, Image, NumberOfSeats, Status FROM Tables")
        rows = cur.fetchall()
        cur.close()

        tables = []
        for row in rows:
            tables.append({
                "TableID": row[0],
                "Location": row[1],
                "Image": base64.b64encode(row[2]).decode('utf-8') if row[2] else None,
                "NumberOfSeats": row[3],
                "Status": row[4]
            })

        return jsonify({"status": "success", "tables": tables})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

# -------------------- GET MENU ITEMS --------------------
@app.route('/get_menu_items', methods=['GET'])
def get_menu_items():
    try:
        cur = conn.cursor()
        cur.execute("SELECT ItemID, ItemName, Price, Image FROM Menu")
        rows = cur.fetchall()
        cur.close()

        items = []
        for row in rows:
            items.append({
                "ItemID": row[0],
                "ItemName": row[1],
                "Price": str(row[2]),
                "Image": base64.b64encode(row[3]).decode('utf-8') if row[3] else None
            })

        return jsonify({"status": "success", "menu_items": items})  # ✅ Fixed here

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

# -------------------- GET FEEDBACKS --------------------
@app.route('/get_feedbacks', methods=['GET'])
def get_feedbacks():
    try:
        cur = conn.cursor()
        cur.execute("SELECT UserID, feedback FROM feedbacks")
        rows = cur.fetchall()
        cur.close()

        feedbacks = []
        for row in rows:
            feedbacks.append({
                "UserID": row[0],
                "feedback": row[1],
            })

        return jsonify({"status": "success", "feedbacks": feedbacks})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

# -------------------- ADD FEEDBACKS --------------------
# @app.route('/add_feedback', methods=['POST'])
# def add_feedback():
#     try:
#         location = request.form.get('Location')
#         number_of_seats = request.form.get('NumberOfSeats')
#         status = request.form.get('Status', 'Available')
#         image_data = request.form.get('Image')

#         if image_data:
#             image_data = base64.b64decode(image_data)

#         cur = conn.cursor()
#         cur.execute(
#             "INSERT INTO Tables (Location, Image, NumberOfSeats, Status) VALUES (%s, %s, %s, %s)",
#             (location, image_data, number_of_seats, status)
#         )
#         conn.commit()
#         cur.close()

#         return jsonify({"status": "success", "message": "Table added successfully"})

#     except Exception as e:
#         return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

@app.route('/reserve', methods=['POST'])
def reserve():
    data = request.get_json()
    user_id = data.get('user_id')          # <-- we need user_id (integer)
    table_id = data.get('table_id')         # <-- we need table_id (integer)
    start_date = data.get('start_date')     # expected format: 'YYYY-MM-DD'
    start_time = data.get('start_time')     # expected format: 'HH:MM:SS'
    end_date = data.get('end_date')
    end_time = data.get('end_time')

    start_datetime = f"{start_date} {start_time}"
    end_datetime = f"{end_date} {end_time}"

    try:
        cur = conn.cursor()

        # Check if the table is already reserved in the given time
        check_sql = """
            SELECT * FROM Reservations
            WHERE TableID = %s AND (
                (startDate < %s AND endDate > %s)
            )
        """
        cur.execute(check_sql, (table_id, end_datetime, start_datetime))
        result = cur.fetchone()

        if result:
            cur.close()
            return jsonify({'status': 'fail', 'message': 'This table is already reserved at that time'}), 409

        # Insert the reservation
        insert_sql = """
            INSERT INTO Reservations (UserID, TableID, startDate, endDate, Status)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (user_id, table_id, start_datetime, end_datetime, 'Pending')
        cur.execute(insert_sql, values)
        conn.commit()
        cur.close()

        return jsonify({'status': 'success', 'message': 'Reservation saved successfully'})

    except Exception as e:
        return jsonify({'status': 'fail', 'message': f'Error: {str(e)}'}), 500

# -------------------- MAIN --------------------

if __name__ == '__main__':
    app.run(debug=True)
