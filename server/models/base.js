var async = require('async'),
  Base = {};

Base.getObjectsByIds = function(ids, getObjectsByIds, getIdFromObject, callback) {
  if (arguments.length == 3) {
    callback = getIdFromObject;
    getIdFromObject = null;
  }

  getObjectsByIds(ids, function(err, results) {
    var objectMap = {};
    var objects = [];
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      var id = getIdFromObject ? getIdFromObject(result) : result.id;
      objectMap[id] = result;
    }

    for (var j = 0; j < ids.length; j++) {
      var object = objectMap[ids[j]];
      if (object) {
        objects.push(object);
      }
    }
    callback(null, objects);
  });
};

Base.getObjects = function(getIds, getObjectsByIds, callback) {
  getIds(function(err, ids) {
    if (err) {
      callback(err);
    } else {
      getObjectsByIds(ids, callback);
    }
  });
};


Base.calculateTotalPages = function(itemsPerPage, totalItems) {
  var totalPages = itemsPerPage < 1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  return Math.max(totalPages || 0, 1);
};

Base.getPaginationObjects = function(pageIndex, pageSize, getCountAndIds, getObjectsByIds, callback) {
  getCountAndIds(pageIndex, pageSize, function(err, totalCount, ids) {
    if (err) {
      return callback(err);
    }
    getObjectsByIds(ids, function(err, results) {
      if (err) {
        return callback(err);
      }
      var objectSet = {
        pagination: {
          page: pageIndex + 1,
          totalItems: totalCount,
          itemsPerPage: pageSize,
          totalPages: Base.calculateTotalPages(pageSize, totalCount),
        },
        items: results
      };
      callback(null, objectSet);
    });
  });
};

Base.getObjectsFromMaxId = function(params, maxId, count, getIds, getObjectsByIds, callback) {
  getIds(params, function(err, ids) {
    if (err) {
      callback(err);
    } else {
      if (typeof(maxId) == 'string') {
        maxId = parseInt(maxId);
      }
      var start_index = ids.indexOf(maxId) + 1;
      var pagedIds = ids.slice(start_index, start_index + count);
      getObjectsByIds(pagedIds, callback);
    }
  });
};

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

Base.getObjectByKey = function(getIdByKey, getObjectById, callback) {
  getIdByKey(function(err, id) {
    if (err) {
      return callback(err);
    }
    getObjectById(id, callback);
  });
};


Base.setPropertyForObjects = function(objs, getPropertyObjectsByIdsFunc, getPropertyIdFunc, getPropertyObjectIdFunc, setPropertyFunc, callback) {
  if (!objs || objs.length === 0) {
    return callback(null, objs);
  }

  var ids = [];
  // get all the object ids
  for (var i = 0; i < objs.length; i++) {
    var id = getPropertyIdFunc(objs[i]);
    if (id && id > 0) {
      ids.push(id);
    } else {
      setPropertyFunc(objs[i], null);
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
      for (var i = 0; i < objs.length; i++) {
        var obj = objs[i];
        var id = getPropertyIdFunc(obj);
        var propertyObj = objectMap[id];
        if (!propertyObj) {
          propertyObj = null;
        }
        setPropertyFunc(obj, propertyObj); //set property for object
      }
      callback(null, objs);
    }
  });
};

module.exports = Base;


