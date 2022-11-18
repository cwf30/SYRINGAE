#!/usr/bin/env python
import sys
from Bio import Align
aligner = Align.PairwiseAligner()
aligner.mode = "local"
alignments = aligner.align(sys.argv[1], sys.argv[2])
print(alignments[1])