import json
import requests
from bs4 import BeautifulSoup

print("Starting scrape!")

main_page = requests.get("https://www.strengthlog.com/exercise-directory")
soup = BeautifulSoup(main_page.content, "html.parser")

exercises = {}

# scrape the exercise names and page urls
for list_tag in soup.find_all("ol"):
    for tag in list_tag.find_all("li"):
        link = tag.find_all("a")[0]
        exercises[link.text] = { "url": link["href"], "muscles": [] }

# get more info for each of the exercises
for name in exercises:
    page = requests.get(exercises[name]["url"])
    soup = BeautifulSoup(page.content, "html.parser")

    list_tags = soup.find_all(attrs={"class": "wp-block-list"})
    for list_tag in list_tags:
        for tag in list_tag.find_all("li"):
            a_tag = tag.find("a")
            if a_tag is not None:
                exercises[name]["muscles"].append(a_tag.text)

    del exercises[name]["url"]

with open("exercises.json", "w") as json_file:
    json.dump(exercises, json_file, indent=2)

print("Done!")