'''ENTREZ API STUFF'''
import csv
import json
import time
from os import listdir
import entrezpy.conduit
import entrezpy.base.result
import entrezpy.base.analyzer


class Docsum:
    """Simple data class to store individual sequence Docsum records."""

    class Subtype:

        def __init__(self, subtype, subname):
            self.strain = None
            self.host = None
            self.country = None
            self.collection = None
            self.collection_date = None

            for i in range(len(subtype)):
                if subtype[i] == 'strain':
                    self.stain = subname[i]
                if subtype[i] == 'host':
                    self.host = subname[i]
                if subtype[i] == 'country':
                    self.country = subname[i]
                if subtype[i] == 'collection_date':
                    self.collection_date = subname[i]

    def __init__(self, json_docsum):
        self.uid = int(json_docsum['uid'])
        self.caption = json_docsum['caption']
        self.title = json_docsum['title']
        self.extra = json_docsum['extra']
        self.gi = int(json_docsum['gi'])
        self.taxid = int(json_docsum['taxid'])
        self.slen = int(json_docsum['slen'])
        self.biomol = json_docsum['biomol']
        self.moltype = json_docsum['moltype']
        self.topology = json_docsum['topology']
        self.sourcedb = json_docsum['sourcedb']
        self.projectid = int(json_docsum['projectid'])
        self.genome = json_docsum['genome']
        self.subtype = Docsum.Subtype(json_docsum['subtype'].split('|'),
                                      json_docsum['subname'].split('|'))
        self.assemblygi = json_docsum['assemblygi']
        self.assemblyacc = json_docsum['assemblyacc']
        self.tech = json_docsum['tech']
        self.completeness = json_docsum['completeness']
        self.geneticcode = int(json_docsum['geneticcode'])
        self.strand = json_docsum['strand']
        self.organism = self.strand = json_docsum['organism']
        self.strain = self.strand = json_docsum['strain']
        self.biosample = self.strand = json_docsum['biosample']
        self.accessionversion = json_docsum['accessionversion']


class DocsumResult(entrezpy.base.result.EutilsResult):
    """Derive class entrezpy.base.result.EutilsResult to store Docsum queries.
    Individual Docsum records are implemented in :class:`Docsum` and
    stored in :ivar:`docsums`.

    :param response: inspected response from :class:`PubmedAnalyzer`
    :param request: the request for the current response
    :ivar dict docsums: storing Docsum instances"""

    def __init__(self, response, request):
        super().__init__(request.eutil, request.query_id, request.db)
        self.docsums = {}

    def size(self):
        """Implement virtual method :meth:`entrezpy.base.result.EutilsResult.size`
        returning the number of stored data records."""
        return len(self.docsums)

    def isEmpty(self):
        """Implement virtual method :meth:`entrezpy.base.result.EutilsResult.isEmpty`
        to query if any records have been stored at all."""
        if not self.docsums:
            return True
        return False

    def get_link_parameter(self, reqnum=0):
        """Implement virtual method :meth:`entrezpy.base.result.EutilsResult.get_link_parameter`.
        Fetching summary record has no intrinsic elink capabilities and therefore
        should inform users about this."""
        print("{} has no elink capability".format(self))
        return {}

    def dump(self):
        """Implement virtual method :meth:`entrezpy.base.result.EutilsResult.dump`.

        :return: instance attributes
        :rtype: dict
        """
        return {self: {'dump': {'docsum_records': [x for x in self.docsums],
                                'query_id': self.query_id, 'db': self.db,
                                'eutil': self.function}}}

    def add_docsum(self, docsum):
        """The only non-virtual and therefore DocsumResult-specific method to handle
        adding new data records"""
        self.docsums[docsum.uid] = docsum


class DocsumAnalyzer(entrezpy.base.analyzer.EutilsAnalyzer):
    """Derived class of :class:`entrezpy.base.analyzer.EutilsAnalyzer` to analyze and
    parse Docsum responses and requests."""

    def __init__(self):
        super().__init__()

    def init_result(self, response, request):
        """Implemented virtual method :meth:`entrezpy.base.analyzer.init_result`.
        This method initiate a result instance when analyzing the first response"""
        if self.result is None:
            self.result = DocsumResult(response, request)

    def analyze_error(self, response, request):
        """Implement virtual method :meth:`entrezpy.base.analyzer.analyze_error`. Since
        we expect JSON, just print the error to STDOUT as string."""
        print(json.dumps({__name__: {'Response': {'dump': request.dump(),
                                                  'error': response}}}))

    def analyze_result(self, response, request):
        """Implement virtual method :meth:`entrezpy.base.analyzer.analyze_result`.
        The results is a JSON structure and allows easy parsing"""
        self.init_result(response, request)
        for i in response['result']['uids']:
            self.result.add_docsum(Docsum(response['result'][i]))


c = entrezpy.conduit.Conduit('myemail')


def Nuc2Biosample(nuc_ID):
    import time
    chunks = [nuc_ID[x:x+500] for x in range(0, len(nuc_ID), 500)]
    results = {}
    count = 1
    for chunk in chunks:
        data = ','.join(chunk)
        fetch_docsum = c.new_pipeline()
        sid = fetch_docsum.add_search({'db': 'nuccore', 'term': data})
        fetch_docsum.add_summary({'rettype': 'docsum', 'retmode': 'json'},
                                 dependency=sid, analyzer=DocsumAnalyzer())
        docsums = c.run(fetch_docsum).get_result().docsums

        # return(docsums[i].biosample)
        chunkCount = 0
        for i in docsums:
            if docsums[i].biosample not in results:
                results[docsums[i].biosample] = [docsums[i].accessionversion[:-2]]
            else:
                results[docsums[i].biosample].append(
                    docsums[i].accessionversion[:-2])

            # print(docsums[i].biosample,docsums[i].organism)
            chunkCount += 1
        print(f'chunk {count} of {len(chunks)} done!')
        count += 1
        time.sleep(0)
    return(results)