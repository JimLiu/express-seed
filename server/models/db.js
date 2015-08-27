var mysql = require('mysql'),
    config = require('../config'),
    logger = require('../logger');

var db = {};

/**
 * Connect to mysql server
 * @return {[type]} [description]
 */
db.connect = function() {

    var connection = mysql.createConnection(config.mysql);
    connection.connect(function(err) {
        if (err) {
            logger.error("DB connection error: " + err);
            return false;
        }
    });

    connection.on('close', function (err) {
        logger.error('mysqldb conn close');
    });

    connection.on('error', function (err) {
        logger.error('mysqldb error: ' + err);
    });

    return connection;
};

/**
 * Execute a query, and return the results.
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.executeQuery = function(sql, params, callback) {
    var con = db.connect();

    var query = con.query(sql, params, function(err, results) {
        if (err) {
            logger.error('sql: ', query.sql, 'query string', sql, 'params', params, ' err: ', err);
            callback(err);
        } else {
            callback(null, results);
        }
    });
    //console.log(query.sql);
    con.end();
    return query;
};

/**
 * Insert a record to table, and return the new object.
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.insertQuery = function(sql, params, callback) {
    return db.executeQuery(sql, params, function (err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results.insertId);
        }
    });
};

/**
 * Execute sql to get a single object
 * If there is no result, return null
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.getObject = function(sql, params, callback) {
    return db.executeQuery(sql, params, function(err, results) {
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

/**
 * Help to get id array from the query result when query like 'select id from table'.
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.getIds = function(sql, params, callback) {
    var ids = [];
    return db.executeQuery(sql, params, function(err, results) {
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

/**
 * Get a single row and a sigle colmun
 * e.g. select id from users where name='jim'
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.getId = function(sql, params, callback) {
    return db.executeQuery(sql, params, function(err, results) {
        if (err) {
            callback(err);
        } else {
            var id = null;
            if (results.length > 0) {
                var result = results[0];
                id = result[Object.keys(result)[0]];
            }
            callback(null, id);
        }
    });
};

/**
 * Get objects by id array from database.
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {[type]}   ids      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.executeQueryWithParamsAndIds = function(sql, params, ids, callback) {
    if (!ids || ids.length === 0) {
        callback(null, []);
        return;
    }
    if (!params) {
        params = [];
    } else if (Object.prototype.toString.call(params) !== '[object Array]') {
        params = [params];
    }
    params.push(ids);
    return db.executeQuery(sql, params, callback);
};

db.getObjectsByParamsAndIds = function(sql, params, ids, callback) {
    return db.executeQueryWithParamsAndIds(sql, params, ids, callback);
};

db.getObjectsByIds = function(sql, ids, callback) {
    return db.getObjectsByParamsAndIds(sql, [], ids, callback);
};

db.executeQueryWithIds = function(sql, ids, callback) {
    return db.getObjectsByParamsAndIds(sql, [], ids, callback);
};

db.getCountAndIds = function(countQueryStr, idsQueryStr, params, pageIndex, pageSize, callback) {
    return db.count(countQueryStr, params, function(err, totalCount) { // 首先统计总记录数
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
                        callback(err, {
                            pageIndex: pageIndex,
                            pageSize: pageSize,
                            totalCount: totalCount,
                            ids: ids
                        });
                    }
                });
            } else {
                callback(null, {
                            pageIndex: pageIndex,
                            pageSize: pageSize,
                            totalCount: 0,
                            ids: []
                        });
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
    queryStr = "UPDATE " + tableName + " SET " + updateStr + " WHERE " + idColumnName + " = ?";

    return db.executeQuery(queryStr, params, callback);
};

/**
 * Check if any records exists.
 * @param  {[type]}   sql      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
db.exists = function(sql, params, callback) {
    return db.count(sql, params, function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result > 0); // return the result
        }
    });
};

db.count = function(sql, params, callback) {
    return db.executeQuery(sql, params, function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results[0].count);
        }
    });
};

module.exports = db;