/*
 * Evan Wilde <etcwilde@uvic.ca>
 * May 13, 2017
 */

/*
 * Basic Request handler
 *
 * requests: url, success || error, [notify]
 *
 * Request require a url, and either a success or error callback
 *         optionally take a notify function which will always fire on completion
 *
 */
var request = function(req) {
    if (req === undefined || req.url == undefined) return; // nothing to get
    if (req.success == undefined && req.error == undefined) return; // Nothing to do
    $.get(req.url)
        .done(req.success)
        .fail(req.error)
        .always(req.notify);
}

// TODO: handle some caching

/*
 * Get actions
 */

// Tree
var getTree = function(cid, callback) {
    if (cid == undefined || callback == undefined) return;
    let req = {
        url: "/data/tree/JSON/" + cid,
        success: function(data) { callback(jQuery.parseJSON(data)); },
        error: console.error };
    request(req);
}

// Files
var getFiles = function(cid, callback) {
    if (cid == undefined || callback == undefined) return;
    let req = {
        url: "/data/files/JSON/" + cid,
        success: function(data) { callback(jQuery.parseJSON(data)); },
        error: console.error};
    request(req);
}


// Authors
var getAuthors = function(cid, callback) {
    if (cid == undefined || callback == undefined) return;
    let req = {
        url: "/data/authors/JSON/" + cid,
        success: function(data) { callback(jQuery.parseJSON(data)); },
        error: console.error};
    request(req);
}

// Modules
var getModules = function(cid, callback) {
    if (cid == undefined || callback == undefined) return;
    let req = {
        url: '/data/modules/JSON/' + cid,
        success: function(data) { callback(jQuery.parseJSON(data));},
        error: console.error};
    request(req);
}
