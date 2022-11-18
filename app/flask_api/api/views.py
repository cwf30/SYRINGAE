from flask import Blueprint, jsonify, request
from qiime2.plugins.feature_classifier.methods import classify_sklearn
from qiime2 import Artifact
import os
import csv
import json
import pandas as pd

main = Blueprint("main", __name__)

print("loading gene data...")
global GeneData
with open("Proteins.json", mode="r") as infile:
    g = json.load(infile)
    GeneData = g.copy()

print("loading isolate data...")
global IsoProteinData
with open("IsoProteins.json", mode="r") as infile:
    g = json.load(infile)
    IsoProteinData = g.copy()

print("loading metadata...")
global meta
with open("metadata.csv", mode="r") as infile:
    g = list(csv.DictReader(infile))
    meta = g.copy()

print("loading isolate data...")
global VFOCData
with open("GENOME_VFOC_20.json", mode="r") as infile:
    g = json.load(infile)
    VFOCData = g.copy()
# nasty solution for a key error. HrpR_ needs to change to HrpR
for key in VFOCData.keys():
    if 'HrpR_' in VFOCData[key]:
        VFOCData[key]['HrpR'] = VFOCData[key].pop('HrpR_')

print("moving things around a little...")
global IsoByAccession
IsoByAccession = {}
for genome in meta:
    IsoByAccession[genome["name"]] = genome

global T3SS
T3SS = []
global T3E
T3E = []
global WHOP
WHOP = []
T3SS_prefix = ["Hrp", "Sct"]
T3E_prefix = ["Hop", "Avr"]
WHOP_prefix = ["cat", "dho", "ipo"]
for key in IsoByAccession[list(IsoByAccession)[0]]:
    if key[0:3] in T3SS_prefix:
        T3SS.append(key)
    elif key[0:3] in T3E_prefix:
        T3E.append(key)
    elif key[0:3] in WHOP_prefix:
        WHOP.append(key)
T3SS.sort()
T3E.sort()
WHOP.sort()

global IsoRelatives
g = pd.read_csv("ANI_matrix.csv", header=0, index_col=0)
IsoRelatives = g.copy()
print("API is ready!")


@main.route("/api/identify_amplicon", methods=["POST"])
def identify_amplicon():
    print("started identifying amplicons")
    # get data from user
    query_data = request.get_json()
    # get the desired gene from the user
    classifier = query_data["MarkerGene"].replace(" - ", "_") + ".qza"
    # get the classifier from the classifiers folder
    classifier_artifact = Artifact.load("trained_classifiers/" + classifier)

    # save the sequence to a fasta file
    with open("sequence.fasta", "w") as f:
        f.write(query_data["sequences"])
    # create a FeatureData[Sequence] artifact from the sequence
    sequence_artifact = Artifact.import_data(
        'FeatureData[Sequence]', "sequence.fasta")
    # classify the sequence
    classification = classify_sklearn(
        sequence_artifact, classifier_artifact, confidence=0.9)
    # get the classification from the classification object
    classification_artifact = classification.classification
    # save the classification to a dictionary
    classification_dict = classification_artifact.view(pd.DataFrame).to_dict()
    # get keys in classification_dict["Taxon"]
    amplicons = list(classification_dict["Taxon"].keys())
    parsed_data = {}
    # for each amplicon, get the taxon and confidence
    for amplicon in amplicons:
        parsed_data[amplicon] = {"confidence": classification_dict["Confidence"][amplicon],
                                 "levels": {}}
        # for each level in the classification, get the taxon and confidence
        taxon = classification_dict["Taxon"][amplicon]
        # create a list of numbers from 80 to 99
        ANIs = list(range(80, 100))
        # split taxon into levels
        levels = taxon.split(";")
        # split each level by "__"
        tmpDict = {}
        for level in levels:
            level_split = level.split("__")
            # create a dictionary for each level with level_split[0] as the key and level_split[1] as the value
            if len(level_split) > 1:
                tmpDict[int(level_split[0])] = level_split[1]
        # for each ANI in ANIs, check if the level is in tmpDict
        for ANI in ANIs:
            if ANI in tmpDict:
                parsed_data[amplicon]["levels"][ANI] = tmpDict[ANI]
            else:
                parsed_data[amplicon]["levels"][ANI] = "null"

    """dummy_data = {

        "amplicon1": {"confidence": 0.999,
                      "levels": {80: "a", 81: "aa", 82: "aaa",
                                 83: "aaaa", 84: "aaaaa",
                                 85: "aaaaab", 86: "aaaaaba", 87: "aaaaabaa", 88: "aaaaabaab", 89: "aaaaabaaba",
                                 90: "aaaaabaabaa", 91: "aaaaabaabaaa", 92: "aaaaabaabaaaa", 93: "aaaaabaabaaaaa",
                                 94: "aaaaabaabaaaaaa", 95: "aaaaabaabaaaaaaa", 96: "aaaaabaabaaaaaaab",
                                 97: "aaaaabaabaaaaaaaba", 98: "aaaaabaabaaaaaaabaa", 99: "null"}
                      }
    }"""

    # return json of assigned LIN groups and confidence {95: {group: 3, P-value: 0.04}
    return parsed_data


