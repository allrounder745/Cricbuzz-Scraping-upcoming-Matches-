import requests
from bs4 import BeautifulSoup

URL = "https://www.cricbuzz.com/cricket-match/live-scores/upcoming-matches"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
}

def get_soup(url):
    try:
        res = requests.get(url, headers=HEADERS)
        res.raise_for_status()
        return BeautifulSoup(res.text, "html.parser")
    except Exception as e:
        print("Error loading page:", e)
        return None

def scrape_upcoming_matches(soup):
    match_containers = soup.select("div.cb-col-100.cb-col")

    if not match_containers:
        print("No upcoming matches found or page structure changed.")
        return

    print(f"Found {len(match_containers)} upcoming matches:\n")

    for match in match_containers:
        # Match Title and Link
        heading = match.find("a", class_="text-hvr-underline")
        if heading:
            match_title = heading.get_text(strip=True)
            match_link = "https://www.cricbuzz.com" + heading['href']
        else:
            match_title = "No title found"
            match_link = "No link available"

        # Date and Time
        timing_div = match.find("div", class_="cb-ovr-flo cb-text-complete cb-text-muted")
        timing = timing_div.get_text(strip=True) if timing_div else "Time not available"

        # Location (venue)
        venue_div = match.find("span", class_="cb-ovr-flo")
        venue = venue_div.get_text(strip=True) if venue_div else "Venue not available"

        print(f"Match: {match_title}")
        print(f"Date/Time: {timing}")
        print(f"Venue: {venue}")
        print(f"Match Link: {match_link}")
        print("-" * 50)

def main():
    print(f"Scraping upcoming matches from: {URL}")
    soup = get_soup(URL)
    if soup:
        scrape_upcoming_matches(soup)
    else:
        print("Failed to retrieve or parse the webpage.")

if __name__ == "__main__":
    main()
