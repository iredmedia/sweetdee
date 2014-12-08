/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var Tags = require('./Tags.jsx');

// var ImageBox = require('./ImageBox');

// CSS
require('../../styles/reset.css');
require('../../styles/components/App.less');

var App = React.createClass({
    getInitialState: function() {
        return {
            query: '',
            tags: [],
            results: [],
            next: ''
        }
    },

    // On type, update query
    updateQuery: function (e){
        this.setState({query: e.target.value})
    },

    addSelected: function  (argument) {
        this.setState({
            "selected": argument
        })
    },

    // @todo: refactor this
    imgurAlbum: function(id) {
        $.ajax({
            url: 'https://api.imgur.com/3/album/'+ id +'/images',
            headers: {
                Authorization: 'Client-ID e567945caf3581e'
            },
            type: 'GET',
            success: function(res) {
                obj[res.data[0].link] = [];

                // No title with most albums.... what to do? grab from variable passed in
                placeMedia(res.data[0].link, res.data[0].title, true);

                for (var i in res.data) {
                    // Create a list under this links ID
                    obj[res.data[0].link].push(res.data[i].link);
                }
            }
        });
    },

    // Retrieves
    getMulti: function (query, isLoadMore) {
        if (!isLoadMore) this.addSelected(query); // Action is

        var fn = function (response) {
            // Get IMGUR images ONLY.
            var imgList = [];
            var oldList = this.state.results;

            response.data.children.forEach(function (child) {
                var src = child.data.url;
                var albumId = src.split('/')[src.split('/').length - 1];
                var alt = child.data.title;
                var domain = child.data.domain;

                // Ensure some data exists in URL
                if (child.data.url && domain.indexOf('imgur.com') >= 0) {
                    // Ensure it is from DOMAIN imgur

                    // Check for gallery/albums
                    if (src.indexOf('/gallery/') >= 0 || src.indexOf('/a/') >= 0 ) {

                        console.log("GET imgur album thumbnail (first image in return of album)");

                        // Get Gallery IMAGES
                        imgList.push({
                            "url": src,
                            "title": alt,
                            "albumImages": albumId
                        });

                        return;
                    }

                    // Check for an IMAGE
                    if (src.lastIndexOf('.') >= src.length - 8){
                        if (src.indexOf('gifv') >= 0) return;

                        // placeMedia(src, alt);
                        imgList.push({
                            "url": src,
                            "title": alt
                        });

                        return;
                    }

                    imgList.push({
                        "url": src + '.jpg',
                        "title": alt
                    });
                }
            });

            this.setState({
                "results": oldList.concat(imgList),
                "next": response.data.after
            });
        }.bind(this)

        if (!this.state.next) {
            // use reddit.subredditsByTopic(query).fetch(); to get a list of subreddits to query
            reddit.hot(query).limit(25).fetch(fn);

            return;
        }

        reddit.hot(query).limit(25).after(this.state.next).fetch(fn);
    },

    // Submit a new SEARCH for subreddits
    subredditSearch: function() {
        // If no request for tags, return
        if ( !this.state.query ) return;

        var query = this.state.query;

        // Get subreddits
        reddit.subredditsByTopic(query).fetch(function(subreddits) {
            this.setState({'tags': subreddits})
        }.bind(this))
    },

    // Do some keyboard action while in search
    onKeyUp: function (event) {
        // Enter key
        if (event.which === 13) {
            this.subredditSearch();
        }
    },

    // Attached to loadmore button, triggers a "NEXT/AFTER" operation to load more based on current set of tags
    onLoadMore: function () {
        this.getMulti(this.state.selected, true)
    },

    openPreview: function (argument) {
        console.log(argument)
    },

    render: function() {
        var index = 0;

        var renderResult = function (result) {
            return (
                <a onClick={this.openPreview} key={index++}>
                    <img src={result.url} alt={result.alt} />
                </a>
            )
        }.bind(this)

        return (<div>
            <div className="controls">
                <input onKeyUp={this.onKeyUp} onChange={this.updateQuery} id="search" type="text" placeholder="Eg: pics"></input>

                <button onClick={this.subredditSearch} id="submit">Search</button>

                <Tags onAddTag={this.getMulti} tags={this.state.tags} selected={this.state.selected} />

                <button id="load-more" onClick={this.onLoadMore}>Load More</button>

            </div>

            <div id="results">
                {this.state.results.map(renderResult)}
            </div>
        </div>);
    }
});

React.renderComponent(<App />, document.getElementById('content')); // jshint ignore:line

module.exports = App;
