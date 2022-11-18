from Bio import SeqIO
from Bio.Emboss.Applications import FDNADistCommandline
#SeqIO.convert("CTS_aligned.fasta", "fasta",
#              "CTS_aligned.phy", "phylip-relaxed")
test = FDNADistCommandline(
    cmd='fdnadist', method="k", gamma=1, sequence="CTS_aligned.phy", outfile="CTS_DistMatrix.txt")
test()
