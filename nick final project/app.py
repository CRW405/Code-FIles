from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/pages/imgGen')
def imgGen():
  return render_template('/pages/imgGen.html')

@app.route('/pages/textGen')
def textGen():
  return render_template('/pages/textGen.html')

@app.route('/pages/codie')
def codie():
  return render_template('/pages/codie.html')

if __name__ == '__main__':
  app.run(debug=True)

