from flask import Flask, make_response,render_template,request,redirect,session,jsonify
# from flask_restful import Api, Resource, reqparse
from requests.auth import HTTPBasicAuth
from MySQLdb._exceptions import Error
from flask_session import Session
from flask_mysqldb import MySQL
# from twilio.rest import Client
from datetime import datetime
from hashlib import sha512
import MySQLdb.cursors
import requests
import base64
import json
import re
import function
import os

# TODO implement mpesa api and twilio api
app = Flask(__name__)

# app.secret_key= 'treyulwito'

# db connection details
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "Treyul@18"
app.config["MYSQL_DB"] = "water_billing"
# app.config["MYSQL_HOST"] = "us-cdbr-east-05.cleardb.net"
# app.config["MYSQL_USER"] = "bef134615a5bbe"
# app.config["MYSQL_PASSWORD"] = "70b6c7f2"
# app.config["MYSQL_DB"] = "heroku_ba6afcca4de000d"
mysql = MySQL(app)

# configure the session    
app.config['SESSION_PERMANENT']= False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# 
# app.config["API_ENVIRONMENT"] = "sandbox" #sandbox or live
# app.config["APP_KEY"] = "h4P5d59ezEgGqWeZ0yKcHyJG8zARd6M5" # App_key from developers portal
# app.config["APP_SECRET"] = "CZAcHUB9Bk9REXTg" #App_Secret from developers portal
# mpesa_api=MpesaAPI()

# api = Api(app)

# get time details that is month and year
MONTHS = ["Jan","Feb","Mar","Apr","May","June","Jul","Aug","Sept","Oct","Nov","Dec"]
month_data = int(datetime.now().strftime("%m"))
accounts = ""
# set up for routing
seconds = datetime.now().strftime("%S")
while(seconds == 24):
    print("it works")
print(seconds)


@app.route("/")
def index():
    # check if user is logged in
    if not session.get('logged_in'):
        return redirect('/login')
    # if user is logged render home page
    return render_template("index.html",name=session['name'])

