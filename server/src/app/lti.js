let lti = require("ims-lti");
let _ = require("lodash");
let https = require("https");
let HMAC_SHA = require("./hmac-sha1");
let utils = require("./utils");
let url = require("url");
let uuid = require("uuid");

//LTI Variables
let consumer_key = "12345";
let consumer_secret = "secret";
let lis_result_sourcedid = "";
let lis_outcome_service_url = "";
let return_url = "https://community.blackboard.com/community/developers";
let membership_url = "";
let placement_parm = "";
let sha_method = "";

//Caliper Variables
let caliper_profile_url = "";
let custom_caliper_federated_session_id = "";

//REST
let app_key = "d03caa33-1095-47b9-bc67-f5cd634430b1";
let app_secret = "QSFClAMu5KmoG8yFbHTi7pjhsseJl4uz";
let access_token = "";
let token_type = "";
let expires_in = "";
let user_id = "";
let course_id = "";

let oauth_consumer_key = "";
let oauth_nonce = "";

/*
 * POST LTI Launch Received
 */

exports.got_launch = function(req, res) {
  let provider = new lti.Provider(consumer_key, consumer_secret);
  req.body = _.omit(req.body, "__proto__");

  let content = "";

  let keys = Object.keys(req.body).sort();
  for (let i = 0, length = keys.length; i < length; i++) {
    content += keys[i] + " = " + req.body[keys[i]] + "<br />";
  }

  lis_result_sourcedid = req.body.lis_result_sourcedid;
  lis_outcome_service_url = req.body.lis_outcome_service_url;
  caliper_profile_url = req.body.custom_caliper_profile_url;
  custom_caliper_federated_session_id =
    req.body.custom_caliper_federated_session_id;
  oauth_consumer_key = req.body.oauth_consumer_key;
  oauth_nonce = req.body.oauth_nonce;
  course_id = req.body.context_id;
  user_id = req.body.user_id;
  return_url = req.body.launch_presentation_return_url;
  sha_method = req.body.oauth_signature_method;
  console.log("Signature Method: " + sha_method);

  if (req.body.custom_context_memberships_url !== undefined) {
    membership_url = req.body.custom_context_memberships_url;
    placement_parm = membership_url.substring(membership_url.indexOf("=") + 1);
  } else {
    membership_url = "";
    placement_parm = "";
  }

  if (return_url === undefined && caliper_profile_url !== undefined) {
    let parts = url.parse(caliper_profile_url, true);
    return_url = parts.protocol + "//" + parts.host;
  } else if (return_url === undefined) {
    return_url = "http://google.com";
  }

  res.render("lti", {
    title: "LTI Launch Received!",
    content: content,
    return_url: return_url,
    return_onclick: "location.href=" + "'" + return_url + "';"
  });
};

exports.outcomes = function(req, res) {
  res.render("outcomes", {
    title: "Enter Grade",
    sourcedid: lis_result_sourcedid,
    endpoint: lis_outcome_service_url,
    key: consumer_key,
    secret: consumer_secret
  });
};

exports.send_outcomes = function(req, res) {
  let options = {};

  options.consumer_key = req.body.key;
  options.consumer_secret = req.body.secret;
  options.service_url = req.body.url;
  options.source_did = req.body.sourcedid;

  let grade = parseFloat(req.body.grade);

  let outcomes_service = new lti.OutcomeService(options);

  outcomes_service.send_replace_result(grade, function(err, result) {
    console.log(result); //True or false

    if (result) {
      res.render("lti", {
        title: "Outcome successfully sent!",
        content: result,
        return_url: return_url,
        return_onclick: "location.href=" + "'" + return_url + "';"
      });
    } else {
      res.render("lti", {
        title: "Outcome Failed!",
        content: err,
        return_url: return_url,
        return_onclick: "location.href=" + "'" + return_url + "';"
      });
    }
  });
};

