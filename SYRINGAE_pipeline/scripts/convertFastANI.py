import pandas as pd
import os
"""
pseudocode:

1) import every text file in fastani folder
2) for each file, create list of lines, with each line split at whitespace
3) extract genome accession from first element in first line, add to a list of genomes if not there yet
4) extract genome accession from second element in every line, add to a list of genomes if not there yet
5) create pandas df with symmetrical col names and indexes
6) cycle through files again, and at df[first acc][second acc], add third element (ANI)
7) pickle dataframe and save

"""

def extractData(l):
    columns = l.split()
    if len(columns) != 5:
        return False
    acc = columns[0].split("/")
    accFinal = acc[1].split("_")
    rowACC = accFinal[0]+"_"+accFinal[1]
    acc = columns[1].split("/")
    accFinal = acc[1].split("_")
    colACC = accFinal[0]+"_"+accFinal[1]
    return([rowACC,colACC,columns[2]])

#_____________________________________________________#

genomes = []
for filename in os.listdir("/Volumes/2TB/fastANI"):
    if filename[0] != ".":
        print('reading' + filename)
        with open(f'/Volumes/2TB/fastANI/{filename}') as f:
            lines = f.readlines()
        for line in lines:
            data = extractData(line)
            if data and data[0] not in genomes:
                genomes.append(data[0])
            if data and data[1] not in genomes:
                genomes.append(data[1])
#print(genomes,len(genomes))

df = pd.DataFrame(columns=genomes,index=genomes)
for filename in os.listdir("/Volumes/2TB/fastANI"):
    if filename[0] != ".":
        with open(f'/Volumes/2TB/fastANI/{filename}') as f:
            lines = f.readlines()
            for line in lines:
                data = extractData(line)
                if data:
                    if data[0] == data[1]:
                        d = float("nan")
                    else:
                        d = data[2]
                    df.at[data[0],data[1]] = d
                    df.at[data[1],data[0]] = d
print(df)
df.to_pickle('/Users/cwf30/Desktop/Code/SARE_APP/scripts/ANI_matrix.p')
df.to_csv("/Users/cwf30/Desktop/Code/SARE_APP/scripts/ANI_matrix.csv")