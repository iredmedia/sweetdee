/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

// var ImageBox = require('./ImageBox');

// CSS
require('../../styles/reset.css');
require('../../styles/app.less');

// Contains SEARCHED tag list and SELECTED tag list
var Tags = React.createClass({
    getInitialState: function () {
        return {
            selected: []
        }
    },
    addTag: function (e) {
        var tag = e.target.innerText;
        var selectedTags = this.state.selected;

        if (selectedTags.indexOf(tag) > -1) return;
        
        selectedTags = selectedTags.concat(tag);
       
        this.setState({
            'selected': selectedTags
        });
        
        this.props.onAddTag(selectedTags.join('+'));
    },
    removeTag: function (e){
        var tags = this.state.selected;
        
        // Splice the clicked value out
        tags.splice(this.state.selected.indexOf(e.target.innerText) , 1);
        
        // Update components tag list
        this.setState({
            'selected':  tags
        });
    },
    render: function () {    
        var tagItem = function (tag) {
               return (<li key={tag.name} onClick={this.addTag}>{tag.name}</li>);
        }
        var selectedItem = function (name, i) {
               return (<li key={name + i} onClick={this.removeTag}>{name}</li>);
        }

        return ( 
            <div className={'tagLists'}>
                <ul className={"tags"}> 
                    {this.props.tags.map(tagItem, this)}
                </ul>
                
                <ul className={'selected'}>
                    {this.state.selected.map(selectedItem, this)}
                </ul>
            </div>
        );
    }
});

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

    // @todo: refactor this 
    imgurAlbum: function(id){
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
    
    getMulti: function (query) {
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

    console.log(response);

            this.setState({
                "results": imgList.concat(oldList),
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

    subredditSearch: function() {
        // If no request for tags, return
        if ( !this.state.query ) return;
        
        var query = this.state.query;
        
        // Get subreddits
        reddit.subredditsByTopic(query).fetch(function(subreddits) {
            this.setState({'tags': subreddits})
        }.bind(this))
    },

    onLoadMore: function () {
        this.getMulti(this.state.query)
    },
    
    render: function() {
        var index = 0;

        var renderResult = function (result) {
            return (
                <a key={index++}>
                    <img src={result.url} alt={result.alt} />
                </a>
            )
        }

        return (<div>
            <div className="controls">                
                <input onChange={this.updateQuery} id="search" type="text" placeholder="Eg: pics"></input>
                
                <button onClick={this.subredditSearch} id="submit">Search</button>
                
                <Tags onAddTag={this.getMulti} tags={this.state.tags} />
                
                <button id="load-more" onClick={this.onLoadMore}>Load More</button>

            </div>
            
            <div id="results">
                {this.state.results.map(renderResult)}
            </div>
        </div>);
    }
});
 
// React.render(<App />, document.body);






React.renderComponent(<App />, document.getElementById('content')); // jshint ignore:line

module.exports = App;
