library(ape)
library(phangorn)
library(tidyverse)
library(reshape2)
library(ggplot2)
library("scales")

seqs <- read.phyDat("aligned_tails.fasta", format = "FASTA", type = "DNA")
metadata <- read.csv("syringae_metadata.csv")
dm  <- dist.dna(as.DNAbin(seqs))
treeUPGMA  <- upgma(dm)
plot(treeUPGMA, main="UPGMA")
dm

treeUPGMA  <- upgma(dm)
plot(treeUPGMA, main="UPGMA")



df <- melt(as.matrix(dm), varnames = c("row", "col"))

df$row <- sub(" .*", "", df$row)
df$col <- sub(" .*", "", df$col)

df_pathovars <- df
df_pathovars$row <- metadata$PATHOVAR[match(df_pathovars$row, metadata$Biosample)]
df_pathovars$col <- metadata$PATHOVAR[match(df_pathovars$col, metadata$Biosample)]

df_species <- df
df_species$row <- metadata$SPECIES[match(df_species$row, metadata$Biosample)]
df_species$col <- metadata$SPECIES[match(df_species$col, metadata$Biosample)]

df_pathovars <- df_pathovars[is.finite(df_pathovars$value),]
df_species <- df_species[is.finite(df_species$value),]

Pathovar_means <- aggregate(value~row+col,data=df_pathovars,mean)
Species_means <- aggregate(value~row+col,data=df_species,mean)

Pathovar_mat = Pathovar_means %>% 
  spread(row, value, fill=0) %>% 
  column_to_rownames(var="col") %>% 
  as.matrix

Species_mat = Species_means %>% 
  spread(row, value, fill=0) %>% 
  column_to_rownames(var="col") %>% 
  as.matrix

plot(Pathovar_mat)


ggplot(data = Species_means, aes(x=row, y=col, fill=value)) + 
  geom_tile() +
  scale_fill_gradientn(colours=c("red",
                                 "yellow", "white"),
                       values=rescale(c(0,0.5,1.6)),
                       guide="colorbar",name = "genetic distance")+
  scale_x_discrete(guide = guide_axis(angle = 90), name = "")+
  scale_y_discrete(name = "")

foo <- cmdscale(Pathovar_mat, k = 3)
plot(-foo)
