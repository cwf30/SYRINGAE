library(dplyr)
library(tidygenomes)
dist <- read_phylip_distmat('/Users/cwf30/Desktop/Code/SARE_APP/flask_api/CTS_Dist.distmat')
filteredDist <- dplyr::filter(dist, !grepl('_PG', sequence_2))
filteredDist <- dplyr::filter(filteredDist, grepl('_PG', sequence_1))
sliced <- group_by(filteredDist, sequence_2) %>% slice_min(order_by = distance)
sliced$PG <- sub(".*_PG", "", sliced$sequence_1) 
sliced$PG[which(sliced$distance > 6)] = "> 6% ANI"
sliced <- sliced %>% 
  rename(
    Biosample = sequence_2)

meta <- read.csv("/Users/cwf30/Desktop/Code/SARE_APP/flask_api/syringae_metadata.csv")
meta <- subset(meta, select = -c(PG))
meta_new <- merge(x = meta, y = sliced[ , c("PG", "Biosample")], by = "Biosample", all.x=TRUE)
meta_new <- unique(meta_new)
meta_new <- meta_new %>% 
  rename(
    name = OTUID)
meta_new <-meta_new %>% mutate_all(~replace(., is.na(.), "Missing Data"))
write.csv(meta_new, "/Users/cwf30/Desktop/Code/SARE_APP/d3-tree-component/public/syringae_metadata.csv",row.names = FALSE)
sort(unique(meta_new$PG))
