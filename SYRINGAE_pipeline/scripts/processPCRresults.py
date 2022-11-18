import os
import re
import pandas as pd
import csv
from Bio import SeqIO


def getFiles(directory):
    # return list of files in given directory
    files = []
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        if filename[0] != ".":
            files.append(f)
    return files


def extractData(files, metadata):
    d = {}
    for i in range(len(files)):
        with open(files[i]) as file:
            genome = re.search("(GCF\_.*?)\_", files[i])[1]
            if metadata['name'].eq(genome).any() == False:
                print(genome)
                continue
            tsv_file = csv.reader(file, delimiter="\t")
            header = next(tsv_file)
            for line in tsv_file:
                if "_amp_" not in line[0]:
                    primer = line[0]
                    amplified = 0
                else:
                    primer = "_".join(line[0].split("_")[:-2])
                    amplified = 1

                n = metadata.name
                #print(metadata.loc[n == genome, "Species"])
                species = metadata.loc[n == genome, "Species"].values[0]
                ani_90 = str(metadata.loc[n == genome, "ANI_90"].values[0])
                ani_95 = str(metadata.loc[n == genome, "ANI_95"].values[0])

                if 'OK' in metadata.loc[metadata['name'] == genome]['Taxonomy check'].values and amplified == 1:
                    goodSpecies = 1
                else:
                    goodSpecies = 0

                if primer not in d:
                    d[primer] = {"amplification": {"success": amplified, "attempts": 1},
                                 "Species": {species: {"success": goodSpecies, "attempts": goodSpecies}},
                                 "ANI_90": {ani_90: {"success": amplified, "attempts": 1}},
                                 "ANI_95": {ani_95: {"success": amplified, "attempts": 1}}
                                 }
                    continue
                d[primer]["amplification"]["success"] += amplified
                d[primer]["amplification"]["attempts"] += 1

                if species not in d[primer]['Species']:
                    d[primer]["Species"][species] = {
                        "success": goodSpecies, "attempts": goodSpecies}
                else:
                    d[primer]["Species"][species]["success"] += goodSpecies
                    d[primer]["Species"][species]["attempts"] += goodSpecies

                if ani_90 not in d[primer]['ANI_90']:
                    d[primer]["ANI_90"][ani_90] = {
                        "success": amplified, "attempts": 1}
                else:
                    d[primer]['ANI_90'][ani_90]['success'] += amplified
                    d[primer]['ANI_90'][ani_90]['attempts'] += 1

                if ani_95 not in d[primer]['ANI_95']:
                    d[primer]['ANI_95'][ani_95] = {
                        "success": amplified, "attempts": 1}
                else:
                    d[primer]['ANI_95'][ani_95]['success'] += amplified
                    d[primer]['ANI_95'][ani_95]['attempts'] += 1
    """for key,value in d.items():
        print(key, d[key]["amplification"]["success"]/d[key]["amplification"]["attempts"])
    """
    return(d)


def buildFASTAs(f):
    goodPrimers = ["rpoD_HWANG",
                   "gapA_Hwang",
                   "CTS_YAN",
                   "pgi_YAN",
                   "gyrB_Hwang",
                   "CTS_Hwang",
                   "CTS_Morris_Sarker",
                   "gyrB_YAN",
                   "rpoD_Parkinson"]
    amps = {}
    for i in range(len(f)):
        genome = re.search("(GCF\_.*?)\_", f[i])[1]
        if metadata['name'].eq(genome).any() == False:
            print('no')
            continue
        with open(f[i]) as handle:
            for record in SeqIO.parse(handle, "fasta"):
                primer = "_".join(record.id.split("_")[:-2])
                if primer not in goodPrimers:
                    continue
                if primer not in amps:
                    amps[primer] = f'>{genome}\n{record.seq}\n'
                else:
                    amps[primer] = amps[primer] + f'>{genome}\n{record.seq}\n'
    for key, value in amps.items():
        print(key)
        with open(f'{key}.fasta', 'w') as f:
           f.write(value)


#directory = '/Volumes/2TB/PCR_results'
#files = getFiles(directory)
fastaDirectory = '/Users/cwf30/Desktop/Code/Dissertation/Ch1_SYRINGAE/PSSC_Primer_tests/functional_prediction_tests/testing_data/PCR_results/fasta'
fastaFiles = getFiles(fastaDirectory)
#metadata = pd.read_csv('LIN_metadata.csv')
#data = extractData(files, metadata)
fasta = buildFASTAs(fastaFiles)
