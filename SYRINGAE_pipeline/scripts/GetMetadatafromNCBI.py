#!/usr/bin/env python
import argparse,sys
import re
parser=argparse.ArgumentParser(description="Takes a full path to directory of NCBI genome assemblies -- with original filenames -- and returns a json and csv file containing useful metadata about sequences")
parser.add_argument('-I', help='full path to directory containing NCBI assemblies')
parser.add_argument('-O', help='path to desired directory to save output') 
args=parser.parse_args()

userInput = args.I 
outDir = args.O
if outDir[-1] != "/":
    outDir = outDir + "/"

string = userInput
pattern = "[^\/]*$"
Filename =  re.search(pattern, string).group(1)



from Bio import Entrez
import re
import os
import json
import time
import csv

def chunkList(lst, sz): return [lst[i:i+sz] for i in range(0, len(lst), sz)]


def extractAccessionfromNCBIfiles(filepath):
    genomes = os.listdir(filepath)
    accessionNumbers = []
    for genome in genomes:
        pattern = "^[^_]*_[^_]*"
        accessionNumbers.append(re.search(pattern, genome).group())
    return accessionNumbers


def getIDfromAccession(db_type, acc, chunks):
    data = {}
    IdList = []
    chunkedList = chunkList(acc, chunks)
    counter = 0
    for list in chunkedList:
        counter = counter + 1
        for accession in list:
            time.sleep(0.3)
            handle = Entrez.esearch(
                db=db_type, retmax=10, term=accession, idtype="acc")
            record = Entrez.read(handle)
            IdList.append(record["IdList"][0])
            data[record["IdList"][0]] = {"accession": accession, "assemblyRecord": [],
                                         "biosampleRecord": []}
            handle.close()
    f = open(f'{Filename}_metadata.json', "w")
    json.dump(data, f)
    f.close()


def getBiosampleRecords(jsonFile):  # returns list of Biosample records
    f = open(jsonFile,)
    data = json.load(f)
    f.close()
    BiosampleIDs = {}
    for key in data:
        BiosampleIDs[getBioSampleId(data[key]["assemblyRecord"])] = key
    handle = Entrez.esummary(db="Biosample", id=",".join(BiosampleIDs.keys()))
    results = Entrez.read(handle, validate=False)
    for result in results['DocumentSummarySet']['DocumentSummary']:
        assemblyID = BiosampleIDs[result.attributes["uid"]]
        data[assemblyID]["biosampleRecord"] = result
    handle.close()
    f = open("metadata.json", "w")
    json.dump(data, f)
    f.close()

def getAssemblyRecords(jsonFile):  # returns list of records
    f = open(jsonFile,)
    data = json.load(f)
    f.close()
    AssemblyIDs = [*data]
    handle = Entrez.esummary(db="assembly", id=",".join(AssemblyIDs))
    results = Entrez.read(handle, validate=False)

    for result in results['DocumentSummarySet']['DocumentSummary']:
        data[result.attributes["uid"]]["assemblyRecord"] = result
    handle.close()
    f = open("metadata.json", "w")
    json.dump(data, f)
    f.close()

def getBioSampleId(AssemblyRecord):
    return AssemblyRecord['BioSampleId']


def getAssemblyAccession(AssemblyRecord):#
    return AssemblyRecord["AssemblyAccession"]

def getTaxonomyStatus(AssemblyRecord):
    Meta = AssemblyRecord["Meta"]
    pattern = "\<taxonomy\-check\-status\>(.*?)\<"
    return re.search(pattern, Meta).group(1)

def getIsolationSource(bioSampleRecord):#
    sampledata = bioSampleRecord["SampleData"]
    pattern = "\"isolation source\"\>(.*?)\<"
    if hasattr(re.search(pattern, sampledata),"group"):
        return re.search(pattern, sampledata).group(1)
    return "missing"

