/*
 * Evan Wilde <etcwilde@uvic>
 * May 14, 2017
 */

/*
 * Visitor method for the tree
 *
 * Visits each node of the tree with the operation parameter
 */
var readTree = function(tree, operation) {
    let commit_list = [];
    let remaining_el = [tree];
    while (remaining_el.length > 0) {
        let el = remaining_el.shift();
        operation(el);
        for (var c in el.children) { remaining_el.push(el.children[c]); }
    }
}

/*
 * Get the base of the tree
 */
var getBase = function(tree, callback) {
    var root = tree;
    let remaining_el = crumbs.slice();
    remaining_el.shift();
    while (remaining_el.length>0) root = root['children'][remaining_el.shift()];
    callback(root);
}

/*
 * Creates breadcrumbs for a given tree from a given commit
 */
var getCrumbs = function(tree, cid, callback) {
    var breadcrumbs = [];
    let commit_list = [];
    readTree(tree, function(c){ commit_list.push(c.cid);});
    crumbTree = new RadixTree();
    commit_list.forEach(function(cv) {crumbTree.add(cv);});
    crumbs.forEach(function(cv){breadcrumbs.push([cv, crumbTree.find(cv).prefix]);});
    callback(breadcrumbs);
}

var processFiles = function(base) {
    console.log(data);
}

/*
 * Handles the information for the authors of the tree
 */
var processAuthors = function(base, data, callback) {
    let authKeys = {};
    readTree(base, function(c) {
        let key = c.cid;
        if (key in data && data[key].author in authKeys) {
            let auth = data[key].author;
            authKeys[auth].added += data[key].added;
            authKeys[auth].removed += data[key].removed;
            authKeys[auth].files.push({'cid': data[key].cid, 'fname': data[key].fname, 'added': data[key].added, 'removed': data[key].removed});
        } else if (key in data) {
            let auth = data[key].author;
            authKeys[auth] = data[key];
            authKeys[auth].files = [{'cid': data[key].cid, 'fname': data[key].fname, 'added': data[key].added, 'removed': data[key].removed}];
            delete authKeys[auth].cid;
            delete authKeys[auth].fname;
        }
    });
    callback(authKeys);
}
