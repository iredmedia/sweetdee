'use strict';

describe('Autocomplete', function () {
  var Autocomplete, autocomplete;

  beforeEach(function () {
    Autocomplete = require('../../../src/scripts/components/Autocomplete');
    autocomplete = Autocomplete({
      query: 'fooBar'
    });
  });

  it('should run a test', function () {
    expect(true).toBeTruthy();
  });

  it('should pass the correct query value to props', function () {
    expect(autocomplete.props.query).toMatch(/fooBar/);
  });
});
