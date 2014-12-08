/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');

require('../../styles/components/Tags.less');

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

module.exports = Tags;
