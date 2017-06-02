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
        commit_tree = None
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
                               preview=commit_log_preview,
                               tree=commit_tree)


# TODO: Simplify this
@app.route('/search')
def search():
    version = request.args.get('version')
    if version:  # Query made
        # Get cids between those dates
        results = []
        if 'version' not in session or session['version'] != version:
            session['version'] = version
        search_type = request.args.get('search-type')
        search_term = request.args.get('search-text')
        comdate_query = linvis.searches.gen_comdate_query(request)
        autdate_query = linvis.searches.gen_autdate_query(request)
        if search_type == "Author" and search_term:
            if request.args.get('merges'):
                results = linvis.searches.merge_search_by_author(
                    search_term,
                    comdate_query,
                    autdate_query)
            else:
                results = linvis.searches.search_by_author(
                    search_term,
                    comdate_query,
                    autdate_query)
        elif search_type == "Commit ID" and search_term:
            if request.args.get('merges'):
                results = linvis.searches.merge_search_by_cid(
                    search_term,
                    comdate_query,
                    autdate_query)
            else:
                results = linvis.searches.search_by_cid(
                    search_term,
                    comdate_query,
                    autdate_query)
        elif search_type == "Log Keyword" and search_term:
            if request.args.get('merges'):
                results = linvis.searches.merge_search_by_preview(
                    search_term,
                    comdate_query,
                    autdate_query)
            else:
                results = linvis.searches.search_by_preview(
                    search_term,
                    comdate_query,
                    autdate_query)
        elif not search_term:
            if request.args.get('merges'):
                results = linvis.searches.merge_search_by_date(
                    comdate_query,
                    autdate_query)
            else:
                results = linvis.searches.search_by_date(
                    comdate_query,
                    autdate_query)
        else:
            pass
        # Results format:
        # (cid, preview, author date, commit date, files changed)
        if results:
            results = [{
                'cid': c,
                'preview': p,
                'author': a,
                'aut_date': ad.date().strftime("%m/%d/%Y"),
                'com_date': cd.date().strftime("%m/%d/%Y")}
                for c, p, a, ad, cd in results]
        return render_template("search_results.html", results=results)
    else:
        # Grab all items are stip out the tuple
        releases = [item[0] for item in
                    query_db("SELECT ver FROM releases WHERE not candidate;")]
        # Sort the releases in release order
        # Remove the decimal point and convert to an int
        # If Linux ever gets into release 10.x, this sort method will not work
        # correctly 10.1 < 3.10
        releases.sort(key=lambda x: int(x.split()[1].replace(".", "")))
        if 'version' in session:
            ver = session['version']
        else:
            ver = None
        return render_template("search.html", releases=releases[1:],
                               version=ver)


@app.route('/')
def index():
    return redirect(url_for('search'))
