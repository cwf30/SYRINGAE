import csv
import pandas as pd

def read_pickle_file(file):
    pickle_data = pd.read_pickle(file)
    return pickle_data

ANIdf = read_pickle_file("/Users/cwf30/Desktop/Code/SARE_APP/react_ui/data/ANI_matrix.p")

refPG = {}
refNames = []

with open('/Users/cwf30/Desktop/Code/SARE_APP/react_ui/data/phylogroup_reference.csv', mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for l in reader:
        refPG[l["accession"]] = l["PG"]
        refNames.append(l["accession"])


metadata = []

with open('/Users/cwf30/Desktop/Code/SARE_APP/flask_api/LIN_metadata.csv', mode='r', encoding='utf-8-sig') as f, open("metadata.csv", 'w') as f_out:
    reader = csv.DictReader(f)
    for l in reader:
        metadata.append(l)
    
    for row in metadata:
        name = row["name"]
        closest = 0
        closest_strain = ""
        for ref in refNames:
            if name == ref:
                closest = 100
                closest_strain = ref
                continue
            if float(ANIdf.at[name,ref]) > closest:
                closest = float(ANIdf.at[name,ref])
                closest_strain = ref
        if closest < 95:
            row["Phylogroup"] = 'unknown'
            continue
        row["Phylogroup"] = refPG[closest_strain]

    
    keys = metadata[0].keys()
    dict_writer = csv.DictWriter(f_out, keys)
    dict_writer.writeheader()
    dict_writer.writerows(metadata)


#print(metadata)




