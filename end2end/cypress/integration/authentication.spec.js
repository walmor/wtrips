/// <reference types="Cypress" />

const AUTH_TOKEN_KEY = 'authToken';

function assertUserIsSignedIn(action) {
  action.should(() => {
    expect(localStorage.getItem(AUTH_TOKEN_KEY), 'Auth token should be set').not.to.be.null;
  });

  cy.location('pathname').should('eq', '/admin/trips');

  cy.get('.UserName').should('contain', name);
}

context('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.server();
    cy.route('POST', '/api/auth/signin').as('signin');
    cy.route('POST', '/api/auth/signup').as('signup');
  });

  specify('An user should be able to sign in', () => {
    const name = 'User';
    const email = 'user@example.com';
    const pwd = '123456';

    cy.get('#signinEmail')
      .type(email)
      .should('have.value', email);

    cy.get('#signinPassword')
      .type(pwd)
      .should('have.value', pwd)
      .type('{enter}');

    assertUserIsSignedIn(cy.wait('@signin'));
  });

  specify('An user should be able to sign out', () => {
    cy.signIn('user');

    cy.signOut();

    cy.location('pathname').should('eq', '/signin');

    cy.should(() => {
      expect(localStorage.getItem(AUTH_TOKEN_KEY), 'Auth token should be null').to.be.null;
    });
  });

  specify('An user should be able to sign up', () => {
    const name = 'John';
    const email = 'newuser@example.com';
    const pwd = '12345';

    cy.get('.SignIn .LinkButton').click();

    cy.get('#signupName')
      .type(name)
      .should('have.value', name);

    cy.get('#signupEmail')
      .type(email)
      .should('have.value', email);

    cy.get('#signupPassword')
      .type(pwd)
      .should('have.value', pwd);

    cy.get('#signupConfirmPassword')
      .type(pwd)
      .should('have.value', pwd)
      .type('{enter}');

    assertUserIsSignedIn(cy.wait('@signup'));
  });
});