@main.route("/api/metadata")
def metadata():
    return {"data": list(meta)}

    
@main.route("/api/bug_reports", methods=["POST"])
def bug_reports():
    query_data = request.get_json()
    print(f'query_data: {query_data}')
    with open("api/bugReports.json",'r') as jsonfile:
        json_content = json.load(jsonfile) 
    print(f'json_content: {json_content}')
    
    json_content["issues"].append(query_data)
    with open("api/bugReports.json", "w") as f:
        json.dump(json_content, f, indent=4)
    return({"result":"success!"})

    
@main.route("/api/getGeneAnnotations", methods=["POST"])
def getGeneAnnotations():
    query_data = request.get_json()
    names = [i[1:] for i in query_data["metadata"].keys()]
    newData = {k: {} for k in names}
    print(newData)
    genes = [i for i in query_data["query"].values() if i != ""]

    for gene in genes:
        for hit in GeneData[gene.lower()]:
            newData[hit["isolateAccession"]][gene] = 1
    for key in newData.keys():
        for gene in genes:
            if gene not in newData[key]:
                print("no gene")
                newData[key][gene] = 0


    return jsonify(newData)


@main.route("/api/getIsolateData", methods=["POST"])
def getIsolateData():
    # get data from user
    query_data = request.get_json()
    isolate = query_data["query"]
    dat = IsoByAccession[isolate].copy()
    relatives = IsoRelatives[isolate][IsoRelatives[isolate] > 90]
    relatives = relatives.reset_index()
    listOfRelatives = []

    for index, row in relatives.iterrows():
        listOfRelatives.append({'accession': row[0],
                                'ANI': row[1],
                                'Type strain': IsoByAccession[row[0]]['Type strain'],
                                'Phylogroup': IsoByAccession[row[0]]['Phylogroup'],
                                'Pathovar': IsoByAccession[row[0]]['Pathovar'],
                                'Species': IsoByAccession[row[0]]['Species'],
                                'Strain': IsoByAccession[row[0]]['Strain'],
                                "Taxonomy check": IsoByAccession[row[0]]['Taxonomy check']})

    VFOC = {"Type 3 secretion system": {},
            "Type 3 effectors": {}, "WHOP genes": {}}
    # print(VFOCData[dat["name"]])

    for gene in T3SS:
        # bug is clumsily fixed here.
        present = int(dat[gene]) > 0 and gene in VFOCData[isolate].keys()
        VFOC["Type 3 secretion system"][gene] = {
            "present": present,
            "copies":  [] if not present else VFOCData[isolate][gene]  # bug is here
        }
    for gene in T3E:
        present = int(dat[gene]) > 0
        VFOC["Type 3 effectors"][gene] = {
            "present": present,
            "copies": VFOCData[dat["name"]][gene] if present else []
        }
    for gene in WHOP:
        present = int(dat[gene]) > 0
        VFOC["WHOP genes"][gene] = {
            "present": True if present else False,
            "copies": VFOCData[dat["name"]][gene] if present else []
        }
    dat["relatives"] = listOfRelatives
    dat["genes"] = IsoProteinData[isolate]
    dat["VFOC"] = VFOC
    return(dat)


@main.route("/api/getGeneData", methods=["POST"])
def getGeneData():
    # get data from user
    query_data = request.get_json()
    raw_data = GeneData[query_data['query'].lower()]
    strains = []
    NRaccessions = {}

    for gene in raw_data:
        acc = gene["isolateAccession"]
        strains.append({"isolateAccession": gene["isolateAccession"],
                        'proteinAccession': gene['proteinAccession'],
                        'Type strain': IsoByAccession[acc]['Type strain'],
                        'Phylogroup': IsoByAccession[acc]['Phylogroup'],
                        'Pathovar': IsoByAccession[acc]['Pathovar'],
                        'Species': IsoByAccession[acc]['Species'],
                        'Strain': IsoByAccession[acc]['Strain'],
                        "Taxonomy check": IsoByAccession[acc]['Taxonomy check']})

        if gene['proteinAccession'] in NRaccessions.keys():
            NRaccessions[gene['proteinAccession']] += 1
        else:
            NRaccessions[gene['proteinAccession']] = 1
    
    NRaccessions = [{"acc" : oldKey, "count": oldValue} for oldKey,oldValue in NRaccessions.items()]
    
    final_data = {"strains": strains, "non_redundant": NRaccessions}
    return(final_data)
