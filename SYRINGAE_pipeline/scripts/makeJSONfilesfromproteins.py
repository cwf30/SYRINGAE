import os
import re
import pandas as pd
import json
import csv


T3E = [
    "AvrA1",
    "AvrB1",
    "AvrB2",
    "AvrE1",
    "AvrPto1",
    "AvrRpm1",
    "AvrRpt2",
    "HopA1",
    "HopAA1",
    "HopAB1",
    "HopAD1",
    "HopAF1",
    "HopAG1",
    "HopAH1",
    "HopAI1",
    "HopAL1",
    "HopAM1",
    "HopAQ1",
    "HopAR1",
    "HopAS1",
    "HopAT1",
    "HopAT2",
    "HopAT3",
    "HopAT4",
    "HopAT5",
    "HopAT6",
    "HopAU1",
    "HopAW1",
    "HopAX1",
    "HopAZ1",
    "HopB1",
    "HopB2",
    "HopB3",
    "HopB4",
    "HopBA1",
    "HopBC1",
    "HopBD1",
    "HopBE1",
    "HopBF1",
    "HopBG1",
    "HopBH1",
    "HopBI1",
    "HopBJ1",
    "HopBK1",
    "HopBL1",
    "HopBM1",
    "HopBN1",
    "HopBO1",
    "HopBP1",
    "HopBQ1",
    "HopBR1",
    "HopBS1",
    "HopBT1",
    "HopBU1",
    "HopBV1",
    "HopBW1",
    "HopBX1",
    "HopC1",
    "HopD1",
    "HopD2",
    "HopE1",
    "HopF1",
    "HopF3",
    "HopF4",
    "HopG1",
    "HopH1",
    "HopH2",
    "HopK1",
    "HopL1",
    "HopM1",
    "HopN1",
    "HopO1",
    "HopO2",
    "HopQ1",
    "HopR1",
    "HopS2",
    "HopT1",
    "HopU1",
    "HopV1",
    "HopW1",
    "HopX1",
    "HopY1",
    "HopZ1",
    "HopZ2",
    "HopZ4",
    "HopZ5",
    "HopZ6",
]

T3E_label = "PsyTec prediction: Type III effector protein "


def extractGenomeAcc(l):
    splitLine = l.split("_")
    return splitLine[0] + "_" + splitLine[1]


def extractProteinData(p):
    data = p.split("[")[0].split()
    protein_acc = data[0].split(">")[1]
    protein_name = " ".join(data[1:])
    if "hypothetical protein" in protein_name:
        return False
    if "MULTISPECIES: " in protein_name:
        protein_name = protein_name.replace("MULTISPECIES: ", "")
    return [protein_acc, protein_name]


with open("/Volumes/2TB/PROTEIN_VFOC_20.json") as json_file:
    HMMER_results = json.load(json_file)


metaData = csv.DictReader(
    open("/Users/cwf30/Desktop/Code/SARE_APP/flask_api/VFOC_metadata_20.csv")
)
Isolate_search_terms = {}
for row in metaData:
    Isolate_search_terms[row["name"]] = {
        "search_terms": f'{row["name"]} {row["Organism"]} {row["Species"]} {row["Pathovar"]} {row["Strain"]} {row["Assembly name (Alt. strain)"]}',
        "label": f'species: {row["Species"]}, strain: {row["Strain"]}',
    }

Proteins = {}
IsoProteins = {}
Search_options = []
"""reference for search options:

IsolateColor = "#87683e";
GeneColor = "#99ab76";
SearchOptions = [
    {
      label: "HopA",
      value: "HopA",
      icon: faDna,
      iconColor: GeneColor,
      SearchTerms: "effector hopa",
    },"""

folder = "/Volumes/2TB/HIGH_QUALITY_proteins"
for filename in os.listdir(folder):
    if filename[0] != ".":
        print(f"oh boy, look at me! I just started processing {filename}")
        genome_acc = extractGenomeAcc(filename)

        with open(f"{folder}/{filename}") as f:
            lines = f.readlines()
        for line in lines:
            if line[0] == ">":
                protein_data = extractProteinData(line)
                overRide_name = False
                if protein_data:
                    if protein_data[0] in HMMER_results:
                        prediction = HMMER_results[protein_data[0]]["HMMER"][0]
                        if prediction in T3E:
                            overRide_name = T3E_label + prediction

                    proteinName = (
                        protein_data[1] if not overRide_name else overRide_name
                    )
                    if proteinName.lower() not in Proteins:
                        Proteins[proteinName.lower()] = [
                            {
                                "proteinAccession": protein_data[0],
                                "isolateAccession": genome_acc,
                            },
                        ]
                        Search_options.append(
                            {
                                "label": protein_data[1]
                                if not overRide_name
                                else overRide_name,
                                "value": protein_data[1]
                                if not overRide_name
                                else overRide_name,
                                "icon": "faDna",
                                "iconColor": "#99ab76",
                                "SearchTerms": protein_data[1]
                                if not overRide_name
                                else overRide_name + " " + protein_data[1],
                                "type": "protein",
                            }
                        )

                    else:
                        Proteins[proteinName.lower()].append(
                            {
                                "proteinAccession": protein_data[0],
                                "isolateAccession": genome_acc,
                            }
                        )
                    if genome_acc not in IsoProteins:
                        IsoProteins[genome_acc] = [
                            {
                                "proteinName": protein_data[1]
                                if not overRide_name
                                else overRide_name,
                                "proteinAccession": protein_data[0],
                            }
                        ]
                        Search_options.append(
                            {
                                "label": Isolate_search_terms[genome_acc]["label"],
                                "value": Isolate_search_terms[genome_acc]["label"],
                                "icon": "faBacterium",
                                "iconColor": "#87683e",
                                "SearchTerms": Isolate_search_terms[genome_acc][
                                    "search_terms"
                                ],
                                "type": "isolate",
                            }
                        )
                    else:
                        IsoProteins[genome_acc].append(
                            {
                                "proteinName": protein_data[1]
                                if not overRide_name
                                else overRide_name,
                                "proteinAccession": protein_data[0],
                            }
                        )
with open("/Users/cwf30/Desktop/Code/SARE_APP/flask_api/Proteins.json", "w") as fp:
    json.dump(Proteins, fp)

with open("/Users/cwf30/Desktop/Code/SARE_APP/flask_api/IsoProteins.json", "w") as fp:
    json.dump(IsoProteins , fp)

with open("/Users/cwf30/Desktop/Code/SARE_APP/flask_api/searchOptions.json", "w") as fp:
    json.dump(Search_options, fp)
# print(Proteins)
# print(IsoProteins)
# print(Search_options)
