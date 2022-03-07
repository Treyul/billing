from flask import Flask, make_response,render_template,request,redirect,session,jsonify
from flask_session import Session
from flask_mysqldb import MySQL
from flask_restful import Resource,Api
from hashlib import sha512
import MySQLdb.cursors
import twilio
import re

# set up the application
app = Flask(__name__)

app.secret_key= 'treyulwito'

#db connection details
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "Treyul@18"
app.config["MYSQL_DB"] = "water_billing"

mysql = MySQL(app)

# configure the session 
app.config['SESSION_PERMANENT']= False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# initialize api 
api = Api(app)

# create api 
# class user(Resource):
#     def post(self,name):
#         return
# set up for routing
@app.route("/")
def index():
    # check if user is logged in
    if not session.get('logged_in'):
        return redirect('/login')
    # if user is not logged in redirect
    return render_template("index.html")

@app.route("/login",methods=['POST','GET'])
def login():
    if request.method == "POST":
        #get details submitted
        name = request.form.get("username")
        password = sha512(request.form.get("password").encode()).hexdigest()
        db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        details= (name,password)
        db.execute('SELECT * FROM loggins WHERE username = %s AND password = %s;',details)
        acc = db.fetchone()
    # # TODO if user does not exist
    # # TODO wrong password
        if not acc:
            print('user does not exist')
    # # TODO if password and username match
        else:
            session['logged_in'] = True
            return render_template("index.html",name = name)
    return render_template('login.html')


@app.route('/signin',methods=["POST","GET"])
def signin():
    if request.method == 'GET'and request.args.get("fname") != None:
        print("this")
        db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        names = request.args.get("fname") + " " + request.args.get("lname")
        phone = request.args.get("phone")
        account = request.args.get("account").upper()
        det = (names,account,phone) 
        print(names.lower())
        # TODO check if details match
        db.execute("SELECT * FROM user WHERE name = %s and account_number = %s and phone_number = %s",(det))
        user = db.fetchone()
        # TODO check if user exists   
        print(user)

    elif request.method == 'POST':
        msg = ''
        # TODO check first batch of bill credentials 
        # TODO create user with the credentials provided if first batch checks out
        # TODO if username already exists
        if not user:
            print("user does not exist or already has an account")
        else:    
            if not re.match(r'[a-zA-Z0-9]+',username):
                print("username should not contain symbols")
                return
            else:
                print("ture")
            # TODO check if username if exists

            # TODO check if credibility of details
            username = request.form.get("username")
            password = request.form.get("password")
            cpassword = request.form.get("cpassword")
            if password == cpassword:
                password = sha512(password.encode()).hexdigest()
            email = request.form.get("email")
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
        return make_response(jsonify({"message":"user doesn't exist"}),200)
    if user:
        return make_response(jsonify({"message":"user exists"}),200)
    res = make_response(jsonify({"message":"OK"}),200)
    return res
