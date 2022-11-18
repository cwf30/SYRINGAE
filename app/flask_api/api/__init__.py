from flask import Flask


def create_app():
    app = Flask(__name__)

    app.config['FLASK_APP'] = '.api'
    from . import views
    app.register_blueprint(views.main)

    return app
app = create_app()