@app.route("/login",methods=["POST","GET"])
def login():
    global accounts
    db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    if request.method == 'POST':

        # TODO status connected or disconnected
        # db.execute("SELECT account,priviledges FROM  ")
        # use count and sum to fetch data
        # for payments sort data into 
        '''
        1)user who have paid more than 50%
        2)user who have fully paid their bill 
        3)users who have paid less than 50% 
        4)users who have made no attempt of payments -- get list
        5)users with arrears more than 5000 -- get list
        6)users with arrears more than 10000 -- get list

        *****lists
        list includes account,name phone number, amount 
        '''
        # get loggin data from client
        login_data = request.get_json()
        username = login_data["0"]
        password = sha512(login_data["1"].encode()).hexdigest()
        details = (username,password)

        # validate loggin credentials
        db.execute("SELECT account FROM loggins WHERE username = %s AND password = %s;",details)
        acc = db.fetchone()
        if not acc:
            return make_response(jsonify({"message":"Null"}),200)
        else:
            # create session variables for logging in
            year = datetime.now().strftime("%Y")
            accounts = acc["account"] 
            session["logged_in"] = True
            session["name"] = username
            details = (acc["account"],)

            # create variable to be used
            CURRENT_MONTH = f"{MONTHS[month_data-1]}-{year}"
            PREVIOUS_MONTH = f"{MONTHS[month_data-2]}-{year}"


            # GET priviledge of user
            db.execute("SELECT priviledges FROM user WHERE account_number = %s",details)
            user_priviledge = db.fetchone()["priviledges"]
            print(user_priviledge)

            # if priviledge is user
            if user_priviledge =="user":
                 
                #  get status of connection
                db.execute("SELECT status FROM user WHERE account_number = %s",details)
                user_status = db.fetchone()["status"]
                print(user_status)

                # if user status is connected
                if user_status == "connected":
                    print("conn")
                # if user status is disconnected
                elif user_status == "disconected":
                    print("disco")

            # if priviledge is admin
            elif user_priviledge == "admin":
                
                # fetch current and previous readings and users
                db.execute(f"select sum(`5-{PREVIOUS_MONTH}`),sum(`5-{CURRENT_MONTH}`),count(`5-{CURRENT_MONTH}`),count(`5-{PREVIOUS_MONTH}`) from readings;")
                DATA = list(db.fetchall())

                current_total = DATA[0][f"sum(`5-{CURRENT_MONTH}`)"]
                previous_total =DATA[0][f"sum(`5-{PREVIOUS_MONTH}`)"]
                current_users=DATA[0][f"count(`5-{CURRENT_MONTH}`)"]
                previous_users = DATA[0][f"count(`5-{PREVIOUS_MONTH}`)"]

                # fetch summation of payments for the current and previous month
                payments_sum = []
                for i in range(2):
                    db.execute(f"SELECT `{MONTHS[month_data-1-i]}-{year}` FROM payments ")
                    payment = db.fetchall()
                    payments_sum.append(function.paymentsummation(list(payment)))


                # TODO get amount of debt paid

                #  ******* fetch user payment stats *******
                """
                *****Stats are for the current and previous month
                user stats arranged in fully paid, >50% ,<50%, no attempt
                """
                user_stats = [[0,0,0,0],[0,0,0,0]]
                bill_5 = []
                bill_10 = []
                bill_attempt =[]
                # fetch users account numbers 
                db.execute("SELECT account_number FROM user WHERE priviledges = 'user';")
                user_accounts = list(db.fetchall())

                # get data for each user
                for element in user_accounts:

                    # get account number of user
                    for acc_no in element.values():
                        details = (acc_no,acc_no,acc_no)
                        
                        # get consumption,balance,payment
                        for i in range(2):
                            user_data = []
                            db.execute(f"SELECT sum(`5-{MONTHS[month_data-1-i]}-{year}` - `5-{MONTHS[month_data-2-i]}-{year}`)*130+50,balance.`{MONTHS[month_data-1-i]}-{year}`,payments.`{MONTHS[month_data-1-i]}-{year}` FROM readings join balance,payments where balance.accounts = %s and account = %s and payments.accounts = %s;",details)
                            data = list(db.fetchall())
                            for userdt in data:
                                for value in userdt.values():
                                    user_data.append(value)
                            
                            # get amount of money paid in the month
                            print(user_data)
                            if user_data[2] != None:
                                user_data[2] = function.amount(user_data[2])
                            elif user_data[2] == None:
                                user_data[2] = 0

                            # update user stats
                            consumed = user_data[0]
                            balance = user_data[1]
                            paid = user_data[2]
                            print(consumed,balance,paid)

                            # if user fully paid bill
                            if consumed+balance-paid <= 0:
                                user_stats[i][0] = user_stats[i][0] + 1

                            # no attempt on payment
                            elif consumed+balance > 0 and paid == 0:
                                user_stats[i][3] = user_stats[i][3] + 1

                            else:
                                # get percentage of bill paid
                                arrears = balance - paid + consumed
                                percentage = (arrears/consumed)*100
                                print(percentage)

                                # percentage is > 50%
                                if percentage < 50:
                                    user_stats[i][1] = user_stats[i][1] + 1

                                # percentage is < 50%
                                elif percentage > 50:
                                    user_stats[i][2] = user_stats[i][2] + 1

                print(user_stats,current_total,previous_total)

                """
                fetch current bill
                1)get list of users
                2)fetch balance,
                return in array format
                fetch amount paid
                """
                return redirect("/adm")

            # fetch readings
            db.execute(f"SELECT `5-{CURRENT_MONTH}`,`5-{PREVIOUS_MONTH}` FROM readings WHERE  account = %s;",details)
            readings = list(db.fetchall())
            # enable dynamic fetching of data

            currentReading = readings[0][f"5-{CURRENT_MONTH}"]
            previousReading = readings[0][f"5-{PREVIOUS_MONTH}"]

            # add payments to the array
            last_payments = []
            # TODO catch error if column does not exist
            try:
                minus = 1
                while len(last_payments) < 3:
                    db.execute(f"SELECT `{MONTHS[month_data-minus]}-{year}` FROM payments WHERE `{MONTHS[month_data-minus]}-{year}` IS NOT NULL AND accounts = %s",details)
                    payments = list(db.fetchall())

                    print(f"{MONTHS[month_data-minus]}-{year}")
                    print(minus)
                    print(payments)
                    print(len(payments))
                    print(len(last_payments))
                    if len(payments) > 0:
                        paymentOne = payments[0][f"{MONTHS[month_data-minus]}-{year}"]
                        print(paymentOne)
                        for el in re.split('{|}',paymentOne):
                            if len(el) > 0:
                                for desc in re.split(';',el):
                                    if len(last_payments) < 3:
                                        last_payments.append(desc)
                                        print(f"This {last_payments}")
                    minus = minus + 1
            except Error:
                last_payments.append("NULL")
                minus = minus + 1
              
            
            print(last_payments)
                
            # fetch amount paid in the month upto current  date
            db.execute(f"SELECT `{CURRENT_MONTH}` FROM payments WHERE `{CURRENT_MONTH}` IS NOT NULL AND accounts = %s",details)
            payments = list(db.fetchall())
            if len(payments) > 0:
                paymentOne = payments[0][f"{CURRENT_MONTH}"]
            else:
                paymentOne = 0
             
            # fetch balance 
            db.execute(f"SELECT `{PREVIOUS_MONTH}` FROM balance WHERE accounts = %s", details)
            balance = db.fetchone()
            bal = balance[f"{PREVIOUS_MONTH}"]
            print(bal)

            # return response
            return make_response(jsonify({"message":"success","previousreading":f"{previousReading}","currentreading":f"{currentReading}","balance":f"{bal}","payment1":f"{paymentOne}","pay":f"{last_payments}"}),200)

    return  render_template('login.html')



