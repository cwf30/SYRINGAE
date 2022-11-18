import os
import re 
import pandas as pd
import json
 

def getFiles(directory):
# return list of files in given directory
    files = []
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        if filename[0] != ".":
            files.append(f)
    return files


def extractHits(f, evalueCutoff):
# tables with no HMMER hits are 13 lines long. each hit is a single line. 
# hits get reported starting on line 3. using this, extract lines detailing all hits.
    with open(f, 'r') as fp:
        lines=fp.readlines()
        NumHits= len(lines) - 10
        genes = {}
        # get and format hits to a easier to process list of [virulence factor, e-value, gene accession number, gene description]
        for i in range(3,NumHits):
            hit = lines[i].split()
            Evalue = float(hit[4])
            geneDescription = ' '.join(hit[18:])
            if  Evalue < evalueCutoff:
                VFOC = re.search("(.*)_",hit[2])[1]
                # rename tail fibers to something shorter
                match VFOC:
                    case 'Type_1_fiber_raw':
                        VFOC = 'Rbp1'
                    case 'Type_2_fiber_raw':
                        VFOC = 'Rbp2'
                    case 'Type_3_fiber_raw':
                        VFOC = 'Rbp3'
                
                # grab genome accession number from filename
                acc = re.search("(GCF\_.*?)\_",f)[1]
                formattedHit = [acc, VFOC, Evalue, hit[0], geneDescription]
                genes = bestmatch(formattedHit, genes)
        hits = list(genes.values())
    return hits

def bestmatch(queryGene, GeneList):
    #keeps a record of the current best annotation for a given protein
    #GeneList = {"WP_3400123":[acc, VFOC, Evalue, hit[0], geneDescription]}
    
    if queryGene[3] not in GeneList:
        GeneList[queryGene[3]] = queryGene
        return GeneList
    if queryGene[2] < GeneList[queryGene[3]][2]:
        GeneList[queryGene[3]] = queryGene
    return GeneList

def toCSV(HMMERfiles, Eval, indir, outdir):
    df = pd.read_csv (indir)
    for i in range(len(HMMERfiles)): 
        hits = extractHits(HMMERfiles[i], Eval)
         # check if already a column for this virulence factor. if not, add it
        for hit in hits:
            if not hit[1] in df.columns:
                df[hit[1]] = 0
            # increment count for VFOC for each one found in that file
            df.loc[df.Accession == hit[0], hit[1]] += 1
    df.to_csv(outdir)

def toJSON(HMMERfiles, Eval, GENOMEJSON, PROTEINJSON):
    # returns two dictionaries for easy querying:
    # PROTEINdict = {"WP_343434": {"genomes":["GCF_00000"],"HMMER": ["antA"], "annotation":"hypothetical protein"}}
    # GENOMEdict = {"GCF_00000": {"antA":[{"accession":"WP_343434","E-value":0,"annotation":"hypothetical protein"}]}}
    PROTEINdict = {}
    GENOMEdict = {}
    for i in range(len(HMMERfiles)):
        #extractHits returns a list of protein hits where index 0 = genome acc, 1 = VFOC, 2 = e-value, 3 = protein acc, 4 = annotation
        hits = extractHits(HMMERfiles[i], Eval)
        for hit in hits:
            GENOMEdata = {"accession":hit[3],"E-value":hit[2],"annotation":hit[4]}
            if hit[0] in GENOMEdict:
                if hit[1] in GENOMEdict[hit[0]]:
                    GENOMEdict[hit[0]][hit[1]].append(GENOMEdata)
                else: GENOMEdict[hit[0]][hit[1]] = [GENOMEdata]
            else: GENOMEdict[hit[0]] = {hit[1]: [GENOMEdata]}

            if hit[3] in PROTEINdict:
                if hit[0] not in PROTEINdict[hit[3]]["genomes"]:
                    PROTEINdict[hit[3]]["genomes"].append(hit[0])
                if hit[1] not in PROTEINdict[hit[3]]["HMMER"]:
                    PROTEINdict[hit[3]]["HMMER"].append(hit[1])
            else: PROTEINdict[hit[3]] = {"genomes":[hit[0]],"HMMER": [hit[1]], "annotation":hit[4]}
        
        with open(GENOMEJSON, 'w', encoding='utf-8') as f:
            json.dump(GENOMEdict, f, ensure_ascii=False, indent=4)
        with open(PROTEINJSON, 'w', encoding='utf-8') as f:
            json.dump(PROTEINdict, f, ensure_ascii=False, indent=4)



            
    
# -----------------------------------------script-------------------------------------------------#
directory = '/Users/cwf30/Desktop/Code/Dissertation/Ch1_SYRINGAE/PSSC_Primer_tests/functional_prediction_tests/testing_data/HMM_results/tables'
files = getFiles(directory)

toCSV(files, 10e-20,"/Users/cwf30/Desktop/Code/Dissertation/Ch1_SYRINGAE/PSSC_Primer_tests/functional_prediction_tests/testing_data/actual_repertoires.csv", '/Users/cwf30/Desktop/Code/Dissertation/Ch1_SYRINGAE/PSSC_Primer_tests/functional_prediction_tests/testing_data/repertoires.csv')
#toJSON(files, 10e-20, 'GENOME_VFOC_20.json','PROTEIN_VFOC_20.json')