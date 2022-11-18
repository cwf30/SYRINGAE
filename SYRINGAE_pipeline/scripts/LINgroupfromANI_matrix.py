import numpy as np
import pandas as pd
import pickle
import random
import matplotlib.pyplot as plt
import csv
import string


alpha_dict = dict(enumerate(string.ascii_lowercase))
def num_to_Char(num):
    return alpha_dict[num]

ANI = open("/Users/cwf30/Desktop/Code/SARE_APP/react_ui/data/ANI_matrix.p", "rb")
df = pickle.load(ANI)
ANI.close()
#print(df)

genomeIDs = list(df.index.values)
LINlevels = np.arange(80,100,1).round(2).tolist()

assignedGenomes = {}

random.shuffle(genomeIDs)
assignedGenomes[genomeIDs[0]] = {num: 0 for num in LINlevels}
#print(assignedGenomes)

closest_list = []
NumGroups = 1
for i in range(1,len(genomeIDs)):
     #find closest genome among already assigned genomes
    closest = ''
    closest_DISTANCE = 0
    
    for assigned in assignedGenomes.keys():
        if float(df.at[genomeIDs[i],assigned]) > closest_DISTANCE:
            closest = assigned
            closest_DISTANCE = float(df.at[genomeIDs[i],assigned])
    closest_list.append(closest_DISTANCE)
    #print(closest,closest_DISTANCE)

    #assign LIN based on closest genome
    LIN = {}
    LINlevel_DIFFERENCE = 50
    for a in range(len(LINlevels)):
        if closest_DISTANCE < LINlevels[a]:
            LINlevel_DIFFERENCE = LINlevels[a]
            break
        if a == len(LINlevels) - 1 and LINlevel_DIFFERENCE == 50:
            LINlevel_DIFFERENCE = LINlevels[a]

    #print(closest_DISTANCE,LINlevel_DIFFERENCE)
    
    for LINlevel, value in assignedGenomes[closest].items():
        if LINlevel < LINlevel_DIFFERENCE:
            LIN[LINlevel] = value
        elif LINlevel == LINlevel_DIFFERENCE:
            #print("changed: ",LINlevel, LINlevel_DIFFERENCE,value+1)
            LIN[LINlevel] = value+1
        elif LINlevel > LINlevel_DIFFERENCE:
            LIN[LINlevel] = 0

    assignedGenomes[genomeIDs[i]] = LIN.copy()
    #print(assignedGenomes[genomeIDs[i]].values())
print(len(assignedGenomes.keys()))
plt.hist(closest_list, bins=LINlevels)
#plt.show() 

LIN_taxonomy = {}

#build taxonomy file for training classifier
with open('LIN_taxonomy.tsv', 'wt') as out_file:
    tsv_writer = csv.writer(out_file, delimiter='\t')
    for genome, LINgroups in assignedGenomes.items():
        #k__Bacteria; p__Proteobacteria; c__Gammaproteobacteria; o__Legionellales; f__Legionellaceae; g__Legionella; s__
        taxa = ""
        currentAddress = ""
        for LINlevel, value in assignedGenomes[genome].items():
            currentAddress = currentAddress + num_to_Char(value)
            taxa = taxa + str(LINlevel) + "__" + currentAddress + ";"
        tsv_writer.writerow([genome, taxa])

#add LIN groups to metadata file
df = pd.read_csv('/Users/cwf30/Desktop/Code/SARE_APP/flask_API/VFOC_metadata_20.csv')
for genome, LINgroups in assignedGenomes.items():
    currentAddress = ""
    for LINlevel, value in assignedGenomes[genome].items():
        currentAddress = currentAddress + num_to_Char(value)
        colName = f'ANI_{LINlevel}'
        if not colName in df.columns:
            df[colName] = "NONE"
        # add LIN for each ANI level
        df.loc[df.name == genome, colName] = currentAddress
df.to_csv('LIN_metadata.csv')







    
    
    


