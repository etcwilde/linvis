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

/*
 * Handles the raw data for the files
 */
var processFiles = function(data, callback) {
    let fileData = {};
    readTree(data, function(c){
        for (var file in c.files) {
            let fname = c.files[file][0],
                added = c.files[file][1],
                removed = c.files[file][2];
            if (fname == null) continue;
            if (fname in fileData) {
                fileData[fname].added += added;
                fileData[fname].removed += removed;
                fileData[fname].cids.push({'cid': c.cid, 'added': added, 'removed': removed});
            } else {
                fileData[fname] = {'fname': fname, 'added': added, 'removed': removed, 'cids': [{'cid': c.cid, 'added': added, 'removed': removed}]};
            }
        }
    });
    callback(fileData);
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

var processModules = function(data, callback) {
    let moduleData = {};
    readTree(data, function(c){
        let module = c.module;
        if (module === null || module == "") return
        if (module in moduleData) {
            moduleData[module].count++;
            moduleData[module].cids.push(c.cid);
        } else moduleData[module] = {'module': module, 'count': 1, 'cids': [c.cid]};
    });
    callback(moduleData);
}
