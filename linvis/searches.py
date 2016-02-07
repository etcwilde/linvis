from linvis.database import query_db, get_cursor
from flask import request
from datetime import datetime

import linvis.database

################################################
# Breadcrumbs
################################################

q_breadcrumb_tree = """
SELECT cid, mnextmerge, mcidlinus FROM
    pathtomerge
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
            ); """


def get_breadcrumbs(cid):
    items = []
    with get_cursor() as cur:
        cur.execute(q_breadcrumb_tree, {'cid': cid})
        items = [{"cid": mcid,
                  "mcidlinus": mcidlinus,
                  "mnext": mnext} for mcid, mnext, mcidlinus in cur]
    tree_data = {}
    for item in items:
        tree_data[item['cid']] = item

    current_node = cid
    breadcrumbs = [cid]
    while current_node and current_node != "":
        try:
            current_node = tree_data[current_node]['mnext']
            if not current_node:
                break
            breadcrumbs.append(current_node)
        except KeyError:
            current_node = None
    return breadcrumbs[::-1]


################################################
# Date Filters
################################################

# Version Limits

q_get_version_date_limits = \
    """WITH limits AS
(SELECT start_date.comdate AS start_date, end_date.comdate AS release_date FROM
(SELECT commits.cid, comdate, ver FROM commits NATURAL JOIN \
    (SELECT vercid cid, ver FROM releases WHERE ver = %(ver)s) AS a) AS end_date
INNER JOIN
(SELECT commits.cid, comdate, ver FROM commits NATURAL JOIN \
    (SELECT prevrealvercid cid, ver FROM releases WHERE ver=%(ver)s) AS a)\
    AS start_date
ON start_date.ver = end_date.ver)
SELECT start_date AS start, release_date AS end FROM limits;
"""

# q_filter_cids = \
#     """
# SELECT cid, preview, author, autdate, comdate FROM
# logs NATURAL JOIN commits NATURAL JOIN
# pathtomerge WHERE mcidlinus IN (SELECT a.cid FROM commits NATURAL JOIN (
# SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a
# WHERE {0}) {1}
#
# UNION ALL
#
# SELECT DISTINCT commits.cid, preview, author, autdate, comdate FROM
# logs NATURAL JOIN commits JOIN pathtomerge
#     ON pathtomerge.mcidlinus = commits.cid
# WHERE {0} {1};
# """

q_filter_cids = \
    """
SELECT cid, preview, author, autdate, comdate FROM
logs NATURAL JOIN commits NATURAL JOIN
pathtomerge WHERE mcidlinus IN (SELECT a.cid FROM commits NATURAL JOIN (
SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a
WHERE {0}) {1}
"""

def gen_comdate_query(req):
    try:
        comdate_begin = \
            datetime.strptime(request.args.get('commit_date_begin'), "%m/%d/%Y")
    except:
        comdate_begin = None
    try:
        comdate_end = \
            datetime.strptime(request.args.get('commit_date_end'), "%m/%d/%Y")
    except:
        comdate_end = None
        begin = None
        end = None
        with get_cursor() as cur:
            cur.execute(q_get_version_date_limits,
                        {'ver': request.args.get('version')})
            m = cur.fetchone()
            if m:
                begin, end = m
    if not begin:
        begin = comdate_begin
    if not end:
        end = comdate_end
    # Filter down the dates if possible
    if comdate_begin and comdate_begin > begin:
        begin = comdate_begin
    if comdate_end and comdate_end < end:
        end = comdate_end
    if not begin and not end:
        return "TRUE"
    elif not end:
        return "comdate > '{0}'".format(begin)
    elif not begin:
        return "comdate <= '{0}'".format(end)
    return "comdate > '{0}' AND comdate <= '{1}'".format(begin, end)


def gen_autdate_query(req):
    try:
        autdate_begin = \
            datetime.strptime(request.args.get('author_date_begin'), "%m/%d/%Y")
    except:
        autdate_begin = None

    try:
        autdate_end = \
            datetime.strptime(request.args.get('author_date_end'), "%m/%d/%Y")
    except:
        autdate_end = None

    with get_cursor() as cur:
        if autdate_begin and autdate_end:
            q_autdate_range = cur.mogrify(
                "autdate > %(begin)s AND autdate <= %(end)s",
                {'begin': autdate_begin,
                 'end': autdate_end})
        elif autdate_begin:
            q_autdate_range = cur.mogrify('autdate > %(begin)s',
                                          {'begin': autdate_begin})
        elif autdate_end:
            q_autdate_range = cur.mogrify('autdate <= %(end)s',
                                          {'end': autdate_end})
            # "autdate <= '{1}'".format(autdate_end)
        else:
            q_autdate_range = "TRUE"
    print("AUTDATE RANGE:", q_autdate_range)
    return q_autdate_range


################################################
# Search by date
################################################
def search_by_date(comdate_query, autdate_query):
    query = q_filter_cids.format(comdate_query, " AND " + autdate_query +
                                 " AND " + autdate_query)
    return query_db(query)


################################################
# Search by author
################################################
def search_by_author(author_name, comdate_query, autdate_query):
    heading = """SELECT cid, preview, author, autdate, comdate FROM
    logs NATURAL JOIN
    commits NATURAL JOIN
    pathtomerge WHERE mcidlinus IN
    (SELECT a.cid FROM commits NATURAL JOIN (
    SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a WHERE """ + \
    comdate_query + \
    ") AND author LIKE %(author)s AND " + \
    autdate_query + \
    """ UNION ALL
    SELECT DISTINCT commits.cid, preview, author, autdate, comdate FROM
    logs NATURAL JOIN
    commits JOIN pathtomerge
    ON pathtomerge.mcidlinus = commits.cid
    WHERE """ + comdate_query + " AND " + autdate_query + \
        " AND author LIKE %(author)s"

    return query_db(heading, {'author': '%'+author_name+'%'})


