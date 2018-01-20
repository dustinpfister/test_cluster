let http = require('http'),
cheerio = require('cheerio');

// I was making something that automates the process of finding rank for a given term and page, but there are limits to the number of requests that can be made from an ip.


let defaults = {

    //term: 'find lodash',
    //page: 'https://dustinpfister.github.io/2017/09/14/lodash-find/',
    term: 'jimp read',
    page: 'https://dustinpfister.github.io/2017/04/10/nodejs-jimp/',
    //term : 'phaser distance',
    //page : 'https://dustinpfister.github.io/2017/10/27/phaser-math-distance/',
    startPage: 0,
    maxPage: 3,
    perPage: 10

};

// get a single Google SERP page for the given term, and start rank
let getSERP = function (term, start) {

    term = term || defaults.term;
    start = start || defaults.startPage * defaults.perPage;

    // replace spaces with plus
    term = term.replace(/ /g, '+');

    // request options
    let options = {

        hostname: 'www.google.com',
        path: '/search?q=' + term + '&start=' + start,
        method: 'GET'

    };

    console.log('/search?q=' + term + '&start=' + start);

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

    // use given terms, or hard coded defaults
    argu.term = argu.term || defaults.term;
    argu.page = argu.page || defaults.page;

    argu.startPage = argu.startPage || defaults.startPage;
    argu.perPage = argu.perPage || defaults.perPage;
    // only go back a max of three pages
    argu.maxPage = argu.maxPage || 3;

    // by default rank is -1 (not found)
    let result = {

        page: argu.startPage,
        rank: -1

    };

    let start = result.page * argu.perPage;

    console.log('search term: ' + argu.term);
    console.log('looking for : ' + argu.page);
    console.log('on page: ' + result.page + '\/' + argu.maxPage);
    console.log('start: ' + start);

    return getSERP(argu.term, start).then(function (data) {

        let $ = cheerio.load(data),

        // get links
        links = $('h3').filter('.r').children('a'),

        // get the href attributes
        hrefs = [].map.call(links, function (el, i) {

            return $(el).attr('href');

        });

        console.log(data);

        let i = 0,
        len = hrefs.length;
        while (i < len) {

            let h = hrefs[i],
            match = h.match(argu.page);

            console.log(hrefs[i]);

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

    getRank({

        term: process.argv[2] || defaults.term,
        page: process.argv[3] || defaults.page,
        maxPage: process.argv[4] || defaults.maxPage

    }).then(function (data) {

        console.log(data);

    }).catch (function (e) {

        console.log(e);

    });

} else {

    // export get rank
    exports.getRank = getRank;

    // export getSerp
    exports.getSERP = getSerp;

}
