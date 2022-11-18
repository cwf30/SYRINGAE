pipeline steps:

Get genome and proteome databases
1) download syringae genomes from NCBI (must be refseq accessions for automated pipelines to work)

*** Create and activate conda environment with included .yml file ***

BUSCO quality check
*NOTE: as of June 2022, ROAR's anaconda version is 4.8.3, but 4.8.4 is needed to install busco through conda. you can install busco manually with (install_busco.py)
2) run busco and filter out low quality genomes (score < 99) (busco.PBS)
	output -> data/high_quality_genomes & data/high_quality_proteomes

Build Tree
*NOTE: if this is the first time running GTDB-tk, you need to manually download the reference data somewhere with lots of free space (~66gb), and tell GTDB-tk where it's at like so:
	$ echo "export GTDBTK_DATA_PATH=/path/to/unarchived-data/" > /path/to/SYRINGAE/etc/conda/activate.d/gtdbtk.sh 
		{hint: find /path/to/SYRINGAE/ by typing 'which gtdbtk } 

	My command as of June 2022 looks like this:
	
	$ echo "export GTDBTK_DATA_PATH=/gpfs/group/efc5279/default/ryan/gtdbtk_db/release202" > ~/.conda/envs/SYRINGAE/etc/conda/activate.d/gtdbtk.sh

1) run gtdb-tk on all high quality genomes to get alignment (scripts/ROAR/GTDBTK.PBS)
2) build tree from GTDB-tk alignment with fasttree2 (scripts/ROAR/FastTree2.PBS)
3) re-root at outgroup (scripts/reRootTree.R)

Virulence factor HMM search
1) run HMMER (scripts/ROAR/HMMERsearch.PBS)

Calculate ANI values
1) calculate ANI values with fastANI (scripts/ROAR/fastANI.pbs - this is VERY slow (weeks w/ 40 nodes), maybe replace with sourmash)


Build metadata file (and other things along the way)
1) get basic metadata (scripts/GetMetadatafromNCBI.py)
2) summarize HMMER results in easy to parse JSON files & add HMMER results to metadata file (scripts/HMMERTablesToCSV.py)
1.5) build ANI matrix (scripts/convertFastANI.py)
2) cluster LIN groups from ANI and add to metadata file (scripts/LINgroupfromANI_matrix.py)

3) with help of ANI matrix and phylogroup reference file, add phylogroups to metadata (scripts/assign_phylogroups.py)

In-silico PCR
1) run PCR on all genomes for all supported primers [change supported primers at data/allPSSCprimers.txt] (scripts/ROAR/PCR_perl.PBS)
2) process PCR results to build FASTA files for each primer set (scripts/processPCRresults.py)

Train classifiers
scripts/train_classifiers.py
 
Build protein and isolate databases used for search functionality
scripts/makeJSONfilesfromproteins.py
 
