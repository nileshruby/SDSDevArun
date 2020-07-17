var suitehelp = {};
suitehelp.contexts = {
        
}
        // Check for a context-sensitive link and redirect if present (and valid)
suitehelp.checkContext = function () {
    "use strict";

    var context = suitehelp.contexts[suitehelp.getQueryString("context")],
        adjustedQS =  window.location.search.substring(1).replace(/context=[^&]+&|(&|^)context=[^&]+/, "");
    if (context) {
        if (adjustedQS) {
       
            document.location =  document.getElementsByTagName("head")[0].getAttribute("data-approot-head") + context + "?" + adjustedQS;
        } else {
            document.location =  document.getElementsByTagName("head")[0].getAttribute("data-approot-head") + context;
        }
    }

};

// Lookup a query string variable
suitehelp.getQueryString = function (key) {
    "use strict";

    if (!suitehelp.queryString) {
        suitehelp.queryString = {};
        var query = window.location.search.substring(1),
            vars = query.split("&"),
            i,
            pair;
        for (i = 0; i < vars.length; i += 1) {
            pair = vars[i].split("=");
            suitehelp.queryString[pair[0]] = decodeURIComponent(pair[1]);
        }
    }

    return suitehelp.queryString[key];
};

suitehelp.checkContext();