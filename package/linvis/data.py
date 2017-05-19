from linvis import app
from linvis.database import query_db, get_cursor
import json


#######################################
# For asynchronous data getting
#######################################


#######################################
# Tree View
#######################################

# Format:
#   name: Preview
#   cid: cid
#   author: author
#   count: number of leaves
#   children: [...]

q_tree = """
SELECT cid, mnextmerge, mcidlinus, preview, author, autdate, comdate FROM
    pathtomerge NATURAL JOIN
    commits NATURAL JOIN logs
    WHERE mcidlinus =
        (SELECT CASE WHEN EXISTS
            (SELECT mcidlinus FROM pathtomerge
                WHERE cid = %(cid)s
            )
        THEN
            (SELECT mcidlinus FROM pathtomerge
                WHERE cid = %(cid)s
            )
        ELSE %(cid)s END
        )
    UNION
        (SELECT cid, NULL, NULL, preview, author, autdate, comdate FROM commits
            NATURAL JOIN logs
            WHERE cid = (
                SELECT CASE WHEN EXISTS
                    (SELECT mcidlinus FROM pathtomerge WHERE
                        cid = %(cid)s
                    )
                    THEN
                    (SELECT mcidlinus AS cid FROM pathtomerge
                    WHERE cid = %(cid)s
                    )
                    ELSE %(cid)s
                    END
                )
        );
"""


@app.route('/data/tree/JSON/<cid>')
def get_tree_data(cid):

    items = []
    with get_cursor() as cur:
        cur.execute(q_tree, {'cid': cid})
        items = [{"name": preview,
                  "cid": mcid,
                  "author": author,
                  "mnext": mnext,
                  "mlinus": mlinus,
                  "children": None}
                 for mcid, mnext, mlinus, preview, author, comdate, autdate in
                 cur]

    tree_data = {}
    for item in items:
        tree_data[item['cid']] = item

    root = None
    for item in tree_data:
        if tree_data[item]['mnext']:
            if tree_data[tree_data[item]['mnext']]['children'] is None:
                tree_data[tree_data[item]['mnext']]['children'] = {}
            tree_data[tree_data[item]['mnext']]['children'][item] = \
                tree_data[item]
        else:
            root = tree_data[item]
    return json.dumps(root)



q_filedata = """
SELECT    pathtomerge.cid,
          mnextmerge,
          mcidlinus,
          author,
          file,
          added,
          removed
FROM      pathtomerge
FULL JOIN filesmod
ON        pathtomerge.cid = filesmod.cid
LEFT JOIN commits
ON commits.cid = filesmod.cid
WHERE     mcidlinus =
          (
                 SELECT
                        CASE
                               WHEN EXISTS
                                      (
                                             SELECT mcidlinus
                                             FROM   pathtomerge
                                             WHERE  cid = %(cid)s ) THEN
                                      (
                                             SELECT mcidlinus
                                             FROM   pathtomerge
                                             WHERE  cid = %(cid)s )
                               ELSE %(cid)s
                        END )
   UNION
         (
                SELECT cid,
                       NULL,
                       NULL,
                       NULL,
                       NULL,
                       NULL,
                       NULL
                FROM   commits
                WHERE  cid =
                       (
                              SELECT
                                     CASE
                                            WHEN EXISTS
                                                   (
                                                          SELECT mcidlinus
                                                          FROM   pathtomerge
                                                          WHERE  cid = %(cid)s ) THEN
                                                   (
                                                          SELECT mcidlinus AS cid
                                                          FROM   pathtomerge
                                                          WHERE  cid = %(cid)s )
                                            ELSE %(cid)s
                                     END ) );
              """

@app.route('/data/files/JSON/<cid>')
def get_files(cid):
    items = []
    with get_cursor() as cur:
        cur.execute(q_filedata, {'cid': cid})
        items = [{"fname": fname,
                  "added": added,
                  "removed": removed,
                  "cid": mcid,
                  "mnext": mnext,
                  "mlinus": mlinus}
                 for mcid, mnext, mlinus, _, fname, added, removed in cur]

    # Initialize Tree structure
    tree_data = {}
    for item in items:
        if item['cid'] in tree_data:
            tree_data[item['cid']]['files'].append((item['fname'],
                                                    item['added'],
                                                    item['removed']))
        else:
            tree_data[item['cid']] = {"cid": item['cid'],
                                      "mnext": item['mnext'],
                                      "children": [],
                                      "files": [(item['fname'],
                                                 item['added'],
                                                 item['removed'])]}
    # Build tree
    for item in tree_data:
        if tree_data[item]['mnext']:
            if tree_data[tree_data[item]['mnext']]['children'] is None:
                tree_data[tree_data[item]['mnext']]['children'] =\
                    [tree_data[item]]
            else:
                tree_data[tree_data[item]['mnext']]['children']\
                    .append(tree_data[item])
    return json.dumps(tree_data[cid])


