const { assert } = require('chai');

const { getUserByEmail } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: "dishwasher-funk"
  },
  "user4RandomID": {
    id: "user4RandomID", 
    email: "user4@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email #1', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email #2', function() {
    const user = getUserByEmail("user2@example.com", testUsers)
    const expectedUserID = "user2RandomID";
    assert.equal(user.id, expectedUserID)
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email #3', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedUserID = "user3RandomID";
    assert.equal(user.id, expectedUserID)
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email #4', function() {
    const user = getUserByEmail("user4@example.com", testUsers)
    const expectedUserID = "user4RandomID";
    assert.equal(user.id, expectedUserID)
  });
});

describe('getUserByEmail', function() {
  it('should fail looking for a user that doesnt exist', function() {
    const user = getUserByEmail("user7@example.com", testUsers)
    const expectedUserID = "user7RandomID";
    assert.equal(user.id, expectedUserID)
  });
});