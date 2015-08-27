var _ = require('lodash'),
    async = require('async'),
    Base = {};

/**
 * Get objects by id list
 * @param  {Array}   ids
 *         id list
 * @param  {Function}   getObjectsByIds
 *         The function which uses get objects by ids from data provider
 * @param  {Function}   getIdFromObject
 *         Get object's id property. e.g. `return user.id;`
 * @param  {Function} callback
 *         Return error or objects
 */
Base.getObjectsByIds = function(ids, getObjectsByIds, getIdFromObject, callback) {
    if (arguments.length == 3) {
        callback = getIdFromObject;
        getIdFromObject = null;
    }

    getObjectsByIds(ids, function(err, results) {
        if (err) {
            return callback(err);
        }
        var objectMap = {};
        var objects = [];
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var id = getIdFromObject ? getIdFromObject(result) : result.id;
            objectMap[id] = result;
        }

        // order by ids
        for (var j = 0; j < ids.length; j++) {
            var object = objectMap[ids[j]];
            if (object) {
                objects.push(object);
            }
        }
        callback(null, objects);
    });
};


/**
 * Get objects
 * @param  {[type]}   getIds          [description]
 * @param  {[type]}   getObjectsByIds [description]
 * @param  {Function} callback        [description]
 * @return {[type]}                   [description]
 */
Base.getObjects = function(getIds, getObjectsByIds, callback) {
    getIds(function(err, ids) {
        if (err) {
            callback(err);
        } else {
            getObjectsByIds(ids, callback);
        }
    });
};

/**
 * Get object by id and the `getObjectsByIds` method
 * @param  {[type]}   id              [description]
 * @param  {[type]}   getObjectsByIds [description]
 * @param  {Function} callback        [description]
 * @return {[type]}                   [description]
 */
Base.getObject = function(id, getObjectsByIds, callback) {
    getObjectsByIds([id], function(err, results) {
        if (err) {
            callback(err);
        } else {
            if (results.length === 0) {
                callback(null, null);
            } else {
                callback(null, results[0]);
            }
        }
    });
};



/**
 * Batch set the properties of an object collection
 * @param {[type]}   objs                        [description]
 * @param {[type]}   getPropertyObjectsByIdsFunc [description]
 * @param {[type]}   getPropertyIdsFunc          [description]
 * @param {[type]}   getPropertyObjectIdFunc     [description]
 * @param {[type]}   setPropertyFunc             [description]
 * @param {Function} callback                    [description]
 */
Base.setPropertyForObjects = function(objs, getPropertyObjectsByIdsFunc, getPropertyIdsFunc, getPropertyObjectIdFunc, setPropertyFunc, callback) {
    if (!objs || objs.length === 0) {
        return callback(null, objs);
    }
    if (!getPropertyObjectIdFunc) {
        getPropertyObjectIdFunc = function(obj) {
            return obj.id;
        };
    }

    var ids = [];
    var pushIds = function(_ids) {
        _.forEach(_ids, function(id) {
            if (_.isNumber(id)) {
                ids.push(id);
            }
        });
    };
    // get all the object ids
    for (var i = 0; i < objs.length; i++) {
        var _ids = getPropertyIdsFunc(objs[i]);
        if (_.isNumber(_ids)) {
            _ids = [_ids];
        }
        if (_.isArray(_ids)) {
            pushIds(_ids);
        }
    }

    if (ids.length === 0) {
        return callback(null, objs);
    }

    // get objects by object ids
    getPropertyObjectsByIdsFunc(ids, function(err, propertyObjects) { //get the authors for objects
        if (err) {
            callback(err);
        } else {
            var objectMap = {};
            for (var j = 0; j < propertyObjects.length; j++) {
                var pid = getPropertyObjectIdFunc(propertyObjects[j]);
                if (!pid || pid <= 0) {
                    continue;
                }
                objectMap[pid] = propertyObjects[j];
            }
            var setProperties = function(obj) {
                var _ids = getPropertyIdsFunc(obj);
                if (!_.isArray(_ids)) {
                    _ids = [_ids];
                }
                _.forEach(_ids, function(id) {
                    setPropertyFunc(obj, objectMap[id], id); //set property for object
                });
            };
            for (var i = 0; i < objs.length; i++) {
                setProperties(objs[i]);
            }
            callback(null, objs);
        }
    });
};

/**
 * Caculate page count
 * @param  {[type]} itemsPerPage [description]
 * @param  {[type]} totalItems   [description]
 * @return {[type]}              [description]
 */
Base.calculateTotalPages = function(itemsPerPage, totalItems) {
    var totalPages = itemsPerPage < 1 ? 1 : Math.ceil(totalItems / itemsPerPage);
    return Math.max(totalPages || 0, 1);
};

/**
 * Get objects with pagination
 * @param  {[type]}   pagination      [description]
 * @param  {[type]}   getObjectsByIds [description]
 * @param  {Function} callback        [description]
 * @return {[type]}                   [description]
 */
Base.getPaginationObjects = function(pagination, getObjectsByIds, callback) {
    getObjectsByIds(pagination.ids, function(err, results) {
        if (err) {
            return callback(err);
        }
        var objectSet = {
            pagination: {
                page: pagination.pageIndex + 1,
                totalItems: pagination.totalCount,
                itemsPerPage: pagination.pageSize,
                totalPages: Base.calculateTotalPages(pagination.pageSize, pagination.totalCount),
            },
            items: results
        };
        callback(null, objectSet);
    });
}

module.exports = Base;