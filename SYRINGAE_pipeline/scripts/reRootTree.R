install.packages("phytools")
library(phytools)
library(ape)

tree <- read.newick(file="/Users/cwf30/Desktop/Code/SARE_APP\ copy/react_ui/public/HIGH_QUALITY_TREE")

PaO1_root <- c("GCF_000006765.1","GCF_016028655.1")
PaO1_node <- findMRCA(tree, tips=PaO1_root, type="node")

tree <- reroot(tree, PaO1_node, position=0.5*tree$edge.length[which(tree$edge[,2]==18)], interactive=FALSE)

ape::write.tree(tree, file='/Users/cwf30/Desktop/Code/flava_rooted_PSSC_tree.txt')

tree_no_root <- ape::drop.tip(tree, c("GCF_000006765.1","GCF_016028655.1"), trim.internal=TRUE)

ape::write.tree(tree_no_root, file='/Users/cwf30/Desktop/Code/Dissertation/treeWAS/PSSC_tree_root_nodes_removed.txt')
