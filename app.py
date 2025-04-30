from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import base64
from io import BytesIO
from PIL import Image
import io

app = Flask(__name__)
CORS(app)
app.secret_key = 'secretKey123'

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

    cur = conn.cursor()
    cur.execute("SELECT UserID FROM Users WHERE Email = %s AND Password = %s", (email, password))
    row = cur.fetchone()
    cur.close()

    if row:
        user_id = row[0]
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user_id": user_id
        })
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

# -------------------- SIGN UP --------------------
@app.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email')
    password = request.form.get('password')

    # Check if the email is already in use
    cur = conn.cursor()
    cur.execute("SELECT * FROM Users WHERE Email = %s", (email,))
    existing_user = cur.fetchone()

    if existing_user:
        cur.close()
        return jsonify({"status": "fail", "message": "Email already in use"}), 409

    # Insert the new user into the Users table
    try:
        cur.execute("INSERT INTO Users (Email, Password) VALUES (%s, %s)", (email, password))
        conn.commit()
        cur.close()
        return jsonify({"status": "success", "message": "User registered successfully"}), 201

    except Exception as e:
        cur.close()
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500
    
# ---- GET PROFILE ----

@app.route('/get_profile', methods=['GET'])
def get_profile():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400

    cursor = conn.cursor()
    cursor.execute("SELECT Email FROM Users WHERE UserID = %s", (user_id,))
    row = cursor.fetchone()

    if row:
        return jsonify({'status': 'success', 'profile': {'email': row[0]}})
    else:
        return jsonify({'status': 'error', 'message': 'User not found'})
    
# ---- UPDATE PROFILE ----
# @app.route('/update_profile', methods=['POST'])
# def update_profile():
#     user_id      = request.form.get('user_id')
#     old_password = request.form.get('oldPassword')
#     new_password = request.form.get('newPassword')

#     cursor = conn.cursor()
#     cursor.execute("SELECT Password FROM Users WHERE UserID = %s", (user_id,))
#     row = cursor.fetchone()

#     if not row:
#         return jsonify({'status': 'error', 'message': 'User not found'})

#     if row[0] != old_password:
#         return jsonify({'status': 'error', 'message': 'Incorrect current password'})

#     cursor.execute("UPDATE Users SET Password = %s WHERE UserID = %s", (new_password, user_id))
#     conn.commit()

#     return jsonify({'status': 'success'})

# -------------------- delete menu --------------------
@app.route('/delete_menu_item', methods=['POST'])
def delete_menu_item():
    data = request.get_json()
    name = data.get('name')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM menu WHERE name = ?", (name,))
    item = cur.fetchone()

    if item:
        cur.execute("DELETE FROM menu WHERE name = ?", (name,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Item '{name}' deleted."})
    else:
        conn.close()
        return jsonify({"status": "error", "message": f"Item '{name}' not found."}), 404

#-----------------------delete table-------------------------
@app.route('/delete_table', methods=['POST'])
def delete_table():
    data = request.get_json()
    table_id = data.get('table_id')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tables WHERE id = ?", (table_id,))
    table = cur.fetchone()

    if table:
        cur.execute("DELETE FROM tables WHERE id = ?", (table_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Table {table_id} deleted."})
    else:
        conn.close()
        return jsonify({"status": "error", "message": f"Table {table_id} not found."}), 404

#-------------------------------Edit Price--------------------------
@app.route('/update_price', methods=['POST'])
def update_price():
    data = request.get_json()
    name = data.get('name')
    new_price = data.get('price')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM menu WHERE name = ?", (name,))
    item = cur.fetchone()

    if item:
        cur.execute("UPDATE menu SET price = ? WHERE name = ?", (new_price, name))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Price of '{name}' updated to {new_price}."})
    else:
        conn.close()
        return jsonify({"status": "error", "message": f"Item '{name}' not found."}), 404

#-----------------------MAIN-------------------------
if __name__ == '__main__':
    app.run(debug=True)
