from linvis.database import query_db
from collections import Counter

q_sub_list = "SELECT logs.cid, logs.preview, ismerge FROM \
    (logs RIGHT JOIN (commits NATURAL JOIN \
        (SELECT cid FROM pathtomerge WHERE mnextmerge='{0}') AS path \
            ) on logs.cid = commits.cid);"

q_items_select = "SELECT preview, author FROM logs NATURAL JOIN commits\
    WHERE cid = '{0}';"


q_get_file_data = "SELECT file, added, removed, abs(added - removed)\
AS delta FROM filesmod WHERE cid = '{0}'\
ORDER BY delta DESC, added, removed, file;"


def isMerge(commit_id):
    return query_db("SELECT ismerge FROM commits WHERE cid = '{0}';\
            ".format(commit_id))[0][0]


def merge_file_dictionaries(d1, d2):
    for f in d1:
        try:
            (fadd, frem, fdelta) = d2[f]
            d1[f] = (d1[f][0] + fadd,
                     d1[f][1] + frem,
                     d1[f][2] + fdelta)
        except:
            pass
    for f in d2:
        try:
            (fadd, frem, fdelta) = d1[f]
        except:
            d1[f] = d2[f]
    return d1


#######################################
# Tree View
#######################################

# Desired Schema
#
# { "name" : "linux",
#   "children" : [
#       {   "name" : "cid",
#           "preview" : "preview",
#           "author" : "author",
#           "count" : "# of leaf nodes on subtree",
#           "children" : [ ... ]
#       }
#   ]
# }
#

def get_tree(cid):
    output = {"name": None,
              "cid": cid,
              "author": None,
              "children": []}
    output["name"], output["author"] = \
        query_db(q_items_select.format(cid))[0]
    for child in query_db("SELECT cid FROM pathtomerge WHERE mnextmerge='{0}';"
                          .format(cid)):
        if child:
            output['children'].append(get_tree(child[0]))

    if len(output['children']) == 0:
        output.pop('children', None)
    return output


def get_list_tree(cid):
    results = query_db(q_sub_list.format(cid))
    ret_list = []
    for cid, preview, ismerge, in results:
        ret_list.append({'cid': cid, 'preview': preview})
        if ismerge:
            ret_list.append(get_list_tree(cid))
    return ret_list


#######################################
# Modules
#######################################
def get_sub_merges_logs(commit_id):
    results = query_db("SELECT cid, preview, ismerge FROM (logs NATURAL JOIN \
                       commits NATURAL JOIN (SELECT cid FROM pathtomerge\
                       WHERE mnextmerge = '{0}') AS path)".format(commit_id))
    ret_list = []
    for cid, log, ismerge in results:
        ret_list.append((cid, log))
        if ismerge:
            ret_list.append(get_sub_merges_logs(cid))
    return ret_list


def get_recursive_merge_modules(cids):
    modules = Counter({})
    for item in cids:
        if type(item) is list:
            modules = modules + get_recursive_merge_modules(item)
        else:
            mod = item[1].split(":")[0]
            if "Merge" in mod:
                continue
            try:
                modules[mod] = modules[mod] + 1
            except:
                modules[mod] = 1
    return modules


def get_merge_modules(commit_id):
    if isMerge(commit_id):
        modules = get_recursive_merge_modules(get_sub_merges_logs(commit_id))
        modules = [(i, modules[i]) for i in modules]
        modules.sort(key=lambda x: x[1])
        return modules[::-1]
    else:
        return[(query_db("SELECT preview FROM logs WHERE cid='{0}';\
                         ".format(commit_id))[0][0].split(":")[0], 1)]
