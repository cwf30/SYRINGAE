#conda activate qiime2-2022.2
from qiime2.plugins.feature_classifier.methods import fit_classifier_naive_bayes
from qiime2 import Artifact
import os

#get list of files in /Users/cwf30/Desktop/Code/Dissertation/PSSC_Primer_tests/PCR_fasta
files = os.listdir("/Users/cwf30/Desktop/Code/Dissertation/PSSC_Primer_tests/PCR_fasta")

LINtaxonomy = "path/to/LINtaxonomy.tsv"
#create a FeatureData[Taxonomy] artifact from the taxonomy
taxonomy_artifact = Artifact.import_data('Taxonomy', LINtaxonomy)


#for file in files, import the file into a qiime2 artifact FeatureData[Sequence]
for file in files:
    #ignore hidden files
    if file.startswith('.'):
        continue
    seq_artifact = Artifact.import_data('FeatureData[Sequence]', "/Users/cwf30/Desktop/Code/Dissertation/PSSC_Primer_tests/PCR_fasta/" + file)
    #fit the classifier
    classifier = fit_classifier_naive_bayes(seq_artifact, taxonomy_artifact)
    #get classifier from classifier object
    classifier_artifact = classifier.classifier
    #strip the file name of the extension
    file_name = file.split('.')[0]
    #export the classifier to a qiime2 artifact
    classifier_artifact.save("classifier_" + file_name + ".qza")