@app.route('/data/authors/JSON/<cid>')
def get_authors(cid):
    items = []
    with get_cursor() as cur:
        cur.execute(q_filedata, {'cid': cid})
        items = [{"fname": fname,
                  "author": author,
                  "added": added,
                  "removed": removed,
                  "cid": mcid}
                 for mcid, mnext, mlinus, author, fname, added, removed in cur]
    return json.dumps([item for item in items if item['fname'] is not None])

q_moddata = """
SELECT pathtomerge.cid, mnextmerge, mcidlinus, preview FROM
pathtomerge FULL JOIN logs ON pathtomerge.cid = logs.cid
WHERE mcidlinus = (SELECT CASE WHEN EXISTS
(SELECT mcidlinus FROM pathtomerge WHERE cid = %(cid)s)
THEN
(SELECT mcidlinus FROM pathtomerge WHERE cid = %(cid)s)
ELSE %(cid)s END)
UNION
(SELECT cid, NULL, NULL, NULL FROM commits WHERE cid = (
SELECT CASE WHEN EXISTS
(SELECT mcidlinus FROM pathtomerge WHERE cid = %(cid)s)
THEN (SELECT mcidlinus AS cid FROM pathtomerge WHERE cid = %(cid)s)
ELSE %(cid)s END));
"""

def get_mod_name(preview):
    if preview is None:
        return None
    mod = preview.split(":")[0]
    if "Merge" in mod:
        return None
    return mod


@app.route('/data/log/<cid>')
def get_log(cid):
    return query_db("SELECT \"full\" FROM logs WHERE cid = %(cid)s;",
                    {'cid': cid})[0][0]


@app.route('/data/modules/JSON/<cid>')
def get_module(cid):
    items = []
    with get_cursor() as cur:
        cur.execute(q_moddata, {'cid': cid})
        items = [{"mname": get_mod_name(mname),
                  "cid": mcid,
                  "mnext": mnext,
                  "mlinus": mlinus}
                 for mcid, mnext, mlinus, mname in cur]
    tree_data = {}
    for item in items:
        tree_data[item['cid']] = {'cid': item['cid'],
                                  'mnext': item['mnext'],
                                  'children': [],
                                  'module': item['mname']}

    # Build tree
    for item in tree_data:
        if tree_data[item]['mnext']:
            if tree_data[tree_data[item]['mnext']]['children'] is None:
                tree_data[tree_data[item]['mnext']]['children'] =\
                    [tree_data[item]]
            else:
                tree_data[tree_data[item]['mnext']]['children']\
                    .append(tree_data[item])
    return json.dumps(tree_data[cid])

@app.route('/data/releases')
def get_releases():
    with get_cursor() as cur:
        cur.execute("SELECT ver, ver.autdate as \"End Date\", prevrealver, prev.autdate AS \"Start Date\" FROM releases JOIN (SELECT cid, autdate FROM commits) AS ver ON vercid=ver.cid JOIN (SELECT cid, autdate FROM commits) AS prev ON prevrealvercid=prev.cid WHERE not candidate ORDER BY ver;")
        items = [{'ver': ver,
                  'start': str(start.date()),
                  'end': str(end.date())}
                 for ver, end, _, start in cur]
        return json.dumps(items)

@app.route('/data/releases/<rel>')
def get_release(rel):
    items = []
    with get_cursor() as cur:
        cur.execute("SELECT ver, ver.autdate as end, prevrealver, prev.autdate AS start FROM releases JOIN (SELECT cid, autdate FROM commits) AS ver ON vercid = ver.cid JOIN (SELECT cid, autdate FROM commits) AS prev on prevrealvercid = prev.cid WHERE ver = 'Linux 3.1';")
        items = [{'ver': ver,
                  'start': str(start.date()),
                  'end': str(end.date())}
                 for ver, end, _, start in cur]
        return json.dumps(items)

@app.route('/data/commits')
def get_commits():
    with get_cursor() as cur:
        cur.execute("SELECT preview, cid, author ,comdate FROM logs NATURAL JOIN commits;")
        items = [{"preview": preview,
                  "cid": cid,
                  "author": author,
                  "comdate": str(comdate.date())}
                 for preview, cid, author, comdate in cur]
        # items = [{"preview": "Test",
        #           "cid": "12345",
        #           "author": "Evan Wilde <etcwilde@uvic.ca>",
        #           "comdate": "Today"}]
        o = {"data": items[0:500]}
        # print(o)
        return json.dumps(o)
    # print("getting commits")
    # return "hello, from the server"
    # "#SELECT * FROM commits
