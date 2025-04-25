from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host="localhost",        
    user="root",             
    password="",            
    database="restaurant"    
)

cursor = db.cursor()

@app.route('/reserve', methods=['POST'])
def reserve():
    data = request.get_json()
    username = data.get('username')
    start_date = data.get('start_date')
    start_time = data.get('start_time')
    end_date = data.get('end_date')
    end_time = data.get('end_time')

    start_datetime = f"{start_date} {start_time}"
    end_datetime = f"{end_date} {end_time}"

    sql = """
        INSERT INTO Reservations (Username, StartDateTime, EndDateTime)
        VALUES (%s, %s, %s)
    """
    values = (username, start_datetime, end_datetime)
    cursor.execute(sql, values)
    db.commit()

    return jsonify({'message': 'Reservation saved successfully'})

if __name__ == '__main__':
    app.run(debug=True)
