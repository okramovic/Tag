$(document).ready(function() {
    $('#triggerIcon').on('click', function(event) {
        console.log('Clicked icon');
        console.log(event);
        console.log('test');
    });
});

/**
 * @description a template for creating an API caller
 * @example
 * const myAPI = new API('http://example.org/api/');
 * myAPI.myOwnAPICall = function() {
 *   var args = {
 *      action: 'test',
 *      something: 'something'
 *   };
 *   return this.apiCall(args, 'GET');
 * };
 * 
 * myApi.myOwnAPICall()
 *  .then(response => console.log(response))
 *  .catch(error => console.error(error));
 */
class API {
    constructor(baseUrl) {
        this.baseUrl =  baseUrl;
    }

    /** apiCall
     * @param {object}  args - the arguments passed to the api call
     * @param {string}  [subPath='']    - to make an apicall to baseUrl + subpath
     * @param {string}  [method='GET']  - the method used for the api call
     * @returns {Promise<response>}
     * @example
     * var args = {
     *    action: 'signup',
     *    username: 'Tom',
     *    email: 'Tom@tom.tom',
     *    password: '1234b4'
     * };
     * apiCall(args, 'account/', 'POST');
     */
    apiCall(args, subPath='', method='GET') {
        const url = this.baseUrl + subPath;
        switch(method) {
            case 'GET': {
                // Convert args object to parameter string	
                const parameterString = '?' + Object.entries(args).map(argPair => argPair.join('=')).join('&');
                return this._get(url + parameterString);
                break;
            }
            case 'POST': {
                return this._post(url, args);
                break;
            }
            default: {
                return Promise.reject('unsupported method');
            }
        }
    }
    _get(url) {
        return new Promise((resolve, reject) => {
            $.getJSON(url)
                .done(resolve)
                .fail(reject);
        });
    }
    _post(url, args) {
        return new Promise((resolve, reject) => {
            $.post(url, args)
                .done(resolve)
                .fail(reject);
        });
    }
}

// Create API
const tagAPI = new API('http://www.mocky.io/v2/5a16ec423100002a1e8d34a2/');

// Add function
tagAPI.addTag = function(tag) {
    const args = {
    };
    return this.apiCall(args);
};

// Call function
tagAPI.addTag('hello world')
    .then(function(response) {
        console.log(response);
    })
    .catch(console.error);


 
const client = new stitch.StitchClient('tag-mjydj'); 
const db = client.service('mongodb', 'mongodb-atlas').db('test');

    
    
client.login()
    .then(() => {
        db.collection('garbageCollection').insertOne({
            "message": "test_n"
        });        
    })
    .then(() => {
        console.log(db.collection('garbageCollection').find({}));

        db.collection('garbageCollection').find({}).limit(100).execute(); // db.collection(...).find(...).limit is not a function
    })    
    .then(docs => {  
        console.log("Found docs", docs);
        console.log("[MongoDB Stitch] Connected to Stitch");
    })
    .catch(err => {
        console.error(err);
    });