################################################
# Search by preview Keyword
################################################
def search_by_preview(keyword, comdate_query, autdate_query):
    heading = """SELECT cid, preview, author, autdate, comdate FROM
    logs NATURAL JOIN
    commits NATURAL JOIN
    pathtomerge WHERE mcidlinus IN
    (SELECT a.cid FROM commits NATURAL JOIN (
    SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a WHERE """ + \
    comdate_query + \
    ") AND preview LIKE %(keyword)s AND " + \
    autdate_query + \
    """ UNION ALL
    SELECT DISTINCT commits.cid, preview, author, autdate, comdate FROM
    logs NATURAL JOIN
    commits JOIN pathtomerge
    ON pathtomerge.mcidlinus = commits.cid
    WHERE """ + comdate_query + " AND " + autdate_query + \
            " AND preview LIKE %(keyword)s"
    return query_db(heading, {'keyword': '%'+keyword+'%'})


################################################
# Search by CID
################################################
def search_by_cid(cid, comdate_query, autdate_query):
    heading = """SELECT cid, preview, author, autdate, comdate FROM
    logs NATURAL JOIN
    commits NATURAL JOIN
    pathtomerge WHERE mcidlinus IN
    (SELECT a.cid FROM commits NATURAL JOIN (
    SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a WHERE """ + \
    comdate_query + \
    ") AND commits.cid LIKE %(cid)s AND " + \
    autdate_query + \
    """ UNION ALL
    SELECT DISTINCT commits.cid, preview, author, autdate, comdate FROM
    logs NATURAL JOIN
    commits JOIN pathtomerge
    ON pathtomerge.mcidlinus = commits.cid
    WHERE """ + comdate_query + " AND " + autdate_query + \
            " AND commits.cid LIKE %(cid)s"

    return query_db(heading, {'cid': cid + '%'})


################################################
# Search Merge mcidlinus Results Only
################################################
q_merge_filter_cids = \
    """
SELECT DISTINCT cid, preview, author, autdate, comdate FROM
logs NATURAL JOIN commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge NATURAL JOIN commits NATURAL JOIN logs
NATURAL JOIN
(SELECT cid FROM commits
    NATURAL JOIN logs
    NATURAL JOIN pathtomerge WHERE mcidlinus IN
(SELECT a.cid FROM commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a WHERE
{0}) {1}) AS C) AS B ORDER BY comdate;
     """

q_merge_date_filter_cids = \
    """
SELECT commits.cid, preview, author, autdate, comdate FROM logs
NATURAL JOIN commits
NATURAL JOIN
    (SELECT a.cid FROM commits NATURAL JOIN
        (SELECT mcidlinus AS CID FROM pathtomerge GROUP BY mcidlinus) AS a
        WHERE {0}) AS a;
"""


################################################
# Search by date
################################################
def merge_search_by_date(comdate_query, autdate_query):
    query = q_merge_date_filter_cids.format(comdate_query)
    return query_db(query)


################################################
# Search by author
################################################
def merge_search_by_author(author_name, comdate_query, autdate_query):
    heading = """
SELECT DISTINCT cid, preview, author, autdate, comdate FROM
logs NATURAL JOIN commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge NATURAL JOIN commits NATURAL JOIN logs
NATURAL JOIN
(SELECT cid FROM commits
    NATURAL JOIN logs
    NATURAL JOIN pathtomerge WHERE mcidlinus IN
(SELECT a.cid FROM commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a WHERE """ +\
    comdate_query + \
    ") AND author LIKE %(author)s AND " + \
    autdate_query + \
    ") AS C) AS B ORDER BY comdate;"
    return query_db(heading, {'author': '%'+author_name+'%'})


################################################
# Search by preview Keyword
################################################
def merge_search_by_preview(keyword, comdate_query, autdate_query):
    heading = """
SELECT DISTINCT cid, preview, author, autdate, comdate FROM
logs NATURAL JOIN commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge NATURAL JOIN commits NATURAL JOIN logs
NATURAL JOIN
(SELECT cid FROM commits
    NATURAL JOIN logs
    NATURAL JOIN pathtomerge WHERE mcidlinus IN
(SELECT a.cid FROM commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a WHERE """ +\
    comdate_query + \
    ") AND preview LIKE %(keyword)s AND " + \
    autdate_query + \
    ") AS C) AS B ORDER BY comdate;"
    return query_db(heading, {'keyword': '%'+keyword+'%'})


################################################
# Search by CID
################################################
def merge_search_by_cid(cid, comdate_query, autdate_query):
    heading = """
SELECT DISTINCT cid, preview, author, autdate, comdate FROM
logs NATURAL JOIN commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge NATURAL JOIN commits NATURAL JOIN logs
NATURAL JOIN
(SELECT cid FROM commits
    NATURAL JOIN logs
    NATURAL JOIN pathtomerge WHERE mcidlinus IN
(SELECT a.cid FROM commits NATURAL JOIN
(SELECT mcidlinus AS cid FROM pathtomerge GROUP BY mcidlinus) AS a WHERE """ +\
    comdate_query + \
    ") AND cid LIKE %(cid)s AND " + \
    autdate_query + \
    ") AS C) AS B ORDER BY comdate;"
    return query_db(heading, {'cid': cid+'%'})
