import json
import requests
from bs4 import BeautifulSoup

print("Starting scrape!")

def get_exercise_pages():
  page = requests.get("https://www.strengthlog.com/exercise-directory")
  soup = BeautifulSoup(page.content, "html.parser")

  exercises = {}
  for list_tag in soup.find_all("ol"):
    for tag in list_tag.find_all("li"):
      link = tag.find_all("a")[0]
      exercises[link.text] = {
        "url": link["href"],
        "muscles": [],
        "bodyweight": False,
        "exercise_type": "strength"
      }
  return exercises

# get more info for each of the exercises
exercises = get_exercise_pages()
exercise_names = list(exercises.keys())

for exercise_name in exercise_names:
  page = requests.get(exercises[exercise_name]["url"])
  soup = BeautifulSoup(page.content, "html.parser")

  primary = soup.find(id="h-primary-muscles-worked")
  secondary = soup.find(id="h-secondary-muscles-worked")
  if primary is None: # nothing to parse
    del exercises[exercise_name]
    continue

  list_tags = primary.find_next("ul").find_all("li")
  if secondary is not None:
    list_tags.extend(secondary.find_next("ul").find_all("li"))

  # Map the names of the muscles worked to the format used in the frontend
  replacements = {
      "Deltoid": "deltoid", "Forearm": "forearm", "Glutes": "gluteal",
      "Hamstrings": "hamstring", "Lats": "upper-back", "Traps": "trapezius",
      "Lower back": "lower-back", "Quads": "quadriceps", "Tibialis": "tibialis"
  }
  ignore = ["Rotator Cuff", "Abductors", "Hip"]

  for tag in list_tags:
    a_tags = tag.find_all("a")
    name = tag.text if len(a_tags) == 0 else a_tags[-1].text

    skip = False
    for muscle_group in ignore:
      if muscle_group in name:
        skip = True
        break
    if skip:
      continue

    for key in replacements:
      if key in name:
        name = replacements[key]
        break

    exercises[exercise_name]["muscles"].append(name.lower())

  del exercises[exercise_name]["url"]

with open("exercises.json", "w") as json_file:
  json.dump(exercises, json_file, indent=2)

print("Done!")