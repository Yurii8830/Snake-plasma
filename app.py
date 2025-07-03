from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

DB_PATH = 'leaderboard.db'

def init_db():
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''CREATE TABLE scores (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, score INTEGER)''')
        conn.commit()
        conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    username = data.get('username', 'anonymous')
    score = data.get('score', 0)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO scores (username, score) VALUES (?, ?)", (username, score))
    conn.commit()
    conn.close()
    return jsonify(status='ok')

@app.route('/leaderboard')
def leaderboard():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT username, score FROM scores ORDER BY score DESC LIMIT 10")
    scores = c.fetchall()
    conn.close()
    return jsonify(scores)

@app.route('/clear_leaderboard', methods=['POST'])
def clear_leaderboard():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM scores")
    conn.commit()
    conn.close()
    return jsonify(status='cleared')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
