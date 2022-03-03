from django.shortcuts import redirect
from flask import Flask,render_template,request
from mysql.connector import connect,Error
from getpass import getpass

# set up connection with mysql
try:
    with connect(
        host = "localhost",
        user = input("Enter username: "),
        password = getpass("Enter password: "),
    ) as connection:
        print("connection")
except Error as e:
        print(e)

# set up for routing
app = Flask(__name__)

@app.route("/login",methods=['POST'])
def login():
    username = request.form.get("username");
    password = request.form.get("password")
    print(username=="you",password)
    if username == "you":
        return render_template("login.html")
    return redirect(to="/home",permanent=True,)

@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/")
def index():
   return render_template("login.html")