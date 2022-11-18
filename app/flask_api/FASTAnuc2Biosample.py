import entrez
from Bio import SeqIO

oldLabels = []
infile = SeqIO.parse("CTS_amplicons.fna", "fasta")
for record in infile:
    oldLabels.append(record.id.split(".")[1])

for i in range(len(oldLabels)):
    oldLabels[i] = oldLabels[i][1:]
    if len(oldLabels[i]) > 1:
        if oldLabels[i][:3] == 'NZ_':
            oldLabels[i] = oldLabels[i][3:]

        '''stripping nucIDs back to same format'''
        #all numbers need to be zero to interface w/ API correctly
        if len(oldLabels[i]) == 15:
            oldLabels[i] = oldLabels[i][:6]+'000000000'
        if len(oldLabels[i]) == 12:
            oldLabels[i] = oldLabels[i][:4]+'00000000'
print(oldLabels)
biosampleIDs = entrez.Nuc2Biosample(oldLabels)

with open("CTS_amplicons.fna") as original, open('CTS_amplicons_biosample.fasta', 'w') as corrected:
    records = SeqIO.parse(original, 'fasta')
    for record in records:
        oldLabel = record.id.split(".")[1]
        oldLabel = oldLabel[1:]
        if len(oldLabel) > 1:
            if oldLabel[:3] == 'NZ_':
                oldLabel = oldLabel[3:]

            '''vvv hacky fixing of weirdness in data found vvv'''
            if len(oldLabel) == 15:
                oldLabel = oldLabel[:6]+'000000000'
            if len(oldLabel) == 12:
                oldLabel = oldLabel[:4]+'00000000'
        for key, value in biosampleIDs.items():
            if oldLabel in value:
                record.id = key
                if record.seq[:3] == "ATC":
                    record = record.reverse_complement(id=True, name=True, description=True, features=True)
                print(record)
                SeqIO.write(record, corrected, "fasta")
                break
