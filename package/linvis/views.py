from linvis import app
from linvis.database import query_db
from flask import render_template
from flask import request
from flask import flash
from flask import redirect, url_for
from flask import session

import linvis.searches
import linvis.commit_page

@app.route('/artifact')
def artifact():
    return render_template('artifact.html')


@app.route('/commits/<cid>', methods=['GET', 'POST'])
@app.route('/commits/', methods=['GET', 'POST'])
def get_cid(cid=None):
    if not cid:
        return redirect('/')
    if request.method == 'POST':
        return redirect('commits/{0}'.format(request.form['cid']))
    if request.method == 'GET':
        commit_log_preview = ""
        breadcrumbs = None

        if cid is None:
            flash("cid: {0} Does not exist".format(cid), 'danger')
            return render_template("commits.html")
        try:
            commit_log_preview = query_db("SELECT preview FROM logs WHERE\
                                          cid='{0}';".format(cid))[0][0]
        except IndexError:  # no query found
            flash("cid: {0} Does not exist".format(cid), 'danger')
            return render_template("commits.html")
        except TypeError:
            flash("Could not fetch commit {0} ".format(cid), 'danger')
            return render_template("commits.html")

        breadcrumbs = linvis.searches.get_breadcrumbs(cid)
        return render_template("commits.html",
                               cid=cid,
                               breadcrumbs=breadcrumbs,
                               preview=commit_log_preview)


@app.route('/search', methods=['GET', 'POST'])
def search():
    form = linvis.searches.SearchForm(request.form)
    if form.validate_on_submit():
        parsed_query = linvis.searches.queryParser(form.query.data)
        results = linvis.searches.performSearch(parsed_query)
        if results:
            roots = {m for _, m, _, _, _, _, _ in results if m}
            if len(roots):
                roots = "cid = " + ' OR cid = '.join(("'"+x+"'" for x in roots if x))
                q = "SELECT cid, preview, author, comdate FROM commits NATURAL JOIN logs WHERE " + roots + ";"
                roots = query_db(q)
                roots = {c: [p, a, cd.date().strftime('%m/%d/%Y')] for c, p, a, cd in roots}
            else:
                roots = None

            results = [{
                'rank': r,
                'mcid': m,
                'cid': c,
                'preview': p,
                'author': a,
                'aut_date': ad.date().strftime('%m/%d/%Y'),
                'com_date': cd.date().strftime('%m/%d/%Y')}
                for r, m, c, a, ad, cd, p in results ]

            return render_template('search_results.html', results=(roots, results))
        else:
            flash('"' + form.query.data + '" returned no results', 'info')
    return render_template('search.html', form=form)


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')
