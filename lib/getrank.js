let http = require('http'),
cheerio = require('cheerio');

// get a Google SERP page for the given term, and start rank
let getSERP = function (term, start) {

    term = term || 'lodash find example';
    start = start || 0;

    // replace spaces with plus
    term = term.replace(/ /g, '+');

    // request options
    let options = {

        hostname: 'www.google.com',
        path: '/search?q=' + term + '&start=' + start,
        method: 'GET'

    };

    // return a new promise with the given options
    return new Promise(function (resolve, reject) {

        let data = '';

        let req = http.request(options, function (res) {

                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function () {

                    resolve(data);

                });
            });

        req.on('error', function (e) {

            reject(e);

        });

        req.end();

    });

};

// Get Rank for the given term, and page

// get google SERP page rank for a page, and search term
getRank = function (argu) {

    argu = argu || {};

    // hard coded default is my page on lodash find that is doing well.
    argu.term = argu.term || 'lodash find example';
    argu.page = argu.page || 'https://dustinpfister.github.io/2017/09/14/lodash-find/';

    argu.startPage = argu.startPage || 0;
    // only go back a max of three pages
    argu.maxPage = 3;

    // by default rank is -1 (not found)
    let result = {

        page: argu.startPage,
        rank: -1

    };

    let start = result.page * 10;

    console.log('search term: ' + argu.term);
    console.log('looking for : ' + argu.page);
    console.log('on page: ' + result.page + '\/' + argu.maxPage);

    return getSERP(argu.term, start).then(function (data) {

        let $ = cheerio.load(data),

        // get links
        links = $('h3').filter('.r').children('a'),

        // get the href attributes
        hrefs = [].map.call(links, function (el, i) {

            return $(el).attr('href');

        });

        let i = 0,
        len = hrefs.length;
        while (i < len) {

            let h = hrefs[i],
            match = h.match(argu.page);

            if (match) {

                result.rank = start + i;
                break;

            }

            i += 1;
        }

        return result;

    }).then(function () {

        if (result.rank == -1 && result.page < argu.maxPage) {

            // can again on next page
            argu.startPage = result.page += 1;
            return getRank(argu);

        }

        return result;

    }).catch (function (e) {

        return e;

    });

};

let isCLI = require.main === module;

if (isCLI) {

    //let term = process.argv[2] || 'lodash find example',
    //page = process.argv[3] || 'https://dustinpfister.github.io/2017/09/14/lodash-find/';

    let term = process.argv[2] || 'jimp read',
    page = process.argv[3] || 'https://dustinpfister.github.io/2017/04/10/nodejs-jimp/';

    getRank({

        term: term,
        page: page

    }).then(function (data) {

        console.log(data);

    }).catch (function (e) {

        console.log(e);

    });

}
