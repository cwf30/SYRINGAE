import json
  
# Opening JSON file
f = open('Proteins.json')
  
# returns JSON object as 
# a dictionary
data = json.load(f)
  
# Iterating through the json
# list
print(len(data.keys()))
  
# Closing file
f.close()
