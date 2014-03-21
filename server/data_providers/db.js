var mysql         = require('mysql'),
    config        = require('../config'),
    logger        = require('../logger');

var db = {};

db.connect = function() {

  var connection = mysql.createConnection(config.database.connection);
  connection.connect(function(err) {
    if (err) {
      console.log("DB connection error: " + err);
      return false;
    } else {
      //console.log("DB connection success");
    }
  });

  return connection;
};

db.executeQuery = function(sql, params, callback) {
  var con = db.connect();

  var query = con.query(sql, params, function(err, results) {
    if (err) {
      logger.error(err);
      callback(err);
    } else {
      callback(null, results);
    }
  });
  //console.log(query.sql);
  con.end();
};

db.insertQuery = function(sql, params, getObjectById, callback) {
  db.executeQuery(sql, params, function(err, results) {
    if (err) {
      callback(err);
    } else {
      if (getObjectById) { // return the new object afater created
        getObjectById(results.insertId, callback);
      } else {
        callback(null, results);
      }
    }
  });
};

db.selectSingleObject = function(sql, params, callback) {
  db.executeQuery(sql, params, function(err, results) {
    if (err) {
      callback(err);
    } else {
      if (results.length == 1) {
        callback(null, results[0]);
      } else {
        callback(null, null);
      }
    }
  });
};

db.getIds = function(sql, params, callback) {
  var ids = [];
  db.executeQuery(sql, params, function(err, results) {
    if (err) {
      callback(err);
    } else {
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var id = result[Object.keys(result)[0]];
        ids.push(id);
      }
      callback(null, ids);
    }
  });
};

db.getId = function(sql, params, callback) {
  db.executeQuery(sql, params, function(err, results) {
    if (err) {
      callback(err);
    } else {
      var id = -1;
      if (results.length > 0) {
        var result = results[0];
        id = result[Object.keys(result)[0]];
      }
      callback(null, id);
    }
  });
};


db.executeQueryWithParamsAndIds = function(sql, params, ids, callback) {
  if (!ids || ids.length === 0) {
    callback(null, []);
    return;
  }
  params.push(ids);
  db.executeQuery(sql, params, callback);
};

db.getObjectsByParamsAndIds = function(sql, params, ids, callback) {
  db.executeQueryWithParamsAndIds(sql, params, ids, callback);
};

db.getObjectsByIds = function(sql, ids, callback) {
  db.getObjectsByParamsAndIds(sql, [], ids, callback);
};

db.getCountAndIds = function(countQueryStr, idsQueryStr, params, pageIndex, pageSize, callback) {
  db.count(countQueryStr, params, function(err, totalCount) { // 首先统计总记录数
    if (err) {
      callback(err);
    } else {
      if (totalCount > 0) {
        // 添加分页相关参数
        params.push(pageIndex * pageSize);
        params.push(pageSize);
        // 获取当前页的对象ids
        db.getIds(idsQueryStr, params, function(err, ids) {
          if (err) {
            callback(err);
          } else {
            callback(err, totalCount, ids);
          }
        });
      } else {
        callback(null, 0, []);
      }
    }
  });
};

db.updateFields = function(tableName, idColumnName, idValue, fields, callback) {

  var updateStr = '',
    params = [],
    fieldsArr = [],
    field,
    queryStr;

  for (field in fields) {
    if (field == idColumnName)
      continue;
    fieldsArr.push(field + '=?');
    params.push(fields[field]);
  }

  params.push(idValue);

  updateStr = fieldsArr.join(', ');
  queryStr = "UPDATE " + tableName + " SET " + updateStr + " WHERE " + idColumnName + " = ?",

  db.executeQuery(queryStr, params, callback);
};

db.exists = function(sql, params, callback) {
  db.count(sql, params, function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result > 0); // return the result
    }
  });
};

db.count = function(sql, params, callback) {
  db.executeQuery(sql, params, function(err, results) {
    if (err) {
      callback(err);
    } else {
      callback(null, results[0].count);
    }
  });
};

db.saveTags = function(tableName, columnName, tags, callback) {

  var queryStr = "select ?? from ?? where ?? in (?)";
  db.executeQuery(queryStr, [columnName, tableName, columnName, tags], function(err, results) {
    if (err) {
      callback(err);
    } else {
      var filtedTags = tags.slice(0);
      for (var i = 0; i < results.length; i++) {
        var tag = results[i][columnName];
        var index = filtedTags.indexOf(tag);
        if (index > -1) {
          filtedTags.splice(index, 1);
        }
      }
      if (filtedTags.length > 0) {
        var newTags = [];
        filtedTags.forEach(function(tag) {
          newTags.push([tag, 0]);
        });
        queryStr = "insert into ?? (??, count) values ?";
        db.executeQuery(queryStr, [tableName, columnName, newTags], callback);
      } else {
        callback(null, true);
      }
    }
  });
};

/*
db.saveTags = function(callback) {

  var queryStr = "UPDATE tags t, posts_tags pt \
        SET t.count = t.count - 1 \
        WHERE pt.tag_id = t.id \
        AND pt.post_id = 1;";
  queryStr = "DELETE FROM posts_tags where post_id = 1;

INSERT INTO posts_tags values (1, 1), (2,1)";

};
*/

module.exports = db;
