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
# Search Form
################################################

from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

class SearchForm(FlaskForm):
    query = StringField('query', validators=[DataRequired()])

# Doesn't do anything fancy yet
def queryParser(query):
    return query


# Query for searching
q_ranked_search = """
SELECT
    ranking.rank,
    pathtomerge.mcidlinus,
    commits.cid,
    commits.author,
    commits.autdate,
    commits.comdate,
    logs.preview
FROM
    (
    SELECT
        cid,
        (ts_rank(tsv, q) + ts_rank_cd(tsv, q)) AS rank
    FROM
        search,
        plainto_tsquery(%(query)s) AS q
    WHERE
        (tsv @@ q)
    ) AS ranking
NATURAL JOIN
    logs
NATURAL JOIN
    commits
LEFT JOIN
    pathtomerge
    ON commits.cid = pathtomerge.cid
GROUP BY
    pathtomerge.mcidlinus,
    commits.cid,
    ranking.rank,
    logs.preview;
"""

def performSearch(terms):
    results = query_db(q_ranked_search, {'query': '%'+terms+'%'})
    return results
