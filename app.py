from flask import Flask, Response
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route("/")
def scrape():
    URL = "https://www.cricbuzz.com/cricket-schedule/upcoming-series"
    HEADERS = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        res = requests.get(URL, headers=HEADERS)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")

        series_blocks = soup.select("div.cb-col.cb-col-100.cb-bg-white.cb-schdl")

        html = """
        <html>
        <head>
            <title>Upcoming Cricket Series - Cricbuzz</title>
            <style>
                body { font-family: Arial; padding: 20px; background: #f5f5f5; }
                h1 { color: #2c3e50; }
                ul { line-height: 1.8em; }
            </style>
        </head>
        <body>
            <h1>🏏 Upcoming Cricket Series (from Cricbuzz)</h1>
            <ul>
        """

        for block in series_blocks[:5]:
            title = block.find("h2").text.strip()
            link = block.find("a")["href"]
            full_link = "https://www.cricbuzz.com" + link
            html += f"<li><a href='{full_link}' target='_blank'>{title}</a></li>"

        html += "</ul></body></html>"

        return Response(html, mimetype='text/html')

    except Exception as e:
        return f"<h2>Error occurred: {e}</h2>"

if __name__ == "__main__":
    app.run()
