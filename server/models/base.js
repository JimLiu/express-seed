var async = require('async'),
  utils = {};

utils.getObjectsByIds = function(ids, getObjectsByIds, getIdFromObject, callback) {
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


utils.calculateTotalPages = function(itemsPerPage, totalItems) {
  var totalPages = itemsPerPage < 1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  return Math.max(totalPages || 0, 1);
};

utils.getPaginationObjects = function(params, pageIndex, pageSize, getCountAndIds, getObjectsByIds, callback) {
  var _params, _pageIndex, _pageSize, _getCountAndIds, _getObjectsByIds;
  var getCountAndIdsCallback = function(err, totalCount, ids) {
    if (err) {
      callback(err);
    } else {
      _getObjectsByIds(ids, function(err, results) {
        if (err) {
          callback(err);
        } else {
          var objectSet = {
            pagination: {
              page: _pageIndex + 1,
              totalItems: totalCount,
              itemsPerPage: _pageSize,
              totalPages: utils.calculateTotalPages(_pageSize, totalCount),
            },
            items: results
          };
          callback(null, objectSet);
        }
      });
    }
  };

  if (arguments.length == 5) {
    _params = null;
    _pageIndex = params;
    _pageSize = pageIndex;
    _getCountAndIds = pageSize;
    _getObjectsByIds = getCountAndIds;
    callback = getObjectsByIds;
  } else {
    _params = params;
    _pageIndex = pageIndex;
    _pageSize = pageSize;
    _getCountAndIds = getCountAndIds;
    _getObjectsByIds = getObjectsByIds;
  }
  if (!_params || _params.length === 0) {
    _getCountAndIds(_pageIndex, _pageSize, getCountAndIdsCallback);
  } else {
    _getCountAndIds(_params, _pageIndex, _pageSize, getCountAndIdsCallback);
  }
};

utils.getObjectsFromMaxId = function(params, maxId, count, getIds, getObjectsByIds, callback) {
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

utils.getObject = function(id, getObjectsByIds, callback) {
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

utils.getObjectTagsMap = function(ids, getObjectIdsAndTagIdsAsyncFunc, getTagsAsncFunc, callback) {
  getObjectIdsAndTagIdsAsyncFunc(ids, function(err, objAndTagIds) {
    if (err) {
      callback(err);
    } else {
      var tagIds = [];
      var objId2TagIds = {};
      for (var i = 0; i < objAndTagIds.length; i++) {
        var objIdAndTagId = objAndTagIds[i];
        var objId = objIdAndTagId[Object.keys(objIdAndTagId)[0]]; // the first one is object id
        var tagId = objIdAndTagId[Object.keys(objIdAndTagId)[1]]; // the second one is tag id
        tagIds.push(tagId);

        if (!objId2TagIds[objId]) {
          objId2TagIds[objId] = [];
        }
        objId2TagIds[objId].push(tagId);
      }
      getTagsAsncFunc(tagIds, function(err, tags) {
        if (err) {
          callback(err);
        } else {
          var tagsMap = {};
          for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            tagsMap[tag.id] = tag;
          }
          var objIdTagsMap = {};
          for (var objId in objId2TagIds) {
            objIdTagsMap[objId] = [];
            var tagIds = objId2TagIds[objId];
            for (var j = 0; j < tagIds.length; j++) {
              var tagId = tagIds[j];
              if (tagsMap[tagId]) {
                objIdTagsMap[objId].push(tagsMap[tagId]);
              }
            }
          }
          callback(null, objIdTagsMap);
        }
      });
    }
  });
};

utils.setTagsForObjects = function(objs, getObjectIdFunc, getObjectTagsMapAsyncFunc, setTagsForObject, callback) {
  if (!objs || objs.length === 0) {
    return callback(null, objs);
  }
  var ids = [];
  var objMap = {};
  // get all the object ids
  for (var i = 0; i < objs.length; i++) {
    var id = getObjectIdFunc(objs[i]);
    ids.push(id);
    objMap[id] = objs[i];
  }
  getObjectTagsMapAsyncFunc(ids, function(err, objTagsMap) {
    if (err) {
      callback(err);
    } else {
      for (var objId in objTagsMap) {
        var obj = objMap[objId];
        if (obj) {
          setTagsForObject(obj, objTagsMap[objId]);
        }
      }
      callback(null, objs);
    }
  });
};

utils.setPropertyForObjects = function(objs, getPropertyObjectsByIdsFunc, getPropertyIdFunc, getPropertyObjectIdFunc, setPropertyFunc, callback) {
  if (!objs || objs.length === 0) {
    return callback(null, objs);
  }

  var ids = [];
  // get all the object ids
  for (var i = 0; i < objs.length; i++) {
    ids.push(getPropertyIdFunc(objs[i]));
  }

  // get objects by object ids
  getPropertyObjectsByIdsFunc(ids, function(err, propertyObjects) { //get the authors for objects
    if (err) {
      callback(err);
    } else {
      var objectMap = {};
      for (var j = 0; j < propertyObjects.length; j++) {
        objectMap[getPropertyObjectIdFunc(propertyObjects[j])] = propertyObjects[j];
      }
      for (var i = 0; i < objs.length; i++) {
        var obj = objs[i];
        var id = getPropertyIdFunc(obj);
        var propertyObj = objectMap[id];
        if (!propertyObj) {
          propertyObj = null;
          console.log("Can't find property by id: " + id);
        }
        setPropertyFunc(obj, propertyObj); //set property for object
      }
      callback(null, objs);
    }
  });
};

/*
utils.saveTags = function(object, tagNames, getTagNameFunc, getObjectTagsAsyncFunc, removeTagsAsyncFunc, addTagsAsyncFunc, callback) {
  var toBeRemovedTags = [];
  var toBeAddedTags = [];
  var newTagNameMap = {};
  var oldTagNameMap = {};
  for (var i = 0; i < tagNames.length; i++) {
    var tagName = tagNames[i];
    if (!tagName || tagName.trim().length === 0) {
      continue;
    }
    tagName = tagName.trim().toLowerCase();
    newTagNameMap[tagName] = tagName;
  }

  getObjectTagsAsyncFunc(object, function(err, tags) {
    if (err) {
      return callback(err);
    }
    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i];
      var tagName = getTagNameFunc(tag).toLowerCase();
      oldTagNameMap[tagName] = tagName;
      if (!newTagNameMap[tagName]) { // 移除
        toBeRemovedTags.push(tagName);
      }
    }
    for (var tagName in newTagNameMap) {
      if (!oldTagNameMap[tagName]) { // 新增
        toBeAddedTags.push(tagName);
      }
    }
    async.series([
      function(callback) {
        removeTagsAsyncFunc(object, toBeRemovedTags, callback);
      },
      function(callback) {
        addTagsAsyncFunc(object, toBeAddedTags, callback);
      },
      function(callback) {
        getObjectTagsAsyncFunc(object, callback);
      }
    ], function(err, results) {
      if (err) {
        callback(err);
      } else {
        callback(null, results[2]);
      }
    });
  });
};
*/

utils.saveObjectTags = function(id, tagNames, saveTagsAndGetIdsAsyncFunc, saveObjectTagsAsyncFunc, callback) {
  saveTagsAndGetIdsAsyncFunc(tagNames, function(err, tagIds) {
    if (err) {
      callback(err);
    } else {
      saveObjectTagsAsyncFunc(id, tagIds, callback);
    }
  });
};

module.exports = utils;
