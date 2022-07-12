from flask import Flask, make_response,render_template,request,redirect,session,jsonify
from flask_session import Session
from flask_mysqldb import MySQL
from datetime import datetime
from hashlib import sha512
import MySQLdb.cursors
import re

# set up the application
app = Flask(__name__)

# app.secret_key= 'treyulwito'

# db connection details
# app.config["MYSQL_HOST"] = "localhost"
# app.config["MYSQL_USER"] = "root"
# app.config["MYSQL_PASSWORD"] = "Treyul@18"
# app.config["MYSQL_DB"] = "water_billing"
app.config["MYSQL_HOST"] = "us-cdbr-east-05.cleardb.net"
app.config["MYSQL_USER"] = "bef134615a5bbe"
app.config["MYSQL_PASSWORD"] = "70b6c7f2"
app.config["MYSQL_DB"] = "heroku_ba6afcca4de000d"
mysql = MySQL(app)

# configure the session 
app.config['SESSION_PERMANENT']= False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# get time details that is month and year
months = ["Jan","Feb","Mar","Apr","May","June","Jul","Aug","Sept","Oct","Nov","Dec"]
month_data = int(datetime.now().strftime("%m"))
# set up for routing
@app.route("/")
def index():
    # check if user is logged in
    if not session.get('logged_in'):
        return redirect('/login')
    # if user is logged render home page
    return render_template("index.html",name=session['name'])

@app.route("/login",methods=["POST","GET"])
def login():
    db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    if request.method == 'POST':
        print(request.method)
        login_data = request.get_json()
        print(type(login_data))
        print(login_data["0"])
        username = login_data["0"]
        print(login_data["1"],"first ryun")
        password = sha512(login_data["1"].encode()).hexdigest()
        details = (username,password)
        db.execute("SELECT account FROM loggins WHERE username = %s AND password = %s;",details)
        acc = db.fetchone()
        print(acc)
        if not acc:
            return make_response(jsonify({"message":"Null"}),200)
        else:
            session["logged_in"] = True
            session["name"] = username
            details = (acc["account"],)
            db.execute(f"SELECT `5-{months[month_data-2]}`,`5-{months[month_data-3]}` FROM readings WHERE  account = %s;",details)
            readings = list(db.fetchall())
            currentReading = readings[0]["5-June"]
            previousReading = readings[0]["5-May"]
            print(readings[0]["5-June"])
            db.execute(f"SELECT june FROM payments WHERE june IS NOT NULL AND accounts = %s",details)
            payments = list(db.fetchall())
            paymentOne = payments[0]["june"]
            paymentTwo = payments[1]["june"]
            return make_response(jsonify({"message":"success","previousreading":f"{previousReading}","currentreading":f"{currentReading}","payment1":f"{paymentOne}","payment2":f"{paymentTwo}"}),200)

    return  render_template('login.html')




phone = 0
account = ""
@app.route('/signin',methods=["POST","GET"])
def signin():
    db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    if request.method == 'POST':
        req = request.get_json()
        username = req["0"]
        password = req["1"]
        cpassword = req["2"]
        email = req["3"]
        print(req)
        msg = ''
        # TODO create user with the credentials provided if first batch checks out
        # TODO if username already exists
        # TODO verify person details by use of sending short code to number or email provided     
        if not re.match(r'[a-zA-Z0-9]+',username):
            print("username should not contain symbols")
            return
        else:
            # TODO check if username if exists
            # TODO check if credibility of details
            if password == cpassword:
                password = sha512(password.encode()).hexdigest()
            details = (username,password,phone,account,email)
            db.execute("INSERT INTO loggins(username,password,phone_number,account,email) VALUES(%s,%s,%s,%s,%s)",details)
            
            # delete row from user table
            # db.execute("DELETE FROM user  WHERE name = %s and account_number = %s and phone_number = %s",(det))
            # check db if username exists
            db.execute("SELECT * FROM user")
            
            acc = db.fetchall()
            print(acc)
            mysql.connection.commit()
            db.close()
            # if acc:
            #     print(acc)
            # elif not re.match(r'[a-zA-Z0-9]+',username):
            #     msg += "Username should not contain symbols"
            # elif not re.match(r'[^@]+@[^@]+\.[^@]+',email):
            #     msg += "invalid email address" 
            # if password != cpassword:
            #     msg += "passwords do not match"

            return redirect("/login")
    return render_template('signin.html')

@app.route("/trial",methods=["POST","GET"])
def trial():
    # TODO check first batch of bill credentials 
    global phone
    global account 
    req = request.get_json()
    db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    names = req["0"] + " " + req["1"]
    phone = req["2"]
    account = req["3"].upper()
    names.lower()
    det = (names,account,phone)
    db.execute("SELECT * FROM user WHERE name = %s and account_number = %s and phone_number = %s",(det))
    user = db.fetchone()
    print(req)
    print(names.lower(),phone, account.upper())
    if not user:
        return make_response(jsonify({"message":"error"}),200)
    if user:
        return make_response(jsonify({"message":"success"}),200)
    res = make_response(jsonify({"message":"OK"}),200)
    return res
