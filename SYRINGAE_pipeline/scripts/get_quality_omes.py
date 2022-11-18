import csv
import shutil
import os

#import batch_summary.tsv tsv file
with open('../../data/BUSCO_output/batch_summary.txt', newline='', encoding='utf-8-sig') as csvfile:
    quality_genomes = []
    reader = csv.DictReader(csvfile, delimiter='\t')
    #for each row in the tsv file, if 'Complete' is greater than or equal to 99, add the first column value to the quality_genomes list
    for row in reader:
        if float(row['Complete']) >= 99:
            #append the first 15 characters of the first column value to the quality_genomes list
            quality_genomes.append(row['Input_file'][:15])
    #for genome in quality_genomes, copy any file containing the genome to the high_quality_genomes folder
    for genome in quality_genomes:
        for file in os.listdir('NCBI_downloaded_genomes'):
            if genome in file:
                shutil.copy("NCBI_downloaded_genomes/" + file, '../../data/high_quality_genomes')
        for file in os.listdir('NCBI_downloaded_proteomes'):
            if genome in file:
                shutil.copy("NCBI_downloaded_proteomes/" + file, '../../data/high_quality_proteomes')