phone = 0 
account = ""
# TODO before redirect delete user from users list
@app.route('/signin',methods=["POST","GET"])
def signin():
    db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    # TODO  check credentials validity and intercept mysql errors
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


# TODO catch date range error on the server side
@app.route("/bills",methods=["POST","GET"])
def bills():
    global accounts
    ResponseMessage = {"message":"success"}
    db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    req = request.get_json()
    year = datetime.now().strftime("%Y")
    details = (accounts,)
    Start_year = req[0]
    Start_month = req[1]
    End_year = req[2]
    End_month = req[3]
    readings = [] 
    if Start_year == End_year :
        ResponseMessage["y"+str(Start_year)] =[]
        ResponseMessage["payments"] = []
        while End_month >= Start_month:
            try:
                db.execute(f"SELECT `5-{MONTHS[Start_month-1]}-{Start_year}` FROM readings WHERE account = %s;",details)
                reading = db.fetchone()
                print(reading,f"5-{MONTHS[Start_month-1]}-{Start_year}")
                read = reading[f"5-{MONTHS[Start_month-1]}-{year}"]
                ResponseMessage["y"+str(Start_year)].append(read)
                print(read) 
                readings.append(read)  

                if MONTHS.index(MONTHS[End_month-1]) >= MONTHS.index(MONTHS[Start_month]):
                    db.execute(f"SELECT `{MONTHS[Start_month]}-{Start_year}` FROM payments WHERE `{MONTHS[Start_month]}-{Start_year}` IS NOT NULL AND accounts = %s",details)
                    payment = list(db.fetchall())
                    print(payment)
                    pay = payment[0][f"{MONTHS[Start_month]}-{Start_year}"]
                    ResponseMessage["payments"].append(pay)
                Start_month=Start_month+1

            except IndexError:
                ResponseMessage["payments"].append("00")
                Start_month = Start_month + 1
                continue

            except Error as e:
                print("Error code: ",e.args)
                print("Error message: ",e.__cause__)
                print("Error: ",e)
                ResponseMessage["payments"].append("00")
                Start_month = Start_month + 1
                continue
    print(ResponseMessage)
    print(req)
    print(readings)
    return make_response(jsonify(ResponseMessage),200)


