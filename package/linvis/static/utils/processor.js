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
        if (operation !== undefined) operation(el);
        if (el.children == undefined) continue;
        else if (Object.prototype.toString.call(el.children) === '[object Array]') remaining_el = remaining_el.concat(el.children);
        else { for (var c in el.children) { remaining_el.push(el.children[c]); } }
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
        // Oh for the love of all things holy
        for (var i in data) {
            let entry = data[i];
            let id = entry.cid;
            if (id != key) { continue; }
            let author = entry.author
                added = entry.added
                removed = entry.removed;

            if (author in authKeys) {
                authKeys[author].added += entry.added;
                authKeys[author].removed += entry.removed;
                authKeys[author].files.push({'cid': entry.cid, 'fname': entry.fname, 'added': entry.added, 'removed': entry.removed});
            } else {
                authKeys[author] = entry;
                authKeys[author].files = [{'cid': entry.cid, 'fname': entry.fname, 'added': entry.added, 'removed': entry.removed}];
                delete authKeys[author].cid;
                delete authKeys[author].fname;
            }
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