def getGeographicLocation(bioSampleRecord):#
    sampledata = bioSampleRecord["SampleData"]
    pattern = "geographic location\"\>(.*?)\<"
    if hasattr(re.search(pattern, sampledata),"group"):
        return re.search(pattern, sampledata).group(1)
    return "missing"

def getInfraspecies(AssemblyRecord):#
    if len(AssemblyRecord['Biosource']['InfraspeciesList']) > 0:
        if AssemblyRecord['Biosource']['InfraspeciesList'][0]['Sub_type'] == "strain":
            if AssemblyRecord['Biosource']['InfraspeciesList'][0]['Sub_value'] != "":
                return AssemblyRecord['Biosource']['InfraspeciesList'][0]['Sub_value'].replace(' ', '-')
        else:
            return getAssemblyName(AssemblyRecord)
    else:
            return getAssemblyName(AssemblyRecord)

def getOrganismName(AssemblyRecord):#
    return AssemblyRecord['Organism']

def getSubmissionDate(AssemblyRecord):#
    return AssemblyRecord['SubmissionDate'].split()[0]

def getSubmitterOrganization(AssemblyRecord):#
    return AssemblyRecord['SubmitterOrganization']

def getSpeciesName(AssemblyRecord):#
    if AssemblyRecord['SpeciesName'].split()[1] != 'sp.':
        return AssemblyRecord['SpeciesName'].split()[1]
    else: 
        return 'missing'

def getAssemblyName(AssemblyRecord):#
    return AssemblyRecord['AssemblyName']

def getPathovar(bioSampleRecord):
    sampledata = bioSampleRecord["SampleData"]
    pattern = "display_name=\"pathovar\"\>(.*?)\<"
    if hasattr(re.search(pattern, sampledata),"group"):
        return re.search(pattern, sampledata).group(1)
    return "missing"

def getTypeStrain(bioSampleRecord):
    sampledata = bioSampleRecord["SampleData"]
    pattern = "\"type-material\"\>(.*?)\<"
    if hasattr(re.search(pattern, sampledata),"group"):
        return re.search(pattern, sampledata).group(1)
    return "FALSE"
Entrez.email = "cwf30@psu.edu"

acc = extractAccessionfromNCBIfiles(userInput)
print("Preparing to extract records... this can take a while")
IDs = getIDfromAccession("assembly", acc, 50)
print("getting Assembly records...")
getAssemblyRecords(f'{Filename}_metadata.json')
print("getting Biosample records...")
getBiosampleRecords(f'{Filename}_metadata.json')
print("Building CSV file...")
summarized_metadata = []
f = open(f'{Filename}_metadata.json',)
data = json.load(f)
f.close()

for key,value in data.items():
    assemblyRecord = value["assemblyRecord"]
    biosampleRecord = value["biosampleRecord"]

    summarized_metadata.append({
        "Type strain" : getTypeStrain(biosampleRecord),
        "Accession" : getAssemblyAccession(assemblyRecord),
        "Submission Date": getSubmissionDate(assemblyRecord),
        "Submitting Organization" : getSubmitterOrganization(assemblyRecord),
        "Geographic Location" : getGeographicLocation(biosampleRecord),
        "Isolation Source" : getIsolationSource(biosampleRecord),
        "Organism" : getOrganismName(assemblyRecord),
        "Species" : getSpeciesName(assemblyRecord),
        "Pathovar" : getPathovar(biosampleRecord),
        "Strain" : getInfraspecies(assemblyRecord),
        "Assembly name (Alt. strain)" : getAssemblyName(assemblyRecord),
        "Taxonomy check" : getTaxonomyStatus(assemblyRecord)
    })



with open(f'{outDir}{Filename}_metadata.csv', 'w', newline='') as csvfile:
    fieldnames = ['Type strain','Accession', 'Submission Date','Submitting Organization','Geographic Location','Isolation Source','Organism','Species','Pathovar','Strain','Assembly name (Alt. strain)','Taxonomy check']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(summarized_metadata)