@app.route("/payment",methods=["POST","GET"])
def payment():
    global accounts
    Response_Message = {"message":"success"}
    db = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    req = request.get_json()
    print(req)
    year = datetime.now().strftime("%Y")
    Start_year = req[0]
    Start_month = req[1]
    End_year = req[2]
    End_month = req[3]
    details = (accounts,)
    Response_Message["payments"] =[]
    try:
        if Start_year == End_year:
            while End_month >= Start_month:
                try:
                    db.execute(f"SELECT `{MONTHS[Start_month-1]}-{Start_year}` FROM payments WHERE `{MONTHS[Start_month-1]}-{Start_year}` IS NOT NULL AND accounts = %s",details)
                    payment = list(db.fetchall())
                    print(payment)
                    if len(payment)<1:
                        Response_Message["payments"].append("00")
                    else:
                        pay = payment[0][f"{MONTHS[Start_month-1]}-{Start_year}"]
                        Response_Message["payments"].append(pay)
                # Response_Message.append(pay)
                    Start_month = Start_month + 1
                except Error:
                    print(Error)
                    Start_month = Start_month + 1  
                    continue
    except Error as e:
        print("Error code: ",e.args)
        print("Error message: ",e)
        print("Error: ",e)
        Response_Message["message"] = "Error"
        return make_response(jsonify(Response_Message),200)
    return make_response(jsonify(Response_Message),200)
   

#get access token to initiate mpesa stk push
def get_mpesa_token():

    # token for my verfication to daraja portal
    key = "h4P5d59ezEgGqWeZ0yKcHyJG8zARd6M5" 
    secret = "CZAcHUB9Bk9REXTg" 

    # api to send tokens to get access token
    api_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    # make a get request using python requests liblary
    r = requests.get(api_URL, auth=HTTPBasicAuth(key,secret))

    # return access_token from response
    return r.json()['access_token']


@app.route("/stkpush",methods=["POST","GET"])
def mpesa_stk_push():
    global accounts
    amount = request.form.get("amount")

    business_number = 174379
     # get access_token
    # access_token = get_mpesa_token()
    access_token = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    # year 
    year = datetime.now().strftime("%Y")
    # month
    mo = datetime.now().strftime("%m")
    #date
    d = datetime.now().strftime("%d")
    # hour
    h = datetime.now().strftime("%H")
    # minutes
    m = datetime.now().strftime("%M")
    # seconds 
    s = datetime.now().strftime("%S")
    # timestamp
    timestamp = f"{year}{mo}{d}{h}{m}{s}"

    # encode data
    encode_data = f"{business_number}{access_token}{timestamp}" 


    # encode business_shortcode, online_passkey and current_time (yyyyMMhhmmss) to base64
    passkey  = base64.b64encode(encode_data.encode())
    print("here")

        # make stk push
    try:

           

            # stk_push request url
            api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

            # put access_token in request headers
            headers = { "Authorization": f"Bearer {get_mpesa_token()}" ,"Content-Type": "application/json" }

            # get phone and amount
            # data = MakeSTKPush.parser.parse_args()

            # define request body
            print("here2")
            req = {
                "BusinessShortCode": business_number,
                "Password": str(passkey)[2:-1],
                "Timestamp": timestamp, # timestamp format: 20190317202903 yyyyMMhhmmss 
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": 254708374149,
                "PartyB": business_number,
                "PhoneNumber": 254708374149,
                "CallBackURL": "http://127.0.0.1:5000/mpesaexp",
                "AccountReference": "CompanyXLTD",
                "TransactionDesc": "Payment of X"
            }

            # print(request) 
            # make request and catch response
            response = requests.post(api_url,json=req,headers=headers)
            print(response)
            print(response.text)
            data = json.loads(response.text)
            print("json data")
            print(data)
            # print(data[CheckoutRequestID])

            # check response code for errors and return response
            if response.status_code > 299:
                return{
                    "success": False,
                    "message":"Sorry, something went wrong please try again later 1."
                },400

            # CheckoutRequestID = response.text['CheckoutRequestID']
            # print(CheckoutRequestID)


            # Do something in your database e.g store the transaction or as an order
            # make sure to store the CheckoutRequestID to identify the tranaction in 
            # your CallBackURL endpoint.

            # return a respone to your user
            return redirect("/")
            # return {
            #     "data": json.loads(response.text)
            # },200

    except:
            # catch error and return respones

            return {
                "success":False,
                "message":"Sorry something went wrong please try again."
            },400



