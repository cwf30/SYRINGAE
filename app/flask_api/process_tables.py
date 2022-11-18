'''ENTREZ API STUFF'''
import csv
import json
import time
from os import listdir
import entrez


files = (listdir('./results/'))
files = [k for k in files if '._' not in k and '_table' in k]
all_queries = [k[:-16] for k in files]
all_NCBI_refs = []

'''Step one: build dictionary with all significant hits for each toxin/antitoxin query'''
queries = {}  # {'query':[NT_id,NT_id,...],...}
for i in range(len(files)):

    with open(f'./results/{files[i]}') as file:
        data = file.read()
    query = all_queries[i]
    queries[query] = []
    dataLines = data.splitlines()[3:-10]  # we only want the lines with data
    queryHits = []
    for dataLine in dataLines:
        Row = dataLine.split(maxsplit=18)

        # if valid data row and e-value is below threshold
        if len(Row) == 19 and float(Row[4]) < 10e-5:

                # 'query': Row[2][:-10],
                # 'genome': Row[18],
                # 'e-value': Row[4]
                # 11 characters of NCBI ID: Row[18][7:18]
            uniqueNCBI = Row[18].split()[0][7:]

            # remove '.1' from ID
            if len(uniqueNCBI) > 1 and uniqueNCBI[-2] == '.':
                if uniqueNCBI[:3] == 'NZ_':
                    uniqueNCBI = uniqueNCBI[3:-2]
                else:
                    uniqueNCBI = uniqueNCBI[:-2]

            '''vvv hacky fixing of weirdness in data found vvv'''
            if str(uniqueNCBI) == '1':  # special case for cit7, got from Dave Baltrus, not NCBI
                uniqueNCBI = 'NZ_CP073636'
            #all numbers need to be zero to interface w/ API correctly
            if len(uniqueNCBI) == 15:
                uniqueNCBI = uniqueNCBI[:6]+'000000000'
            if len(uniqueNCBI) == 12:
                uniqueNCBI = uniqueNCBI[:4]+'00000000'
            '''^^^^ hacky fixing of weirdness in data found ^^^'''

            if uniqueNCBI not in all_NCBI_refs:
                all_NCBI_refs.append(uniqueNCBI)
            queryHits.append(uniqueNCBI)
        else:
            queries[query] = queryHits
            break

'''step two: convert nucleotide IDs to Biosample ID so they represent an organism, not contig'''
Biosamples = entrez.Nuc2Biosample(all_NCBI_refs)  # {"BiosampleID":[NT_id,NT_id],...}

# print(Biosamples.keys())


'''DEBUG ZONE'''
# start=520
# end=530
# print(all_NCBI_refs[start:end])
#Biosamples = Nuc2Biosample(all_NCBI_refs[start:end])
# CURRENT PROBLEM: NZ_LJRH01000107
#Biosamples = Nuc2Biosample(['JACTWB010000010'])


# with open('nuc2Biosample.json', 'w') as fp:
#    json.dump(Biosamples, fp)


'''step three: making final list of dictionaries'''
# at the end, i want a list of objects, one for each genome: {'BiosampleID':'','query1':'',...}, where each object is a row
header = all_queries.copy()
header.insert(0, 'Biosample')


with open('TAsystems.csv', 'w') as f:  # You will need 'wb' mode in Python 2.x
    w = csv.DictWriter(f, header)
    w.writeheader()

    for key, value in Biosamples.items():
        row = {'Biosample': key}
        for k, v in queries.items():
            row[k] = len(list(set(value) & set(v)))
        w.writerow(row)
