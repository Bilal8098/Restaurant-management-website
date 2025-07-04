from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import base64
import smtplib
import os
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
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
        image_data = request.form.get('Image')

        if image_data:
            image_data = base64.b64decode(image_data)

        cur = conn.cursor()
        cur.execute(
            "INSERT INTO Tables (Location, Image, NumberOfSeats) VALUES (%s, %s, %s)",
            (location, image_data, number_of_seats)
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
        cur.execute("SELECT TableID, Location, Image, NumberOfSeats FROM Tables")
        rows = cur.fetchall()
        cur.close()

        tables = []
        for row in rows:
            tables.append({
                "TableID": row[0],
                "Location": row[1],
                "Image": base64.b64encode(row[2]).decode('utf-8') if row[2] else None,
                "NumberOfSeats": row[3],
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

@app.route('/update_price', methods=['POST', 'OPTIONS'])
def update_price():
    if request.method == 'OPTIONS':
        return '', 200  # Preflight request for CORS

    try:
        data = request.get_json()
        item_id = data.get('ItemID')
        new_price = data.get('Price')

        if item_id is None or new_price is None:
            return jsonify({"status": "fail", "message": "ItemID and Price are required"}), 400

        cur = conn.cursor()
        cur.execute("UPDATE Menu SET Price = %s WHERE ItemID = %s", (new_price, item_id))
        conn.commit()
        cur.close()

        return jsonify({"status": "success", "message": f"Price updated for ItemID {item_id}"}), 200

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

@app.route('/delete_menu_item', methods=['POST'])
def delete_menu_item():
    try:
        data = request.get_json()
        item_id = data.get("id")

        if item_id is None:
            return jsonify({"status": "fail", "message": "Missing item ID"}), 400

        cur = conn.cursor()
        cur.execute("DELETE FROM Menu WHERE ItemID = %s", (item_id,))
        conn.commit()
        cur.close()

        return jsonify({"status": "success", "message": f"Item #{item_id} deleted successfully"})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500


@app.route('/delete_table', methods=['POST'])
def delete_table():
    try:
        data = request.get_json()
        table_id = data.get("table_id")

        if table_id is None:
            return jsonify({"status": "fail", "message": "Missing table ID"}), 400

        cur = conn.cursor()
        cur.execute("DELETE FROM Tables WHERE TableID = %s", (table_id,))
        conn.commit()
        cur.close()

        return jsonify({"status": "success", "message": f"Table #{table_id} deleted successfully"})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

# -------------------- GET FEEDBACKS --------------------
@app.route('/get_feedbacks', methods=['GET'])
def get_feedbacks():
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT f.FeedbackID, u.Email, f.Feedback 
            FROM Feedbacks f
            JOIN Users u ON f.UserID = u.UserID
            ORDER BY f.FeedbackID DESC
        """)
        rows = cur.fetchall()
        cur.close()

        feedbacks = []
        for row in rows:
            feedbacks.append({
                "FeedbackID": row[0],
                "UserEmail": row[1],  # Show user email instead of ID
                "feedback": row[2],
            })

        return jsonify({"status": "success", "feedbacks": feedbacks})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500
        
# -------------------- ADD FEEDBACK --------------------
@app.route('/add_feedback', methods=['POST'])
def add_feedback():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        feedback_text = data.get('feedback')

        if not user_id or not feedback_text:
            return jsonify({"status": "fail", "message": "Missing user_id or feedback"}), 400

        cur = conn.cursor()
        cur.execute(
            "INSERT INTO Feedbacks (UserID, Feedback) VALUES (%s, %s)",
            (user_id, feedback_text)
        )
        conn.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Feedback added successfully"})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

@app.route('/get_reservations', methods=['GET'])
def get_reservations():
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM Reservations")
        rows = cur.fetchall()

        reservations = []
        for row in rows:
            reservation = {
                "reservation_id": row[0],
                "user_id": row[1],
                "table_id": row[2],
                "start_date": row[3],
                "end_date": row[4],
                "status": row[5],
                "phone_number": row[6],
                "name": row[7]
            }
            reservations.append(reservation)

        cur.close()
        return jsonify({"status": "success", "reservations": reservations})

    except Exception as e:
        return jsonify({"status": "fail", "message": f"Error: {str(e)}"}), 500

#---------------------Email sender-------------------------
# def send_confirmation_email(to_email, name, start_datetime, end_datetime):
    from_email = "reddivel8098@gmail.com"
    from_password = "hvcr dnym pfff olzs"

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = 'Reservation Confirmation'

    # HTML email body with styling
    body = f"""
    <html>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F8F9FA;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FF5E00, #FF8C42); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Reservation Confirmed!</h1>
          </div>

          <!-- Content -->
          <div style="background: #FFFFFF; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
            <p style="color: #2A2A2A; font-size: 16px;">Hello {name},</p>
            <p style="color: #2A2A2A; font-size: 16px;">Your reservation has been successfully made. Details below:</p>

            <div style="margin: 25px 0; padding: 20px; background-color: #F8F9FA; border-radius: 8px;">
              <p style="color: #2A2A2A; margin: 10px 0; font-size: 15px;">
                <span style="color: #FF3D00; font-weight: bold;">📅</span> Start: {start_datetime}
              </p>
              <p style="color: #2A2A2A; margin: 10px 0; font-size: 15px;">
                <span style="color: #FF3D00; font-weight: bold;">📅</span> End: {end_datetime}
              </p>
              <p style="color: #2A2A2A; margin: 10px 0; font-size: 15px;">
              </p>
            </div>

            <p style="color: #2A2A2A; font-size: 16px; margin-top: 25px;">
              Thank you for choosing our reservation service.<br>
              We look forward to serving you!
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #2A2A2A; font-size: 12px;">
            <p>This is an automated message - please do not reply directly</p>
          </div>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(body, 'html'))  # Changed to HTML

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, from_password)
        server.send_message(msg)
        server.quit()
        print(f"Email is successfully sent!! to: {to_email}")
    except Exception as e:
        print("Failed to send email:", str(e))

@app.route('/reserve', methods=['POST'])
def reserve():
    data = request.get_json()

    # required fields
    user_id      = data.get('user_id')          # integer
    table_id     = data.get('table_id')         # integer
    name         = data.get('name')             # string
    phone_number = data.get('phone_number')     # string
    start_date   = data.get('start_date')       # 'YYYY-MM-DD'
    start_time   = data.get('start_time')       # 'HH:MM:SS'
    end_date     = data.get('end_date')         
    end_time     = data.get('end_time')

    # validate presence
    if not all([user_id, table_id, name, phone_number, start_date, start_time, end_date, end_time]):
        return jsonify({
            'status': 'fail',
            'message': 'Missing one or more required fields: user_id, table_id, name, phone_number, start_date, start_time, end_date, end_time'
        }), 400

    # build timestamps
    start_datetime = f"{start_date} {start_time}"
    end_datetime   = f"{end_date} {end_time}"

    try:
        cur = conn.cursor()
        email_query = "SELECT Email FROM Users WHERE UserID = %s"
        cur.execute(email_query, (user_id,))
        result = cur.fetchone()
        if not result:
            return jsonify({
                'status': 'fail',
                'message': 'User not found'
            }), 404
        email = result[0]
        # check for overlap
        check_sql = """
            SELECT 1
              FROM Reservations
             WHERE TableID = %s
               AND startDate < %s
               AND endDate   > %s
        """
        cur.execute(check_sql, (table_id, end_datetime, start_datetime))
        if cur.fetchone():
            return jsonify({
                'status': 'fail',
                'message': 'This table is already reserved during that time window'
            }), 409

        # insert full record
        insert_sql = """
            INSERT INTO Reservations
                (UserID, TableID, startDate, endDate, Status, PhoneNumber, Name)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s)
        """
        cur.execute(insert_sql, (
            user_id,
            table_id,
            start_datetime,
            end_datetime,
            'Pending',
            phone_number,
            name
        ))
        conn.commit()
        # send_confirmation_email(email, name, start_datetime, end_datetime)
        return jsonify({
            'status': 'success',
            'message': 'Reservation saved successfully'
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'fail',
            'message': f'Error: {str(e)}'
        }), 500

    finally:
        cur.close()


# -------------------- SIGN UP --------------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

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

# -------------------- MAIN --------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