exports.rest_auth = function(req, res) {
  //build url from caliper profile url
  let parts = url.parse(caliper_profile_url, true);
  let oauth_host = parts.protocol + "//" + parts.host;

  let auth_hash = new Buffer(app_key + ":" + app_secret).toString("base64");

  let auth_string = "Basic " + auth_hash;

  console.log(
    "oauth_host: " +
      oauth_host +
      " auth_hash: " +
      auth_hash +
      " auth_string: " +
      auth_string
  );

  let options = {
    hostname: parts.hostname,
    path: "/learn/api/public/v1/oauth2/token",
    method: "POST",
    headers: {
      Authorization: auth_string,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  console.log(options);

  let http_req = https.request(options, function(http_res) {
    http_res.setEncoding("utf-8");
    let responseString = "";
    http_res.on("data", function(data) {
      responseString += data;
    });
    http_res.on("end", function() {
      console.log(responseString);
      let json = JSON.parse(responseString);
      access_token = json["access_token"];
      token_type = json["token_type"];
      expires_in = json["expires_in"];

      console.log(
        "Access Token: " +
          access_token +
          " Token Type: " +
          token_type +
          " Expires In: " +
          expires_in
      );

      res.render("lti", {
        title: "REST Token Response Received!",
        content: "<pre>" + JSON.stringify(json, null, "  ") + "</pre>",
        return_url: return_url,
        return_onclick: "location.href=" + "'" + return_url + "';"
      });
    });
  });

  let grant = "grant_type=client_credentials";

  http_req.write(grant);
  console.log(http_req);
  http_req.end();
};

exports.rest_getuser = function(req, res) {
  //build url from caliper profile url
  let parts = url.parse(caliper_profile_url, true);
  let oauth_host = parts.protocol + "//" + parts.host;

  let auth_string = "Bearer " + access_token;

  let user_path = "/learn/api/public/v1/users/uuid:" + user_id;

  let options = {
    hostname: parts.hostname,
    path: user_path,
    method: "GET",
    headers: { Authorization: auth_string }
  };

  console.log(options);

  let http_req = https.request(options, function(http_res) {
    http_res.setEncoding("utf-8");
    let responseString = "";
    http_res.on("data", function(data) {
      responseString += data;
    });
    http_res.on("end", function() {
      console.log(responseString);
      let json = JSON.parse(responseString);

      console.log("User Info: " + JSON.stringify(json, null, "  "));

      res.render("lti", {
        title: "REST User Info Received!",
        content: "<pre>" + JSON.stringify(json, null, "  ") + "</pre>",
        return_url: return_url,
        return_onclick: "location.href=" + "'" + return_url + "';"
      });
    });
  });

  http_req.write("");
  console.log(http_req);
  http_req.end();
};

exports.rest_getcourse = function(req, res) {
  //build url from caliper profile url
  let parts = url.parse(caliper_profile_url, true);
  let oauth_host = parts.protocol + "//" + parts.host;

  let auth_string = "Bearer " + access_token;
  let course_path = "/learn/api/public/v1/courses/uuid:" + course_id;

  let options = {
    hostname: parts.hostname,
    path: course_path,
    method: "GET",
    headers: { Authorization: auth_string }
  };

  console.log(options);

  let http_req = https.request(options, function(http_res) {
    http_res.setEncoding("utf-8");
    let responseString = "";
    http_res.on("data", function(data) {
      responseString += data;
    });
    http_res.on("end", function() {
      console.log(responseString);
      let json = JSON.parse(responseString);

      console.log("Course Info: " + JSON.stringify(json, null, "  "));

      res.render("lti", {
        title: "REST Course Info Received!",
        content: "<pre>" + JSON.stringify(json, null, "  ") + "</pre>",
        return_url: return_url,
        return_onclick: "location.href=" + "'" + return_url + "';"
      });
    });
  });

  http_req.write("");
  console.log(http_req);
  http_req.end();
};

exports.get_membership = function(req, res) {
  if (membership_url !== "") {
    let parts = url.parse(membership_url, true);

    let options = {
      consumer_key: consumer_key,
      consumer_secret: consumer_secret,
      url: parts.protocol + "//" + parts.host + parts.pathname, // Rebuild url without parameters
      oauth_version: "1.0",
      oauth_signature_method: sha_method
    };

    if (sha_method === "HMAC-SHA256") {
      options.signer = new HMAC_SHA.HMAC_SHA2();
    } else {
      options.signer = new HMAC_SHA.HMAC_SHA1();
    }

    let req_options = {
      hostname: parts.hostname,
      path: parts.path,
      method: "GET",
      headers: _build_headers(options, parts)
    };

    console.log(req_options);

    let http_req = https.request(req_options, function(http_res) {
      http_res.setEncoding("utf-8");
      let responseString = "";

      http_res.on("data", function(data) {
        responseString += data;
      });

      http_res.on("end", function() {
        let json = JSON.parse(responseString);

        res.render("lti", {
          title: "Membership Info Received",
          content: "<pre>" + JSON.stringify(json, null, "  ") + "</pre>",
          return_url: return_url,
          return_onclick: "location.href=" + "'" + return_url + "';"
        });
      });
    });

    http_req.write("");
    http_req.end();
  } else {
    res.render("lti", {
      title: "Membership service not supported",
      content: "<h2>Membership service not supported</h2>",
      return_url: return_url,
      return_onclick: "location.href=" + "'" + return_url + "';"
    });
  }
};

let _build_headers = function(options, parts) {
  let headers, key, val;

  headers = {
    oauth_version: options.oauth_version,
    oauth_nonce: uuid.v4(),
    oauth_timestamp: Math.round(Date.now() / 1000),
    oauth_consumer_key: options.consumer_key,
    oauth_signature_method: options.oauth_signature_method
  };

  headers.oauth_signature = options.signer.build_signature_raw(
    options.url,
    parts,
    "GET",
    headers,
    options.consumer_secret
  );
  //  console.log(options.oauth_signature_method + " signature: " + headers.oauth_signature);

  return {
    Authorization:
      'OAuth realm="",' +
      (function() {
        let results;
        results = [];
        for (key in headers) {
          val = headers[key];
          results.push(key + '="' + utils.special_encode(val) + '"');
        }
        return results;
      })().join(","),
    "Content-Type": "application/xml",
    "Content-Length": 0
  };
};