# @app.route("/pay",methods=["POST","GET"])
# def pay():
#         print(f"this is the amount: {amt}")
#         return redirect("/")

# class MakeSTKPush(Resource):

#     # get 'phone' and 'amount' from request body
#     parser = reqparse.RequestParser()
#     parser.add_argument('phone',
#             type=str,
#             required=True,
#             help="This fied is required")

#     parser.add_argument('amount',
#             type=str,
#             required=True,
#             help="this fied is required")

#     # make stkPush method
#     def get(self):

#         """ make and stk push to daraja API"""

#         encode_data = b"<Business_shortcode><online_passkey><current timestamp>" 

#         # encode business_shortcode, online_passkey and current_time (yyyyMMhhmmss) to base64
#         passkey  = base64.b64encode(encode_data)
#         print("here")

#         # make stk push
#         try:

#             # get access_token
#             access_token = get_mpesa_token()

#             # stk_push request url
#             api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

#             # put access_token in request headers
#             headers = { "Authorization": f"Bearer {access_token}" ,"Content-Type": "application/json" }

#             # get phone and amount
#             data = MakeSTKPush.parser.parse_args()

#             # define request body
#             request = {
#                 "BusinessShortCode": "<business_shortCode>",
#                 "Password": str(passkey)[2:-1],
#                 "Timestamp": "<timeStamp>", # timestamp format: 20190317202903 yyyyMMhhmmss 
#                 "TransactionType": "CustomerPayBillOnline",
#                 "Amount": data['amount'],
#                 "PartyA": data['phone'],
#                 "PartyB": "<business_shortCode>",
#                 "PhoneNumber": data['phone'],
#                 "CallBackURL": "<YOUR_CALLBACK_URL>",
#                 "AccountReference": "UNIQUE_REFERENCE",
#                 "TransactionDesc": ""
#             }

#             # print(request)
#             # make request and catch response
#             response = requests.post(api_url,json=request,headers=headers)

#             # check response code for errors and return response
#             if response.status_code > 299:
#                 return{
#                     "response":request,
#                     "success": False,
#                     "message":"Sorry, something went wrong please try again later 1."
#                 },400

#             # CheckoutRequestID = response.text['CheckoutRequestID']

#             # Do something in your database e.g store the transaction or as an order
#             # make sure to store the CheckoutRequestID to identify the tranaction in 
#             # your CallBackURL endpoint.

#             # return a respone to your user
#             return {
#                 "data": json.loads(response.text)
#             },200

#         except:
#             # catch error and return respones

#             return {
#                 "success":False,
#                 "message":"Sorry something went wrong please try again."
#             },400

# # stk push path [POST request to {baseURL}/stkpush]
# api.add_resource(MakeSTKPush,"/stkpush")
@app.route("/adm")
def adm():
    return render_template("admin.html")
if __name__ == '__main__':
    print("run")
    app.run(debug = True)

# url = "/stkpush"
# response = requests.get(url=url, auth=HTTPBasicAuth("254791280942", "50"))
# print(response.text)
