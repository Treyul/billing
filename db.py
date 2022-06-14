from app import app
from flask_mysqldb import MySQL


app.config["MYSQL_DATABASE_USER"] = "bef134615a5bbe"
app.config["MYSQL_DATABASE_PASSWORD"] = "70b6c7f2"
app.config["MYSQL_DATABASE_DB"] = "heroku_ba6afcca4de000d"
app.config["MYSQL_DATABASE_HOST"] = "us-cdbr-east-05.cleardb.net"
mysql = MySQL()
mysql.init_app(app)