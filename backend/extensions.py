from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt  # type: ignore
import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

def timediff(time):
    diff = datetime.datetime.now() - time
    if (diff.days > 0):
        if diff.days == 1:
            return str(diff.days) + " days ago"
        return str(diff.days) + " day ago"
    elif (diff.seconds > 3600):
        if diff.seconds//3600 == 1:
            return str(1) + " hour ago"
        return str(diff.seconds//3600) + " hours ago"
    elif (diff.seconds > 60):
        if diff.seconds//60 == 1:
            return str(1) + " minute ago"
        return str(diff.seconds//60) + " minutes ago"
    else:
        return str(diff.seconds) + " seconds ago"
