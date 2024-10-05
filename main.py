from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# SCHEDULE_FILE = 'schedule.json'
# SALES_DATA_FILE = 'sales_data.json'
# INVENTORY_FILE = 'inventory.json'

# def load_schedule():
#     if os.path.exists(SCHEDULE_FILE):
#         with open(SCHEDULE_FILE, 'r') as file:
#             return json.load(file)
#     return {
#         'mon': ['', '', ''],
#         'tue': ['', '', ''],
#         'wed': ['', '', ''],
#         'thu': ['', '', ''],
#         'fri': ['', '', ''],
#         'sat': ['', '', ''],
#         'sun': ['', '', '']
#     }

# @app.route('/api/predictions', methods=['POST'])
# def handle_predictions():
#     data = request.json
#     if not data:
#         return jsonify({'error': 'No data provided'}), 400

#     # # 存储数据到 Cloud Firestore
#     # predictions_ref = db.collection('predictions').add(data)

#     return jsonify({'message': 'Data stored successfully', 'id': predictions_ref.id}), 200

# def save_schedule(schedule):
#     with open(SCHEDULE_FILE, 'w') as file:
#         json.dump(schedule, file)

# def load_sales_data():
#     if os.path.exists(SALES_DATA_FILE):
#         with open(SALES_DATA_FILE, 'r') as file:
#             return json.load(file)
#     return []

# def load_inventory():
#     if os.path.exists(INVENTORY_FILE):
#         with open(INVENTORY_FILE, 'r') as file:
#             return json.load(file)
#     return {'APPLE': 0, 'BANANA': 0, 'TANGERINE': 0}

# def save_inventory(inventory):
#     with open(INVENTORY_FILE, 'w') as file:
#         json.dump(inventory, file)

@app.route('/') #!!
def home():
    return render_template('home.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/buy_system') #!!
def buy_system():
    return render_template('buy_system.html')

@app.route('/check') #!!
def check():
    return render_template('check.html')

@app.route('/success') #!!
def success():
    return render_template('success.html')

@app.route('/inventory') #!!
def inventory():
    return render_template('inventory.html')

# @app.route('/inventory', methods=['GET', 'POST'])
# def inventory():
#     if request.method == 'POST':
#         inventory = {
#             'APPLE': int(request.form['apple']),
#             'BANANA': int(request.form['banana']),
#             'TANGERINE': int(request.form['tangerine'])
#         }
#         save_inventory(inventory)
#     else:
#         inventory = load_inventory()

#     sales_data = load_sales_data()
#     fruit_sales = {'APPLE': 0, 'BANANA': 0, 'TANGERINE': 0}
#     for entry in sales_data:
#         for fruit in fruit_sales.keys():
#             if fruit in entry:
#                 fruit_sales[fruit] += entry[fruit]

#     remaining_inventory = {fruit: inventory[fruit] - fruit_sales[fruit] for fruit in inventory}

#     return render_template('inventory.html', inventory=inventory, fruit_sales=fruit_sales, remaining_inventory=remaining_inventory)

@app.route('/sales') #!!
def sales():
    return render_template('sales.html')

# @app.route('/sales')
# def sales():
#     sales_data = load_sales_data()
#     fruit_sales = {'蘋果': 0, '香蕉': 0, '橘子': 0}
#     for entry in sales_data:
#         fruit_sales['蘋果'] += entry.get('APPLE', 0)
#         fruit_sales['香蕉'] += entry.get('BANANA', 0)
#         fruit_sales['橘子'] += entry.get('TANGERINE', 0)
#     return render_template('sales.html', fruit_sales=fruit_sales)

@app.route('/peak') #!!
def peak():
    return render_template('peak.html')

# @app.route('/peak_data')
# def peak_data():
#     sales_data = load_sales_data()
#     hourly_orders = [0] * 24
#     for entry in sales_data:
#         hour = int(entry['TIME'].split(':')[0])
#         hourly_orders[hour] += 1
#     return jsonify(hourly_orders)

@app.route('/revenue')
def revenue():
    return render_template('revenue.html')

# @app.route('/revenue')
# def revenue():
#     sales_data = load_sales_data()
#     total_revenue = sum(entry['MONEY'] for entry in sales_data)
#     return render_template('revenue.html', total_revenue=total_revenue)

# @app.route('/schedule')
# def schedule():
#     schedule_data = load_schedule()
#     return render_template('schedule.html', schedule=schedule_data)

# @app.route('/save_schedule', methods=['POST'])
# def save_schedule_route():
#     schedule = request.json
#     save_schedule(schedule)
#     return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
